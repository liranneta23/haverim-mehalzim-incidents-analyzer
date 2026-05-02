import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Globe from 'react-globe.gl';
import { fetchGlobeIncidents, type GlobeIncident } from './GlobeService';
import { Tooltip } from '../../components/Tooltip';

const DONATE_URL = 'https://www.jgive.com/new/en/usd/donation-targets/110214';
const GOLD = '#D4AF37';

const SUCCESS_METRICS: Record<string, string> = {
  'Medical':          'Medical Care Delivered',
  'Rescue':           'Safe Extraction Completed',
  'Mental Health':    'Crisis Support Delivered',
  'Search & Locate':  'Person Located Successfully',
  'Antisemitism':     'Incident Documented & Reported',
  'Haverot Mehalzot': 'Response Coordinated',
  'Other':            'Mission Completed',
};

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

function IncidentDetail({
  incident,
  onClose,
  compact = false,
}: {
  incident: GlobeIncident;
  onClose: () => void;
  compact?: boolean;
}) {
  const isResolved = incident.isResolved;
  const accentColor = isResolved ? GOLD : '#00e6a0';
  const metric = SUCCESS_METRICS[incident.type] ?? 'Mission Completed';

  const labelSize  = compact ? 'text-[8px]'  : 'text-[10px]';
  const titleSize  = compact ? 'text-[10px]' : 'text-base';
  const bodySize   = compact ? 'text-[10px]' : 'text-sm';
  const smallSize  = compact ? 'text-[9px]'  : 'text-xs';

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <span className={`${labelSize} tracking-[0.2em] uppercase font-bold`} style={{ color: accentColor }}>
          {isResolved ? '◈ Impact Report' : '◈ Incident Detail'}
        </span>
        <button onClick={onClose} className="text-[#3d5a72] hover:text-white leading-none px-1 text-sm">✕</button>
      </div>

      {/* Core info */}
      <div className={`${titleSize} text-white font-bold mb-1`}>{incident.label}</div>
      <div className={`${bodySize} text-[#7a9ab5] mb-0.5`}>{incident.locationName}</div>
      <div className={`${bodySize} text-[#c0d0e0] mb-1`}>{incident.type}</div>
      <div className={`${smallSize} font-bold mb-3`}
        style={{ color: incident.isLive ? '#ff5050' : accentColor }}>
        {incident.isLive ? '● LIVE' : '✓ RESOLVED'}
      </div>

      {/* Success metric — resolved only */}
      {isResolved && (
        <div className="mb-3 px-3 py-2 rounded"
          style={{ background: `${GOLD}12`, border: `1px solid ${GOLD}33` }}>
          <div className={`${smallSize} mb-0.5`} style={{ color: `${GOLD}99` }}>Outcome</div>
          <div className={`${compact ? 'text-[10px]' : 'text-sm'} font-bold`} style={{ color: GOLD }}>
            ✓ {metric}
          </div>
        </div>
      )}

      {/* Donor badge — resolved only */}
      {isResolved && (
        <div className={`${smallSize} flex items-center gap-1.5 mb-3 pb-3 border-b`}
          style={{ borderColor: `${GOLD}20`, color: `${GOLD}bb` }}>
          <span>🏅</span>
          <span>Funded by Donors Like You</span>
        </div>
      )}

      {/* Live: brief copy */}
      {!isResolved && (
        <p className={`${smallSize} text-[#7a9ab5] leading-relaxed mb-3 border-t border-[#ffffff10] pt-2`}>
          Your support funds responses like this one — 24/7, at no cost to the people we help.
        </p>
      )}

      {/* CTA */}
      <a href={DONATE_URL} target="_blank" rel="noopener noreferrer"
        className={`block text-center ${smallSize} tracking-[0.15em] uppercase font-bold px-3 py-2 rounded transition-opacity hover:opacity-85`}
        style={isResolved
          ? { background: GOLD, color: '#0B0E11' }
          : { background: '#00e6a0', color: '#0B0E11' }}>
        {isResolved ? 'Fund the Next Rescue' : 'Support This Mission'}
      </a>
    </div>
  );
}

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

