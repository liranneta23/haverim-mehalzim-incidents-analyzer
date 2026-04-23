import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import { fetchGlobeIncidents, type GlobeIncident } from './GlobeService';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const GEO_URL =
  'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson';

const HEX_TILE_URI = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="25">
    <polygon points="11,1 21,6.5 21,17.5 11,23 1,17.5 1,6.5"
      fill="none" stroke="#00e6a0" stroke-width="0.45"/>
  </svg>`,
)}`;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

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
  const map: Record<string, string> = {
    tl: 'top-4 left-4  border-t-2 border-l-2',
    tr: 'top-4 right-4 border-t-2 border-r-2',
    bl: 'bottom-4 left-4  border-b-2 border-l-2',
    br: 'bottom-4 right-4 border-b-2 border-r-2',
  };
  return <div className={`${base} ${map[position]}`} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function TacticalGlobe() {
  const globeRef    = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [countries,  setCountries]  = useState<any[]>([]);
  const [incidents,  setIncidents]  = useState<GlobeIncident[]>([]);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [dots,       setDots]       = useState('');
  const [error,      setError]      = useState<string | null>(null);

  const liveIncidents     = useMemo(() => incidents.filter(i => i.isLive),     [incidents]);
  const resolvedIncidents = useMemo(() => incidents.filter(i => i.isResolved), [incidents]);
  // Incidents with no matching status (neither Live nor Resolved) are excluded from the map total
  const filteredTotal     = useMemo(() => liveIncidents.length + resolvedIncidents.length, [liveIncidents, resolvedIncidents]);
  const ringData          = useMemo(() => liveIncidents, [liveIncidents]);

  // ── Data loading ────────────────────────────────────────────────────────────

  useEffect(() => {
    fetch(GEO_URL)
      .then(r => r.json())
      .then(d => setCountries(d.features));
  }, []);

  useEffect(() => {
    fetchGlobeIncidents()
      .then(setIncidents)
      .catch(err => setError(err.message));
  }, []);

  // ── Responsive sizing ────────────────────────────────────────────────────────

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        setDimensions({
          width:  containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Globe controls ───────────────────────────────────────────────────────────
  // Delay ensures the WebGL context is fully initialised before we touch controls

  useEffect(() => {
    if (!countries.length) return;
    const timer = setTimeout(() => {
      const g = globeRef.current;
      if (!g) return;
      g.controls().autoRotate      = true;
      g.controls().autoRotateSpeed = 0.35;
      g.controls().enableZoom      = true;
      g.pointOfView({ lat: 28, lng: 25, altitude: 2.4 }, 1200);
    }, 300);
    return () => clearTimeout(timer);
  }, [countries]);

  // ── Scanning ticker ──────────────────────────────────────────────────────────

  useEffect(() => {
    const id = setInterval(() => setDots(d => (d.length >= 3 ? '' : d + '.')), 550);
    return () => clearInterval(id);
  }, []);

  // ── Tooltip builders ─────────────────────────────────────────────────────────

  const pointLabel = useCallback(
    (d: any) => `
      <div style="background:#0b0e11dd;border:1px solid #FFB930;padding:5px 9px;
                  color:#FFB930;font:11px/1.5 'JetBrains Mono',monospace;border-radius:2px;">
        <strong>${(d as GlobeIncident).label}</strong> · ${(d as GlobeIncident).locationName}<br/>
        ${(d as GlobeIncident).type} · RESOLVED
      </div>`,
    [],
  );


  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#0B0E11] overflow-hidden"
      style={{ minHeight: 600, fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* ── Globe ──────────────────────────────────────────────────────────── */}
      <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="#0B0E11"
          atmosphereColor="#00e6a0"
          atmosphereAltitude={0.18}

          // Olive-green landmasses
          polygonsData={countries}
          polygonCapColor={() => '#3C4A3B'}
          polygonSideColor={() => 'rgba(60,74,59,0.45)'}
          polygonStrokeColor={() => '#4e6349'}
          polygonAltitude={0.006}

          // Live incidents → bright red pulsating rings (rendered first = on top)
          ringsData={ringData}
          ringLat={(d: any) => d.lat}
          ringLng={(d: any) => d.lng}
          ringColor={() => (t: number) => `rgba(255,30,30,${Math.max(0, 1 - t)})`}
          ringMaxRadius={4.5}
          ringPropagationSpeed={3.0}
          ringRepeatPeriod={700}
          // Resolved incidents → amber dots
          pointsData={resolvedIncidents}
          pointLat={(d: any) => d.lat}
          pointLng={(d: any) => d.lng}
          pointColor={() => '#FFB930'}
          pointRadius={0.38}
          pointAltitude={0.015}
          pointLabel={pointLabel}

          // Live incident location labels — rendered as native globe labels
          labelsData={liveIncidents}
          labelLat={(d: any) => d.lat}
          labelLng={(d: any) => d.lng}
          labelText={(d: any) => (d as GlobeIncident).locationName.toUpperCase()}
          labelSize={0.6}
          labelDotRadius={0.4}
          labelColor={() => '#ff5050'}
          labelResolution={2}
          labelAltitude={0.015}
        />

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

      {/* ── HUD corners ─────────────────────────────────────────────────────── */}
      <Corner position="tl" />
      <Corner position="tr" />
      <Corner position="bl" />
      <Corner position="br" />

      {/* ── Crosshair ───────────────────────────────────────────────────────── */}
      <div aria-hidden className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-10 h-10">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-[#00e6a0] opacity-50" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#00e6a0] opacity-50" />
          <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00e6a0] opacity-70" />
        </div>
      </div>

      {/* ── Top title ───────────────────────────────────────────────────────── */}
      <div aria-hidden className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
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

      {/* ── Status board ─────────────────────────────────────────────────────── */}
      <div className="absolute top-10 right-6 pointer-events-none">
        <div className="border border-[#00e6a0]/30 bg-[#0B0E11]/85 px-4 py-3" style={{ minWidth: 164 }}>
          <div className="text-[9px] text-[#00e6a0] tracking-[0.2em] uppercase border-b border-[#00e6a0]/20 pb-1.5 mb-2">
            ◈ Status Board
          </div>
          <StatusRow label="Total"    value={filteredTotal}            color="text-white" />
          <StatusRow label="Live"     value={liveIncidents.length}     color="text-red-400" />
          <StatusRow label="Resolved" value={resolvedIncidents.length} color="text-amber-400" />
        </div>

        {/* API error notice */}
        {error && (
          <div className="mt-2 border border-red-500/40 bg-[#0B0E11]/90 px-3 py-2 text-[9px] text-red-400 tracking-wider">
            ⚠ {error}
          </div>
        )}
      </div>

      {/* ── Legend ───────────────────────────────────────────────────────────── */}
      <div className="absolute bottom-10 left-6 pointer-events-none">
        <div className="border border-[#00e6a0]/20 bg-[#0B0E11]/85 px-3 py-2.5 space-y-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 border-2 border-red-500" />
            </span>
            <span className="text-[9px] text-red-400 tracking-[0.2em] uppercase">Live</span>
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
