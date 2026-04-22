import { getCoordinates } from './utils/coordinateUtils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Raw shape returned by Flask GET /api/incidents */
interface RawIncident {
  id: string;
  name: string;
  // Monday column IDs
  status_mkmbjwef?: string;   // "Working on it" = live
  color_mkvvrm1r?: string;    // handled status
  status_mkmb1zc6?: string;   // incident type
  location_mkmbv7be?: string; // primary coordinate source
  country_mkmb91h3?: string;  // fallback coordinate source
  check_mkn3c7v8?: string;    // life-threatening flag
  [key: string]: unknown;
}

/** Shape consumed by TacticalGlobe */
export interface GlobeIncident {
  id: string;
  label: string;        // display name (e.g. "INC-001")
  locationName: string; // resolved city or country name
  lat: number;
  lng: number;
  type: string;
  country: string;
  isLive: boolean;      // status_mkmbjwef === 'Working on it'
  isResolved: boolean;  // color_mkvvrm1r indicates handled
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const LIVE_STATUS     = 'Working on it';
const HANDLED_STATUSES = new Set(['נפתח אירוע', 'טופל על ידי רון', 'אירוע משמעותי']);

// ─────────────────────────────────────────────────────────────────────────────
// Processing
// ─────────────────────────────────────────────────────────────────────────────

function buildLabel(index: number): string {
  return `INC-${String(index + 1).padStart(3, '0')}`;
}

function resolveLocationName(location?: string, country?: string): string {
  if (location?.trim()) return location.trim();
  if (country?.trim())  return country.trim();
  return 'UNKNOWN';
}

/**
 * Converts raw API incidents into typed GlobeIncident objects:
 *   1. Drops incidents with no resolvable coordinates.
 *   2. Sorts live ("Working on it") incidents to the front so they
 *      render on top in the globe data arrays.
 */
export function processIncidents(raw: RawIncident[]): GlobeIncident[] {
  const mapped: GlobeIncident[] = [];

  raw.forEach((inc, i) => {
    const coords = getCoordinates(inc.location_mkmbv7be, inc.country_mkmb91h3);

    // Silently exclude incidents with no coordinate resolution
    if (!coords) return;

    const isLive = inc.status_mkmbjwef?.trim() === LIVE_STATUS;
    const isResolved = HANDLED_STATUSES.has(inc.color_mkvvrm1r?.trim() ?? '');

    mapped.push({
      id:           inc.id,
      label:        buildLabel(i),
      locationName: resolveLocationName(inc.location_mkmbv7be, inc.country_mkmb91h3),
      lat:          coords.lat,
      lng:          coords.lng,
      type:         inc.status_mkmb1zc6?.trim() ?? 'Unknown',
      country:      inc.country_mkmb91h3?.trim() ?? 'Unknown',
      isLive,
      isResolved,
    });
  });

  // Live incidents first — they get rendered on top of the ring layer
  return mapped.sort((a, b) => Number(b.isLive) - Number(a.isLive));
}

// ─────────────────────────────────────────────────────────────────────────────
// API fetch
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchGlobeIncidents(): Promise<GlobeIncident[]> {
  const res = await fetch('/api/incidents');
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = await res.json();
  return processIncidents((json.data ?? []) as RawIncident[]);
}
