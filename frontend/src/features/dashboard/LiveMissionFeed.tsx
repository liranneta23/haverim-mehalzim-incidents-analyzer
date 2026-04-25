import { useEffect, useRef, useState } from 'react';
import { fetchGlobeIncidents, type GlobeIncident } from '../map/GlobeService';

const DONATE_URL = 'https://www.jgive.com/new/en/usd/donation-targets/110214';
const GOLD = '#D4AF37';

// ─────────────────────────────────────────────────────────────────────────────
// Typewriter hook
// ─────────────────────────────────────────────────────────────────────────────

function useTypewriter(text: string, active: boolean, speed = 28): string {
  const [displayed, setDisplayed] = useState(active ? '' : text);
  const prevText = useRef(text);

  useEffect(() => {
    if (!active) { setDisplayed(text); return; }
    // Reset when text changes (new spotlight incident)
    if (prevText.current !== text) {
      setDisplayed('');
      prevText.current = text;
    }
    let i = displayed.length;
    if (i >= text.length) return;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, active]); // eslint-disable-line react-hooks/exhaustive-deps

  return displayed;
}

// ─────────────────────────────────────────────────────────────────────────────
// Feed row
// ─────────────────────────────────────────────────────────────────────────────

function FeedRow({ incident, isSpotlight }: { incident: GlobeIncident; isSpotlight: boolean }) {
  const line = `${incident.locationName.toUpperCase()} — ${incident.type}`;
  const typed = useTypewriter(line, isSpotlight);

  return (
    <div
      className="group flex items-start gap-3 px-4 py-3 border-b border-[#00e6a0]/10 last:border-0 transition-colors"
      style={{ background: isSpotlight ? 'rgba(0,230,160,0.04)' : 'transparent' }}
    >
      {/* Live pulse */}
      <div className="mt-[3px] flex-shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative rounded-full h-2 w-2 bg-red-500" />
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-bold tracking-[0.18em] text-[#00e6a0]">{incident.label}</span>
          <span className="text-[8px] tracking-wider text-[#3d5a72] uppercase">active</span>
          {isSpotlight && (
            <span className="text-[8px] tracking-wider px-1.5 py-0.5 rounded"
              style={{ background: `${GOLD}18`, color: GOLD, border: `1px solid ${GOLD}33` }}>
              ◈ INCOMING
            </span>
          )}
        </div>
        <div className="text-[11px] text-[#c0d0e0] font-mono leading-snug">
          {isSpotlight ? (
            <>{typed}<span className="animate-pulse">▌</span></>
          ) : line}
        </div>
      </div>

      {/* CTA — always visible on mobile, hover on desktop */}
      <a
        href={DONATE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 text-[9px] tracking-[0.1em] uppercase font-bold
                   px-2.5 py-1.5 border rounded whitespace-nowrap
                   transition-all md:opacity-0 md:group-hover:opacity-100"
        style={{
          color: GOLD,
          borderColor: `${GOLD}55`,
          background: `${GOLD}10`,
        }}
        title="Provide the resources needed for this rescue"
      >
        Fund ›
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function LiveMissionFeed() {
  const [incidents, setIncidents] = useState<GlobeIncident[]>([]);
  const [spotlightIdx, setSpotlightIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch once on mount; refresh every 5 min
  useEffect(() => {
    const load = () =>
      fetchGlobeIncidents()
        .then(all => { setIncidents(all); setLoading(false); })
        .catch(() => setLoading(false));
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const liveIncidents = incidents.filter(i => i.isLive).slice(0, 8);

  // Cycle spotlight every 4 s
  useEffect(() => {
    if (liveIncidents.length < 2) return;
    const id = setInterval(
      () => setSpotlightIdx(i => (i + 1) % liveIncidents.length),
      4000,
    );
    return () => clearInterval(id);
  }, [liveIncidents.length]);

  if (loading) {
    return (
      <div className="panel fade-in" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <div className="panel-header">
          <div className="panel-title" style={{ color: '#00e6a0' }}>◈ Live Mission Feed</div>
        </div>
        <div className="flex items-center justify-center py-8 gap-2 text-[11px] text-[#3d5a72]">
          <span className="animate-spin">◌</span> Connecting to operations center…
        </div>
      </div>
    );
  }

  if (liveIncidents.length === 0) {
    return (
      <div className="panel fade-in" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <div className="panel-header">
          <div className="panel-title" style={{ color: '#00e6a0' }}>◈ Live Mission Feed</div>
        </div>
        <div className="empty">No active missions at this time</div>
      </div>
    );
  }

  return (
    <div
      className="panel fade-in"
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        borderColor: 'rgba(0,230,160,0.25)',
      }}
    >
      {/* Header */}
      <div className="panel-header" style={{ borderBottomColor: 'rgba(0,230,160,0.15)' }}>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="panel-title" style={{ color: '#00e6a0', letterSpacing: '0.05em' }}>
            Live Mission Feed
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="panel-count">{liveIncidents.length} active</span>
          <a
            href={DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] tracking-[0.12em] uppercase font-bold px-2.5 py-1 border rounded
                       transition-all hover:opacity-80"
            style={{ color: GOLD, borderColor: `${GOLD}55`, background: `${GOLD}12` }}
          >
            Support This Mission
          </a>
        </div>
      </div>

      {/* Feed rows */}
      <div className="panel-body" style={{ padding: 0 }}>
        {liveIncidents.map((inc, idx) => (
          <FeedRow
            key={inc.id}
            incident={inc}
            isSpotlight={idx === spotlightIdx}
          />
        ))}
      </div>

      {/* Footer nudge */}
      <div
        className="px-4 py-3 border-t text-[10px] leading-relaxed"
        style={{
          borderColor: `${GOLD}20`,
          background: `${GOLD}08`,
          color: `${GOLD}cc`,
        }}
      >
        Every active mission above relies on donor funding. Your contribution keeps our team
        operational 24/7 —{' '}
        <a
          href={DONATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:opacity-80 font-bold"
          style={{ color: GOLD }}
        >
          provide the resources needed for this rescue ›
        </a>
      </div>
    </div>
  );
}
