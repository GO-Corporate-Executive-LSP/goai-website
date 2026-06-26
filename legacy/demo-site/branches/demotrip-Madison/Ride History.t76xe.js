import wixUsers from 'wix-users';
import wixData from 'wix-data';

// Top-level keys from `src/backend/etas/tripSchema.v1.js` (used for display ordering)
const TRIP_SCHEMA_ORDER = [
    'trip_id',
    'user_id',
    'state',
    'pickup',
    'dropoff',
    'return',
    'passengers',
    'luggage',
    'tier',
    'sentinel_snapshot',
    'approval',
    'execution',
    'automation',
];

$w.onReady(async function () {
    try {
        const trips = await loadTripsForCurrentMember();
        console.log(`Loaded ${trips.length} trip(s) for current member.`);

        $w('#Section1Repeater').data = trips;
        $w('#Section1Repeater').onItemReady(($item, itemData) => {
            const lines = formatTripForDisplay(itemData);
            const text = lines.join('\n');

            // Prefer a dedicated details element if you add one; fallback to #tripDateText.
            if (!trySetText($item, '#tripDetailsText', text)) {
                trySetText($item, '#tripDateText', text);
            }
        });
    } catch (err) {
        console.error('Failed to load trips:', err);
    }
});

/**
 * Loads all "Trips" where Trips.userId === current member's PrivateMembersData._id
 */
async function loadTripsForCurrentMember() {
    // 1) Must be logged in to have a member record.
    if (!wixUsers.currentUser.loggedIn) {
        throw new Error('User is not logged in.');
    }

    const memberId = wixUsers.currentUser.id; // same as PrivateMembersData._id

    // 2) Query Trips where userId equals that id (paginate to get all items).
    const allTrips = [];
    let res = await wixData.query('Trips')
        .eq('userId', memberId)
        .limit(1000)
        .find();

    allTrips.push(...(res.items || []));

    while (res.hasNext()) {
        res = await res.next();
        allTrips.push(...(res.items || []));
    }

    // Optional: sort newest-first if you have a date field like "startTime"
    // allTrips.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    return allTrips;
}

function formatTripForDisplay(tripItem) {
    // Flatten ALL fields on the trip item (including nested objects/arrays),
    // but show schema keys first, then any additional keys that exist in the collection.
    const flattened = flattenAny(tripItem);

    const orderedKeys = [
        ...TRIP_SCHEMA_ORDER
            .flatMap((k) => Object.keys(flattened).filter((fk) => fk === k || fk.startsWith(`${k}.`) || fk.startsWith(`${k}[`))),
        ...Object.keys(flattened).filter((k) => !TRIP_SCHEMA_ORDER.some((s) => k === s || k.startsWith(`${s}.`) || k.startsWith(`${s}[`))),
    ];

    // De-dupe while preserving order
    const seen = new Set();
    const keys = orderedKeys.filter((k) => (seen.has(k) ? false : (seen.add(k), true)));

    return keys.map((k) => `${k}: ${stringifyForDisplay(flattened[k])}`);
}

function flattenAny(value, prefix = '', out = {}) {
    if (value === null || value === undefined) {
        if (prefix) out[prefix] = value;
        return out;
    }

    const t = typeof value;
    if (t !== 'object') {
        if (prefix) out[prefix] = value;
        return out;
    }

    if (value instanceof Date) {
        if (prefix) out[prefix] = value.toISOString();
        return out;
    }

    if (Array.isArray(value)) {
        if (!prefix) {
            // root arrays are unusual; still flatten them
            value.forEach((v, i) => flattenAny(v, `[${i}]`, out));
            return out;
        }

        if (value.length === 0) {
            out[prefix] = [];
            return out;
        }

        value.forEach((v, i) => {
            const key = `${prefix}[${i}]`;
            flattenAny(v, key, out);
        });
        return out;
    }

    const entries = Object.entries(value);
    if (entries.length === 0) {
        if (prefix) out[prefix] = {};
        return out;
    }

    for (const [k, v] of entries) {
        const key = prefix ? `${prefix}.${k}` : k;
        flattenAny(v, key, out);
    }

    return out;
}

function stringifyForDisplay(v) {
    if (v === null) return 'null';
    if (v === undefined) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);

    // fallback for arrays/objects that we left un-flattened (e.g., empty ones)
    try {
        return JSON.stringify(v);
    } catch (_) {
        return String(v);
    }
}

function trySetText($item, selector, text) {
    try {
        const el = $item(selector);
        // Text elements in Wix accept string; if it's not a text element, this may throw.
        el.text = text;
        return true;
    } catch (_) {
        return false;
    }
}
 