export interface Coords { lat: number; lng: number }

// ─────────────────────────────────────────────────────────────────────────────
// CITY / LOCATION MAP  (location_mkmbv7be → coords)
//
// Keys must exactly match the text stored in the Monday.com location column.
// Add new entries at the bottom of each region block — the structure is
// intentionally flat so a non-engineer can extend it without touching code.
// ─────────────────────────────────────────────────────────────────────────────

export const COORDINATE_MAP: Record<string, Coords> = {
  // ── Israel ──────────────────────────────────────────────────────────────────
  'Tel Aviv':          { lat:  32.0853, lng:  34.7818 },
  'Jerusalem':         { lat:  31.7683, lng:  35.2137 },
  'Haifa':             { lat:  32.7940, lng:  34.9896 },
  'Beer Sheva':        { lat:  31.2530, lng:  34.7915 },
  'Eilat':             { lat:  29.5581, lng:  34.9482 },

  // ── North America ───────────────────────────────────────────────────────────
  'New York':          { lat:  40.7128, lng: -74.0060 },
  'Los Angeles':       { lat:  34.0522, lng: -118.2437 },
  'Chicago':           { lat:  41.8781, lng: -87.6298 },
  'Miami':             { lat:  25.7617, lng: -80.1918 },
  'Toronto':           { lat:  43.6532, lng: -79.3832 },
  'Montreal':          { lat:  45.5017, lng: -73.5673 },
  'Vancouver':         { lat:  49.2827, lng: -123.1207 },
  'Mexico City':       { lat:  19.4326, lng: -99.1332 },

  // ── South America ───────────────────────────────────────────────────────────
  'Buenos Aires':      { lat: -34.6037, lng: -58.3816 },
  'São Paulo':         { lat: -23.5505, lng: -46.6333 },
  'Rio de Janeiro':    { lat: -22.9068, lng: -43.1729 },
  'Santiago':          { lat: -33.4489, lng: -70.6693 },

  // ── Europe ──────────────────────────────────────────────────────────────────
  'London':            { lat:  51.5074, lng:  -0.1278 },
  'Paris':             { lat:  48.8566, lng:   2.3522 },
  'Berlin':            { lat:  52.5200, lng:  13.4050 },
  'Amsterdam':         { lat:  52.3676, lng:   4.9041 },
  'Brussels':          { lat:  50.8503, lng:   4.3517 },
  'Madrid':            { lat:  40.4168, lng:  -3.7038 },
  'Barcelona':         { lat:  41.3851, lng:   2.1734 },
  'Rome':              { lat:  41.9028, lng:  12.4964 },
  'Milan':             { lat:  45.4654, lng:   9.1859 },
  'Vienna':            { lat:  48.2082, lng:  16.3738 },
  'Zurich':            { lat:  47.3769, lng:   8.5417 },
  'Geneva':            { lat:  46.2044, lng:   6.1432 },
  'Stockholm':         { lat:  59.3293, lng:  18.0686 },
  'Oslo':              { lat:  59.9139, lng:  10.7522 },
  'Copenhagen':        { lat:  55.6761, lng:  12.5683 },
  'Warsaw':            { lat:  52.2297, lng:  21.0122 },
  'Budapest':          { lat:  47.4979, lng:  19.0402 },
  'Prague':            { lat:  50.0755, lng:  14.4378 },
  'Bucharest':         { lat:  44.4268, lng:  26.1025 },
  'Athens':            { lat:  37.9838, lng:  23.7275 },
  'Kyiv':              { lat:  50.4501, lng:  30.5234 },
  'Moscow':            { lat:  55.7558, lng:  37.6173 },

  // ── Middle East & Africa ────────────────────────────────────────────────────
  'Istanbul':          { lat:  41.0082, lng:  28.9784 },
  'Dubai':             { lat:  25.2048, lng:  55.2708 },
  'Amman':             { lat:  31.9454, lng:  35.9284 },
  'Cairo':             { lat:  30.0444, lng:  31.2357 },
  'Casablanca':        { lat:  33.5731, lng:  -7.5898 },
  'Johannesburg':      { lat: -26.2041, lng:  28.0473 },
  'Cape Town':         { lat: -33.9249, lng:  18.4241 },
  'Nairobi':           { lat:  -1.2921, lng:  36.8219 },
  'Lagos':             { lat:   6.5244, lng:   3.3792 },

  // ── Asia-Pacific ────────────────────────────────────────────────────────────
  'Mumbai':            { lat:  19.0760, lng:  72.8777 },
  'Tokyo':             { lat:  35.6762, lng: 139.6503 },
  'Seoul':             { lat:  37.5665, lng: 126.9780 },
  'Singapore':         { lat:   1.3521, lng: 103.8198 },
  'Sydney':            { lat: -33.8688, lng: 151.2093 },
  'Melbourne':         { lat: -37.8136, lng: 144.9631 },

  // ── ADD MORE CITIES HERE ─────────────────────────────────────────────────────
  // Follow the pattern:  'City Name': { lat: XX.XXXX, lng: YY.YYYY },
};

