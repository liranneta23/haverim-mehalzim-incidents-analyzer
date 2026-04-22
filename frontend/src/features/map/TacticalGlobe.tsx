import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Incident {
  id: string;
  lat: number;
  lng: number;
  country: string;
  type: string;
  status: 'active' | 'resolved';
  label: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
// Replace with real API data from /api/incidents when integrating

const MOCK_INCIDENTS: Incident[] = [
  { id: '1', lat: 31.77,  lng:  35.21,  country: 'Israel',    type: 'Medical',      status: 'active',   label: 'INC-001' },
  { id: '2', lat: 51.50,  lng:  -0.12,  country: 'UK',        type: 'Mental Health',status: 'resolved', label: 'INC-002' },
  { id: '3', lat: 40.71,  lng: -74.00,  country: 'USA',       type: 'Search',       status: 'active',   label: 'INC-003' },
  { id: '4', lat: 48.85,  lng:   2.35,  country: 'France',    type: 'Medical',      status: 'resolved', label: 'INC-004' },
  { id: '5', lat: -33.86, lng: 151.20,  country: 'Australia', type: 'Rescue',       status: 'active',   label: 'INC-005' },
  { id: '6', lat: 55.75,  lng:  37.61,  country: 'Russia',    type: 'Medical',      status: 'resolved', label: 'INC-006' },
  { id: '7', lat: 35.67,  lng: 139.65,  country: 'Japan',     type: 'Search',       status: 'active',   label: 'INC-007' },
  { id: '8', lat: -1.28,  lng:  36.82,  country: 'Kenya',     type: 'Antisemitism', status: 'active',   label: 'INC-008' },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const GEO_URL =
  'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson';

// Inline SVG hex grid as a data URI — overlaid on the globe at low opacity
const HEX_TILE_URI = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="25">
    <polygon points="11,1 21,6.5 21,17.5 11,23 1,17.5 1,6.5"
      fill="none" stroke="#00e6a0" stroke-width="0.45"/>
  </svg>`
)}`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex justify-between items-center py-[3px]">
      <span className="text-[9px] tracking-[0.18em] uppercase text-[#7a9ab5]">{label}</span>
      <span className={`text-sm font-bold tabular-nums ${color}`}>{value}</span>
    </div>
  );
}

