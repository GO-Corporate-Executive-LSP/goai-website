// Mock trip data for testing
export const mockTrip = {
  pickup: {
    address: "123 Main St, Charlotte NC",
    datetime: "2025-01-20T18:30:00",
    timezone: "America/New_York"
  },
  dropoff: {
    address: "Steak 48, Charlotte NC"
  },
  return: {
    pickup_datetime: "2025-01-20T21:00:00"
  },
  passengers: 2,
  luggage: 0,
  tier: {
    name: "GO_BIZZ"
  },
  sentinel_snapshot: {
    risk_level: "low"
  },
  state: "draft"
};