// ─────────────────────────────────────────────────────────────────────────────
// COUNTRY FALLBACK MAP  (country_mkmb91h3 → geographic centroid)
// ─────────────────────────────────────────────────────────────────────────────

export const COUNTRY_MAP: Record<string, Coords> = {
  'Israel':          { lat:  31.0461, lng:  34.8516 },
  'United States':   { lat:  37.0902, lng: -95.7129 },
  'USA':             { lat:  37.0902, lng: -95.7129 },
  'United Kingdom':  { lat:  55.3781, lng:  -3.4360 },
  'UK':              { lat:  55.3781, lng:  -3.4360 },
  'France':          { lat:  46.2276, lng:   2.2137 },
  'Germany':         { lat:  51.1657, lng:  10.4515 },
  'Netherlands':     { lat:  52.1326, lng:   5.2913 },
  'Belgium':         { lat:  50.5039, lng:   4.4699 },
  'Spain':           { lat:  40.4637, lng:  -3.7492 },
  'Italy':           { lat:  41.8719, lng:  12.5674 },
  'Austria':         { lat:  47.5162, lng:  14.5501 },
  'Switzerland':     { lat:  46.8182, lng:   8.2275 },
  'Sweden':          { lat:  60.1282, lng:  18.6435 },
  'Norway':          { lat:  60.4720, lng:   8.4689 },
  'Denmark':         { lat:  56.2639, lng:   9.5018 },
  'Finland':         { lat:  61.9241, lng:  25.7482 },
  'Poland':          { lat:  51.9194, lng:  19.1451 },
  'Hungary':         { lat:  47.1625, lng:  19.5033 },
  'Czech Republic':  { lat:  49.8175, lng:  15.4730 },
  'Romania':         { lat:  45.9432, lng:  24.9668 },
  'Greece':          { lat:  39.0742, lng:  21.8243 },
  'Ukraine':         { lat:  48.3794, lng:  31.1656 },
  'Russia':          { lat:  61.5240, lng: 105.3188 },
  'Turkey':          { lat:  38.9637, lng:  35.2433 },
  'UAE':             { lat:  23.4241, lng:  53.8478 },
  'Jordan':          { lat:  30.5852, lng:  36.2384 },
  'Egypt':           { lat:  26.8206, lng:  30.8025 },
  'Morocco':         { lat:  31.7917, lng:  -7.0926 },
  'South Africa':    { lat: -30.5595, lng:  22.9375 },
  'Kenya':           { lat:  -0.0236, lng:  37.9062 },
  'Nigeria':         { lat:   9.0820, lng:   8.6753 },
  'India':           { lat:  20.5937, lng:  78.9629 },
  'Japan':           { lat:  36.2048, lng: 138.2529 },
  'South Korea':     { lat:  35.9078, lng: 127.7669 },
  'Singapore':       { lat:   1.3521, lng: 103.8198 },
  'Australia':       { lat: -25.2744, lng: 133.7751 },
  'Canada':          { lat:  56.1304, lng: -106.3468 },
  'Mexico':          { lat:  23.6345, lng: -102.5528 },
  'Argentina':       { lat: -38.4161, lng: -63.6167 },
  'Brazil':          { lat: -14.2350, lng: -51.9253 },
  'Chile':           { lat: -35.6751, lng: -71.5430 },

  // ── ADD MORE COUNTRIES HERE ───────────────────────────────────────────────
  // Follow the pattern:  'Country Name': { lat: XX.XXXX, lng: YY.YYYY },
};

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolves lat/lng for an incident.
 *
 * Priority:
 *   1. location_mkmbv7be  →  COORDINATE_MAP  (city-level precision)
 *   2. country_mkmb91h3   →  COUNTRY_MAP     (country centroid fallback)
 *   3. null               →  incident excluded from the globe
 */
export function getCoordinates(
  location: string | null | undefined,
  country: string | null | undefined,
): Coords | null {
  if (location) {
    const trimmed = location.trim();
    if (COORDINATE_MAP[trimmed]) return COORDINATE_MAP[trimmed];
  }

  if (country) {
    const trimmed = country.trim();
    if (COUNTRY_MAP[trimmed]) return COUNTRY_MAP[trimmed];
  }

  return null;
}