function Corner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const base = 'absolute w-8 h-8 border-[#00e6a0] pointer-events-none';
  const styles: Record<string, string> = {
    tl: 'top-4 left-4  border-t-2 border-l-2',
    tr: 'top-4 right-4 border-t-2 border-r-2',
    bl: 'bottom-4 left-4  border-b-2 border-l-2',
    br: 'bottom-4 right-4 border-b-2 border-r-2',
  };
  return <div className={`${base} ${styles[position]}`} />;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TacticalGlobe() {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [countries, setCountries] = useState<any[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [dots, setDots] = useState('');      // for the scanning animation

  const activeIncidents   = MOCK_INCIDENTS.filter(i => i.status === 'active');
  const resolvedIncidents = MOCK_INCIDENTS.filter(i => i.status === 'resolved');

  // Country polygons for olive landmasses
  useEffect(() => {
    fetch(GEO_URL)
      .then(r => r.json())
      .then(d => setCountries(d.features));
  }, []);

  // Responsive canvas size
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setDimensions({
          width:  containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Auto-rotate + initial POV centered on Middle East
  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    g.controls().autoRotate = true;
    g.controls().autoRotateSpeed = 0.35;
    g.controls().enableZoom = true;
    g.pointOfView({ lat: 28, lng: 25, altitude: 2.4 }, 1200);
  }, [countries]); // fire after countries load so globe is ready

  // "SCANNING..." dot ticker
  useEffect(() => {
    const id = setInterval(() => setDots(d => (d.length >= 3 ? '' : d + '.')), 550);
    return () => clearInterval(id);
  }, []);

  // Tooltip template for resolved (point) incidents
  const pointLabel = (d: any) => `
    <div style="background:#0b0e11dd;border:1px solid #FFB930;padding:5px 9px;
                color:#FFB930;font:11px/1.5 monospace;border-radius:2px;">
      <strong>${d.label}</strong> · ${d.country}<br/>
      ${d.type} · RESOLVED
    </div>`;

  // Tooltip for active (ring) incidents
  const ringLabel = (d: any) => `
    <div style="background:#0b0e11dd;border:1px solid #ff3232;padding:5px 9px;
                color:#ff5050;font:11px/1.5 monospace;border-radius:2px;">
      <strong>${d.label}</strong> · ${d.country}<br/>
      ${d.type} · ⚠ ACTIVE
    </div>`;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#0B0E11] overflow-hidden"
      style={{ minHeight: 600, fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* ── Globe ──────────────────────────────────────────────────────────── */}
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="#0B0E11"

          // Atmosphere: faint cyan halo
          atmosphereColor="#00e6a0"
          atmosphereAltitude={0.18}

          // Olive-green landmasses
          polygonsData={countries}
          polygonCapColor={() => '#3C4A3B'}
          polygonSideColor={() => 'rgba(60,74,59,0.45)'}
          polygonStrokeColor={() => '#4e6349'}
          polygonAltitude={0.006}

          // Active incidents → red pulsating rings
          ringsData={activeIncidents}
          ringLat={(d: any) => d.lat}
          ringLng={(d: any) => d.lng}
          // gradient: opaque red at center → transparent at edge
          ringColor={() => (t: number) => `rgba(255,50,50,${Math.max(0, 1 - t)})`}
          ringMaxRadius={3.5}
          ringPropagationSpeed={2.5}
          ringRepeatPeriod={850}
          ringLabel={ringLabel}

          // Resolved incidents → amber dots
          pointsData={resolvedIncidents}
          pointLat={(d: any) => d.lat}
          pointLng={(d: any) => d.lng}
          pointColor={() => '#FFB930'}
          pointRadius={0.38}
          pointAltitude={0.015}
          pointLabel={pointLabel}
        />
      )}

      {/* ── Hex grid texture overlay ────────────────────────────────────────── */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("${HEX_TILE_URI}")`,
          backgroundRepeat: 'repeat',
          opacity: 0.1,
          mixBlendMode: 'screen',
        }}
      />

      {/* ── HUD corner brackets ─────────────────────────────────────────────── */}
      <Corner position="tl" />
      <Corner position="tr" />
      <Corner position="bl" />
      <Corner position="br" />

      {/* ── Crosshair ───────────────────────────────────────────────────────── */}
      <div aria-hidden className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-10 h-10">
          {/* horizontal arm */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-[#00e6a0] opacity-50" />
          {/* vertical arm */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#00e6a0] opacity-50" />
          {/* center pip */}
          <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00e6a0] opacity-70" />
        </div>
      </div>

      {/* ── Top title bar ────────────────────────────────────────────────────── */}
      <div
        aria-hidden
        className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none"
      >
        <span className="text-[10px] text-[#00e6a0] tracking-[0.3em] uppercase opacity-60">
          Haverim Mehalzim · Incident Command
        </span>
      </div>

      {/* ── Scanning ticker ──────────────────────────────────────────────────── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
        <span className="text-[10px] text-[#00e6a0] tracking-[0.25em] uppercase opacity-55 w-28 inline-block">
          SCANNING{dots}
        </span>
      </div>

      {/* ── Status board (top-right) ─────────────────────────────────────────── */}
      <div className="absolute top-10 right-6 pointer-events-none">
        <div
          className="border border-[#00e6a0]/30 bg-[#0B0E11]/85 px-4 py-3"
          style={{ minWidth: 160 }}
        >
          <div className="text-[9px] text-[#00e6a0] tracking-[0.2em] uppercase border-b border-[#00e6a0]/20 pb-1.5 mb-2">
            ◈ Status Board
          </div>
          <StatusRow label="Total"    value={MOCK_INCIDENTS.length}   color="text-white" />
          <StatusRow label="Active"   value={activeIncidents.length}   color="text-red-400" />
          <StatusRow label="Resolved" value={resolvedIncidents.length} color="text-amber-400" />
        </div>
      </div>

      {/* ── Legend (bottom-left) ─────────────────────────────────────────────── */}
      <div className="absolute bottom-10 left-6 pointer-events-none">
        <div className="border border-[#00e6a0]/20 bg-[#0B0E11]/85 px-3 py-2.5 space-y-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 border-2 border-red-500" />
            </span>
            <span className="text-[9px] text-red-400 tracking-[0.2em] uppercase">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block" />
            <span className="text-[9px] text-amber-400 tracking-[0.2em] uppercase">Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
}
