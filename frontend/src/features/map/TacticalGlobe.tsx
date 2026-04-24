import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Globe from 'react-globe.gl';
import { fetchGlobeIncidents, type GlobeIncident } from './GlobeService';

// ── Replace with your real donation page URL ──────────────────────────────────
const DONATE_URL = 'https://www.haverimmehalzim.org/donate';

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

const TYPE_COLORS: Record<string, string> = {
  'Medical':          '#ff4d6a',
  'Rescue':           '#ffb930',
  'Mental Health':    '#4da6ff',
  'Search & Locate':  '#00e6a0',
  'Antisemitism':     '#ff7730',
  'Haverot Mehalzot': '#a855f7',
  'Other':            '#7a9ab5',
};
const typeColor = (type: string) => TYPE_COLORS[type] ?? '#7a9ab5';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StatusRow({ label, value, color }: { label: string; value: number | string; color: string }) {
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
  const globeRef     = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [countries,       setCountries]       = useState<any[]>([]);
  const [incidents,       setIncidents]       = useState<GlobeIncident[]>([]);
  const [dimensions,      setDimensions]      = useState({ width: window.innerWidth, height: window.innerHeight });
  const [dots,            setDots]            = useState('');
  const [error,           setError]           = useState<string | null>(null);
  const [selectedTypes,   setSelectedTypes]   = useState<Set<string>>(new Set());
  const [selectedIncident, setSelectedIncident] = useState<GlobeIncident | null>(null);

  // ── Derived data ─────────────────────────────────────────────────────────────

  const incidentTypeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    incidents.forEach(i => { counts.set(i.type, (counts.get(i.type) ?? 0) + 1); });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [incidents]);

  const displayedIncidents = useMemo(() =>
    selectedTypes.size === 0 ? incidents : incidents.filter(i => selectedTypes.has(i.type)),
  [incidents, selectedTypes]);

  const liveIncidents     = useMemo(() => displayedIncidents.filter(i => i.isLive),     [displayedIncidents]);
  const resolvedIncidents = useMemo(() => displayedIncidents.filter(i => i.isResolved), [displayedIncidents]);
  const filteredTotal     = useMemo(() => liveIncidents.length + resolvedIncidents.length, [liveIncidents, resolvedIncidents]);
  const ringData          = useMemo(() => liveIncidents, [liveIncidents]);

  // ── Data loading ─────────────────────────────────────────────────────────────

  useEffect(() => {
    fetch(GEO_URL).then(r => r.json()).then(d => setCountries(d.features));
  }, []);

  useEffect(() => {
    fetchGlobeIncidents().then(setIncidents).catch(err => setError(err.message));
  }, []);

  // ── Responsive sizing ─────────────────────────────────────────────────────────

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        setDimensions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
      }
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Globe controls ────────────────────────────────────────────────────────────

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

  // ── Scanning ticker ───────────────────────────────────────────────────────────

  useEffect(() => {
    const id = setInterval(() => setDots(d => (d.length >= 3 ? '' : d + '.')), 550);
    return () => clearInterval(id);
  }, []);

  // ── Rotation helpers ──────────────────────────────────────────────────────────

  const pauseRotation  = useCallback(() => { const c = globeRef.current?.controls(); if (c) c.autoRotate = false; }, []);
  const resumeRotation = useCallback(() => { const c = globeRef.current?.controls(); if (c) c.autoRotate = true;  }, []);

  // ── Filter toggle ─────────────────────────────────────────────────────────────

  const toggleType = useCallback((type: string) => {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  }, []);

  // ── Incident selection ────────────────────────────────────────────────────────

  const handlePointClick = useCallback((point: any) => {
    setSelectedIncident(point as GlobeIncident);
    pauseRotation();
  }, [pauseRotation]);

  const handleLabelClick = useCallback((label: any) => {
    setSelectedIncident(label as GlobeIncident);
    pauseRotation();
  }, [pauseRotation]);

  const handleGlobeClick = useCallback(() => {
    setSelectedIncident(null);
    resumeRotation();
  }, [resumeRotation]);

  // ── Tooltips ──────────────────────────────────────────────────────────────────

  const pointLabel = useCallback((d: any) => {
    const inc = d as GlobeIncident;
    const color = typeColor(inc.type);
    return `<div style="background:#0b0e11ee;border:1px solid ${color};padding:6px 10px;
                color:${color};font:11px/1.6 'JetBrains Mono',monospace;border-radius:3px;">
      <strong>${inc.label}</strong> · ${inc.locationName}<br/>
      ${inc.type} · RESOLVED
    </div>`;
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#0B0E11] overflow-hidden"
      style={{ minHeight: 600, fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* ── Globe ────────────────────────────────────────────────────────────── */}
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#0B0E11"
        atmosphereColor="#00e6a0"
        atmosphereAltitude={0.18}

        polygonsData={countries}
        polygonCapColor={() => '#3C4A3B'}
        polygonSideColor={() => 'rgba(60,74,59,0.45)'}
        polygonStrokeColor={() => '#4e6349'}
        polygonAltitude={0.006}

        ringsData={ringData}
        ringLat={(d: any) => d.lat}
        ringLng={(d: any) => d.lng}
        ringColor={() => (t: number) => `rgba(255,30,30,${Math.max(0, 1 - t)})`}
        ringMaxRadius={4.5}
        ringPropagationSpeed={3.0}
        ringRepeatPeriod={700}

        pointsData={resolvedIncidents}
        pointLat={(d: any) => d.lat}
        pointLng={(d: any) => d.lng}
        pointColor={(d: any) => typeColor((d as GlobeIncident).type)}
        pointRadius={0.42}
        pointAltitude={0.015}
        pointLabel={pointLabel}
        onPointHover={(point) => { if (point) pauseRotation(); }}
        onPointClick={handlePointClick}

        labelsData={liveIncidents}
        labelLat={(d: any) => d.lat}
        labelLng={(d: any) => d.lng}
        labelText={(d: any) => (d as GlobeIncident).locationName.toUpperCase()}
        labelSize={0.6}
        labelDotRadius={0.4}
        labelColor={() => '#ff5050'}
        labelResolution={2}
        labelAltitude={0.015}
        onLabelClick={handleLabelClick}

        onGlobeClick={handleGlobeClick}
      />

      {/* ── Hex grid overlay ─────────────────────────────────────────────────── */}
      <div aria-hidden className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `url("${HEX_TILE_URI}")`, backgroundRepeat: 'repeat', opacity: 0.1, mixBlendMode: 'screen' }}
      />

      {/* ── HUD corners ──────────────────────────────────────────────────────── */}
      <Corner position="tl" /><Corner position="tr" />
      <Corner position="bl" /><Corner position="br" />

      {/* ── Crosshair ────────────────────────────────────────────────────────── */}
      <div aria-hidden className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-10 h-10">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-[#00e6a0] opacity-50" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#00e6a0] opacity-50" />
          <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00e6a0] opacity-70" />
        </div>
      </div>

      {/* ── Top title ────────────────────────────────────────────────────────── */}
      <div aria-hidden className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none text-center">
        <div className="text-[10px] text-[#00e6a0] tracking-[0.3em] uppercase opacity-60">
          Haverim Mehalzim · Live Operations
        </div>
      </div>

      {/* ── Back to Dashboard ────────────────────────────────────────────────── */}
      <div className="absolute top-10 left-6 z-10">
        <Link to="/"
          className="flex items-center gap-1.5 text-[9px] tracking-[0.18em] uppercase
                     text-[#00e6a0] border border-[#00e6a0]/30 bg-[#0B0E11]/85
                     px-3 py-1.5 hover:bg-[#00e6a0]/10 transition-colors">
          ← Dashboard
        </Link>
      </div>

      {/* ── Scanning ticker ──────────────────────────────────────────────────── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
        <span className="text-[10px] text-[#00e6a0] tracking-[0.25em] uppercase opacity-55 w-28 inline-block">
          SCANNING{dots}
        </span>
      </div>

      {/* ── Status board (top-right) ──────────────────────────────────────────── */}
      <div className="absolute top-10 right-6 pointer-events-none">
        <div className="border border-[#00e6a0]/30 bg-[#0B0E11]/85 px-4 py-3" style={{ minWidth: 180 }}>
          <div className="text-[9px] text-[#00e6a0] tracking-[0.2em] uppercase border-b border-[#00e6a0]/20 pb-1.5 mb-2">
            ◈ Status Board
          </div>
          <StatusRow label="Operations" value={`${filteredTotal} worldwide`} color="text-white" />
          <StatusRow label="Live"       value={liveIncidents.length}          color="text-red-400" />
          <StatusRow label="Resolved"   value={resolvedIncidents.length}      color="text-amber-400" />
          {selectedTypes.size > 0 && (
            <div className="mt-2 pt-2 border-t border-[#00e6a0]/15 text-[8px] text-[#00e6a0] tracking-wider">
              FILTERED · {selectedTypes.size} TYPE{selectedTypes.size > 1 ? 'S' : ''}
            </div>
          )}
        </div>
        {error && (
          <div className="mt-2 border border-red-500/40 bg-[#0B0E11]/90 px-3 py-2 text-[9px] text-red-400 tracking-wider">
            ⚠ {error}
          </div>
        )}
      </div>

      {/* ── Left sidebar: incident detail + filter + legend ───────────────────── */}
      <div className="absolute top-10 bottom-10 left-6 flex flex-col gap-3 pointer-events-none" style={{ width: 190 }}>

        {/* Incident detail panel */}
        {selectedIncident && (
          <div className="border bg-[#0B0E11]/95 px-4 py-3 pointer-events-auto"
            style={{ borderColor: typeColor(selectedIncident.type) + '66' }}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-[8px] tracking-[0.2em] uppercase"
                style={{ color: typeColor(selectedIncident.type) }}>
                ◈ Incident Detail
              </span>
              <button onClick={() => setSelectedIncident(null)}
                className="text-[#3d5a72] hover:text-white text-xs leading-none">✕</button>
            </div>
            <div className="text-[10px] text-white font-bold mb-1">{selectedIncident.label}</div>
            <div className="text-[10px] text-[#7a9ab5] mb-0.5">{selectedIncident.locationName}</div>
            <div className="text-[10px] mb-0.5" style={{ color: typeColor(selectedIncident.type) }}>
              {selectedIncident.type}
            </div>
            <div className="text-[9px] text-[#3d5a72] mb-3">
              {selectedIncident.isLive ? '● LIVE' : '● RESOLVED'}
            </div>
            <div className="text-[9px] text-[#7a9ab5] leading-relaxed mb-3 border-t border-[#ffffff10] pt-2">
              Your support funds responses like this one — 24/7, at no cost to the people we help.
            </div>
            <a href={DONATE_URL} target="_blank" rel="noopener noreferrer"
              className="block text-center text-[9px] tracking-[0.15em] uppercase font-bold
                         bg-[#00e6a0] text-[#0B0E11] px-3 py-1.5 pointer-events-auto
                         hover:opacity-85 transition-opacity">
              Support This Mission
            </a>
          </div>
        )}

        {/* Type filter panel */}
        {incidentTypeCounts.length > 0 && (
          <div className="border border-[#00e6a0]/20 bg-[#0B0E11]/85 px-3 py-3 pointer-events-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[8px] text-[#00e6a0] tracking-[0.2em] uppercase">Filter by Type</span>
              {selectedTypes.size > 0 && (
                <button onClick={() => setSelectedTypes(new Set())}
                  className="text-[8px] text-[#3d5a72] hover:text-[#00e6a0] tracking-wider uppercase transition-colors">
                  Reset
                </button>
              )}
            </div>
            <div className="flex flex-col gap-1">
              {incidentTypeCounts.map(([type, count]) => {
                const active = selectedTypes.size === 0 || selectedTypes.has(type);
                const color  = typeColor(type);
                return (
                  <button key={type} onClick={() => toggleType(type)}
                    className="flex items-center justify-between px-2 py-1 rounded text-left transition-colors"
                    style={{
                      background: selectedTypes.has(type) ? color + '22' : 'transparent',
                      border: `1px solid ${selectedTypes.has(type) ? color + '55' : 'transparent'}`,
                      opacity: active ? 1 : 0.4,
                    }}>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-[9px] text-[#c0d0e0] tracking-wide">{type}</span>
                    </span>
                    <span className="text-[9px] font-bold tabular-nums" style={{ color }}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Legend */}
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
            <span className="text-[9px] text-amber-400 tracking-[0.2em] uppercase">Resolved · color = type</span>
          </div>
        </div>
      </div>

      {/* ── Donate CTA (bottom-right) ─────────────────────────────────────────── */}
      <div className="absolute bottom-10 right-6">
        <a href={DONATE_URL} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2
                     border border-[#00e6a0]/40 bg-[#0B0E11]/90
                     text-[9px] tracking-[0.18em] uppercase text-[#00e6a0]
                     hover:bg-[#00e6a0]/15 transition-colors">
          <span>♥</span>
          <span>Support Our Mission</span>
        </a>
      </div>
    </div>
  );
}