function FilterList({
  incidentTypeCounts,
  selectedTypes,
  toggleType,
  resetTypes,
}: {
  incidentTypeCounts: [string, number][];
  selectedTypes: Set<string>;
  toggleType: (t: string) => void;
  resetTypes: () => void;
}) {
  return (
    <>
      <div className="flex justify-between items-center mb-3">
        <span className="text-[9px] text-[#00e6a0] tracking-[0.2em] uppercase flex items-center gap-1">
          Filter by Type
          <Tooltip text="Tap a type to show only those incidents on the globe" />
        </span>
        {selectedTypes.size > 0 && (
          <button onClick={resetTypes}
            className="text-[9px] text-[#3d5a72] hover:text-[#00e6a0] tracking-wider uppercase transition-colors">
            Reset
          </button>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {incidentTypeCounts.map(([type, count]) => {
          const isSelected = selectedTypes.has(type);
          const active     = selectedTypes.size === 0 || isSelected;
          return (
            <button key={type} onClick={() => toggleType(type)}
              className="flex items-center justify-between px-3 py-2 rounded text-left transition-colors"
              style={{
                background: isSelected ? '#00e6a022' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSelected ? '#00e6a055' : 'rgba(255,255,255,0.06)'}`,
                opacity: active ? 1 : 0.4,
              }}>
              <span className="text-[11px] text-[#c0d0e0]">{type}</span>
              <span className="text-[11px] font-bold tabular-nums text-[#00e6a0]">{count}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function TacticalGlobe() {
  const globeRef     = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [countries,         setCountries]         = useState<any[]>([]);
  const [incidents,         setIncidents]         = useState<GlobeIncident[]>([]);
  const [dimensions,        setDimensions]        = useState({ width: window.innerWidth, height: window.innerHeight });
  const [error,             setError]             = useState<string | null>(null);
  const [selectedTypes,     setSelectedTypes]     = useState<Set<string>>(new Set());
  const [selectedIncident,  setSelectedIncident]  = useState<GlobeIncident | null>(null);
  const [mobileFilterOpen,  setMobileFilterOpen]  = useState(false);
  const [statusFilter,      setStatusFilter]      = useState<'all' | 'live' | 'resolved'>('all');

  const isMobile = dimensions.width < 768;

  // ── Derived data ─────────────────────────────────────────────────────────────

  const incidentTypeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    incidents.forEach(i => { counts.set(i.type, (counts.get(i.type) ?? 0) + 1); });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [incidents]);

  const displayedIncidents = useMemo(() => {
    let result = selectedTypes.size === 0 ? incidents : incidents.filter(i => selectedTypes.has(i.type));
    if (statusFilter === 'live')     result = result.filter(i => i.isLive);
    if (statusFilter === 'resolved') result = result.filter(i => i.isResolved);
    return result;
  }, [incidents, selectedTypes, statusFilter]);

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
      g.pointOfView({ lat: 28, lng: 25, altitude: isMobile ? 1.9 : 2.4 }, 1200);
    }, 300);
    return () => clearTimeout(timer);
  }, [countries]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Rotation helpers ──────────────────────────────────────────────────────────

  const pauseRotation  = useCallback(() => { const c = globeRef.current?.controls(); if (c) c.autoRotate = false; }, []);
  const resumeRotation = useCallback(() => { const c = globeRef.current?.controls(); if (c) c.autoRotate = true;  }, []);

  // ── Filter toggle ─────────────────────────────────────────────────────────────

  const toggleType  = useCallback((type: string) => {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  }, []);
  const resetTypes  = useCallback(() => setSelectedTypes(new Set()), []);

  const toggleStatusFilter = useCallback((status: 'live' | 'resolved') => {
    setStatusFilter(prev => prev === status ? 'all' : status);
  }, []);

  // ── Incident selection ────────────────────────────────────────────────────────

  const handlePointClick = useCallback((point: any) => {
    setSelectedIncident(point as GlobeIncident);
    setMobileFilterOpen(false);
    pauseRotation();
  }, [pauseRotation]);

  const handleGlobeClick = useCallback(() => {
    setSelectedIncident(null);
    resumeRotation();
  }, [resumeRotation]);

  // ── Tooltips ──────────────────────────────────────────────────────────────────

  const pointLabel = useCallback((d: any) => {
    const inc = d as GlobeIncident;
    const accent = inc.isLive ? '#ff5050' : '#ffb930';
    const status = inc.isLive ? '● LIVE' : '✓ RESOLVED';
    return `<div style="background:#0b0e11ee;border:1px solid ${accent};padding:6px 10px;
                color:${accent};font:11px/1.6 'JetBrains Mono',monospace;border-radius:3px;">
      <strong>${inc.label}</strong> · ${inc.locationName}<br/>
      ${inc.type} · ${status}
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

        pointsData={displayedIncidents}
        pointLat={(d: any) => d.lat}
        pointLng={(d: any) => d.lng}
        pointColor={(d: any) => (d as GlobeIncident).isLive ? '#ff5050' : '#ffb930'}
        pointRadius={(d: any) => (d as GlobeIncident).isLive ? 0.45 : 0.42}
        pointAltitude={(d: any) => (d as GlobeIncident).isLive ? 0.025 : 0.015}
        pointLabel={pointLabel}
        onPointHover={(point) => { if (point) pauseRotation(); }}
        onPointClick={handlePointClick}

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

      {/* ════════════════════════════════════════════════════════════════════════
          DESKTOP LAYOUT  (md and above)
          ════════════════════════════════════════════════════════════════════ */}

      {/* ── Desktop: top title ───────────────────────────────────────────────── */}
      <div aria-hidden className="hidden md:block absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none text-center">
        <div className="text-[10px] text-[#00e6a0] tracking-[0.3em] uppercase opacity-60">
          Haverim Mehalzim · Live Operations
        </div>
      </div>

      {/* ── Desktop: status board (top-right) ───────────────────────────────── */}
      <div className="hidden md:block absolute top-10 right-6 pointer-events-none">
        <div className="border border-[#00e6a0]/30 bg-[#0B0E11]/85 px-4 py-3" style={{ minWidth: 180 }}>
          <div className="text-[9px] text-[#00e6a0] tracking-[0.2em] uppercase border-b border-[#00e6a0]/20 pb-1.5 mb-2">
            ◈ Status Board
          </div>
          <StatusRow label="Operations" value={filteredTotal}          color="text-white" />
          <StatusRow label="Live"       value={liveIncidents.length}   color="text-red-400" />
          <StatusRow label="Resolved"   value={resolvedIncidents.length} color="text-amber-400" />
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

      {/* ── Desktop: left sidebar ────────────────────────────────────────────── */}
      <div className="hidden md:flex absolute top-10 bottom-10 left-6 flex-col gap-3 pointer-events-none" style={{ width: 190 }}>

        <div className="pointer-events-auto">
          <Link to="/"
            className="flex items-center gap-1.5 text-[9px] tracking-[0.18em] uppercase
                       text-[#00e6a0] border border-[#00e6a0]/30 bg-[#0B0E11]/85
                       px-3 py-1.5 hover:bg-[#00e6a0]/10 transition-colors">
            ← Dashboard
          </Link>
        </div>

        {selectedIncident && (
          <div className="bg-[#0B0E11]/95 px-4 py-3 pointer-events-auto"
            style={{
              border: `1px solid ${selectedIncident.isResolved ? GOLD + '55' : '#00e6a066'}`,
            }}>
            <IncidentDetail
              incident={selectedIncident}
              onClose={() => setSelectedIncident(null)}
              compact
            />
          </div>
        )}

        {incidentTypeCounts.length > 0 && (
          <div className="border border-[#00e6a0]/20 bg-[#0B0E11]/85 px-3 py-3 pointer-events-auto">
            <FilterList
              incidentTypeCounts={incidentTypeCounts}
              selectedTypes={selectedTypes}
              toggleType={toggleType}
              resetTypes={resetTypes}
            />
          </div>
        )}

        <div className="border border-[#00e6a0]/20 bg-[#0B0E11]/85 px-3 py-2.5 space-y-1.5 pointer-events-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] text-[#00e6a0] tracking-[0.2em] uppercase">Legend</span>
            {statusFilter !== 'all'
              ? <button onClick={() => setStatusFilter('all')} className="text-[8px] text-[#3d5a72] hover:text-[#00e6a0] tracking-wider uppercase transition-colors">Reset</button>
              : <span className="text-[8px] text-[#3d5a72] tracking-wider">tap to filter</span>
            }
          </div>
          <button
            onClick={() => toggleStatusFilter('live')}
            className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded transition-colors"
            style={{
              background: statusFilter === 'live' ? 'rgba(255,80,80,0.12)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${statusFilter === 'live' ? 'rgba(255,80,80,0.35)' : 'rgba(255,255,255,0.08)'}`,
              opacity: statusFilter === 'resolved' ? 0.35 : 1,
            }}
          >
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 border-2 border-red-500" />
            </span>
            <span className="text-[9px] text-red-400 tracking-[0.2em] uppercase flex-1">Live incident</span>
            <Tooltip text="Incident currently open — our volunteers are actively responding" />
          </button>
          <button
            onClick={() => toggleStatusFilter('resolved')}
            className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded transition-colors"
            style={{
              background: statusFilter === 'resolved' ? 'rgba(255,185,48,0.10)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${statusFilter === 'resolved' ? 'rgba(255,185,48,0.30)' : 'rgba(255,255,255,0.08)'}`,
              opacity: statusFilter === 'live' ? 0.35 : 1,
            }}
          >
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#ffb930' }} />
            <span className="text-[9px] text-amber-400 tracking-[0.2em] uppercase flex-1">Resolved incident</span>
            <Tooltip text="Incident successfully handled — outcome confirmed by our team" />
          </button>
        </div>
      </div>

      {/* ── Desktop: donate CTA (bottom-right) ──────────────────────────────── */}
      <div className="hidden md:block absolute bottom-10 right-6">
        <a href={DONATE_URL} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2
                     border border-[#00e6a0]/40 bg-[#0B0E11]/90
                     text-[9px] tracking-[0.18em] uppercase text-[#00e6a0]
                     hover:bg-[#00e6a0]/15 transition-colors">
          <span>♥</span>
          <span>Support Our Mission</span>
        </a>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          MOBILE LAYOUT  (below md)
          ════════════════════════════════════════════════════════════════════ */}

      {/* ── Mobile: top HUD bar ──────────────────────────────────────────────── */}
      <div className="md:hidden absolute top-0 left-0 right-0 z-50 flex items-center justify-between
                      px-4 py-3 bg-[#0B0E11]/95 border-b border-[#00e6a0]/25">
        <Link to="/"
          className="flex items-center gap-1.5 text-[11px] tracking-[0.12em] uppercase font-bold
                     text-[#00e6a0] active:opacity-70 transition-opacity">
          ← Back
        </Link>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] text-[#00e6a0] tracking-[0.25em] uppercase opacity-60">Live Ops</span>
          <span className="text-[13px] font-bold text-white tabular-nums">{filteredTotal} ops</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[12px] font-bold text-red-400 tabular-nums">{liveIncidents.length} live</span>
          <span className="text-[11px] font-bold text-amber-400 tabular-nums">{resolvedIncidents.length} resolved</span>
        </div>
      </div>

      {/* ── Mobile: bottom action bar ────────────────────────────────────────── */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 z-50 flex items-center justify-between
                      px-4 bg-[#0B0E11]/95 border-t border-[#00e6a0]/25 pointer-events-auto"
           style={{ paddingTop: 12, paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
        <button
          onClick={() => { setMobileFilterOpen(o => !o); setSelectedIncident(null); }}
          className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase transition-colors"
          style={{ color: (mobileFilterOpen || selectedTypes.size > 0) ? '#00e6a0' : '#7a9ab5' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <line x1="2" y1="4" x2="12" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="4" y1="7" x2="10" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="6" y1="10" x2="8"  y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Filter{selectedTypes.size > 0 ? ` (${selectedTypes.size})` : ''}
        </button>

        <a href={DONATE_URL} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase
                     text-[#00e6a0] bg-[#00e6a0]/10 border border-[#00e6a0]/30
                     px-3 py-1.5 active:opacity-70 transition-opacity">
          ♥ Donate
        </a>
      </div>

      {/* ── Mobile: filter bottom sheet ──────────────────────────────────────── */}
      {/* Backdrop */}
      {mobileFilterOpen && (
        <div className="md:hidden absolute inset-0 z-30 bg-black/40"
          onClick={() => setMobileFilterOpen(false)} />
      )}
      <div
        className="md:hidden absolute left-0 right-0 bottom-0 z-40 rounded-t-2xl
                   bg-[#0d1117] border-t border-[#00e6a0]/30 overflow-hidden
                   transition-transform duration-300 ease-out"
        style={{
          transform: mobileFilterOpen ? 'translateY(0)' : 'translateY(100%)',
          pointerEvents: mobileFilterOpen ? 'auto' : 'none',
          maxHeight: '70vh',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#3d5a72]" />
        </div>
        <div className="overflow-y-auto px-5 pb-20 pt-2" style={{ maxHeight: 'calc(70vh - 32px)' }}>
          <FilterList
            incidentTypeCounts={incidentTypeCounts}
            selectedTypes={selectedTypes}
            toggleType={toggleType}
            resetTypes={resetTypes}
          />
          <div className="border-t border-[#00e6a0]/15 mt-4 pt-4 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] text-[#00e6a0] tracking-[0.2em] uppercase">Legend</span>
              {statusFilter !== 'all'
                ? <button onClick={() => setStatusFilter('all')} className="text-[9px] text-[#3d5a72] hover:text-[#00e6a0] tracking-wider uppercase transition-colors">Reset</button>
                : <span className="text-[9px] text-[#3d5a72] tracking-wider">tap to filter</span>
              }
            </div>
            <button
              onClick={() => toggleStatusFilter('live')}
              className="flex items-center gap-3 w-full text-left px-3 py-2 rounded"
              style={{
                background: statusFilter === 'live' ? 'rgba(255,80,80,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${statusFilter === 'live' ? 'rgba(255,80,80,0.35)' : 'rgba(255,255,255,0.08)'}`,
                opacity: statusFilter === 'resolved' ? 0.35 : 1,
              }}
            >
              <span className="relative flex h-3 w-3 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 border-2 border-red-500" />
              </span>
              <span className="text-[12px] text-red-400 flex-1">Live incident</span>
              <Tooltip text="Incident currently open — our volunteers are actively responding" />
            </button>
            <button
              onClick={() => toggleStatusFilter('resolved')}
              className="flex items-center gap-3 w-full text-left px-3 py-2 rounded"
              style={{
                background: statusFilter === 'resolved' ? 'rgba(255,185,48,0.10)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${statusFilter === 'resolved' ? 'rgba(255,185,48,0.30)' : 'rgba(255,255,255,0.08)'}`,
                opacity: statusFilter === 'live' ? 0.35 : 1,
              }}
            >
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: '#ffb930' }} />
              <span className="text-[12px] text-amber-400 flex-1">Resolved incident</span>
              <Tooltip text="Incident successfully handled — outcome confirmed by our team" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile: incident detail bottom sheet ─────────────────────────────── */}
      {/* Backdrop */}
      {selectedIncident && (
        <div className="md:hidden absolute inset-0 z-30 bg-black/40"
          onClick={() => { setSelectedIncident(null); resumeRotation(); }} />
      )}
      <div
        className="md:hidden absolute left-0 right-0 bottom-0 z-40 rounded-t-2xl bg-[#0d1117]
                   transition-transform duration-300 ease-out"
        style={{
          borderTop: selectedIncident
            ? `1px solid ${selectedIncident.isResolved ? GOLD + '55' : '#00e6a04d'}`
            : '1px solid transparent',
          transform: selectedIncident ? 'translateY(0)' : 'translateY(100%)',
          pointerEvents: selectedIncident ? 'auto' : 'none',
        }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#3d5a72]" />
        </div>
        {selectedIncident && (
          <div className="px-5 pb-20 pt-2">
            <IncidentDetail
              incident={selectedIncident}
              onClose={() => { setSelectedIncident(null); resumeRotation(); }}
            />
          </div>
        )}
      </div>

      {/* ── Error (both layouts) ──────────────────────────────────────────────── */}
      {error && (
        <div className="md:hidden absolute top-16 left-4 right-4 z-10
                        border border-red-500/40 bg-[#0B0E11]/90 px-3 py-2 text-[9px] text-red-400 tracking-wider">
          ⚠ {error}
        </div>
      )}
    </div>
  );
}
