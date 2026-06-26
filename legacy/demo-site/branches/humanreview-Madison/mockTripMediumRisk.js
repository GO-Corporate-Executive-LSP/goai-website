// Mock trip data for MEDIUM risk testing (late night pickup)
export const mockTripMediumRisk = {
  pickup: {
    address: "123 Main St, Charlotte NC",
    datetime: "2025-01-20T23:30:00", // Late night - MEDIUM risk
    timezone: "America/New_York"
  },
  dropoff: {
    address: "Steak 48, Charlotte NC"
  },
  return: {
    pickup_datetime: "2025-01-21T02:00:00"
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
