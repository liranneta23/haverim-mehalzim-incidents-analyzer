import { useEffect, useRef, useState } from 'react';
import { fetchGlobeIncidents, type GlobeIncident } from '../map/GlobeService';

const DONATE_URL  = 'https://www.jgive.com/new/en/usd/donation-targets/110214';
const GOLD        = '#D4AF37';
const TEAL        = '#00e6a0';
const RED         = '#ff4040';
const MONO        = "'JetBrains Mono', monospace";
const CYCLE_MS    = 5000;

// ─────────────────────────────────────────────────────────────────────────────
// Typewriter
// ─────────────────────────────────────────────────────────────────────────────

function useTypewriter(text: string, speed = 18): string {
  const [displayed, setDisplayed] = useState('');
  const prev = useRef('');

  useEffect(() => {
    if (prev.current !== text) { setDisplayed(''); prev.current = text; }
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return displayed;
}

// ─────────────────────────────────────────────────────────────────────────────
// HUD corner decorator
// ─────────────────────────────────────────────────────────────────────────────

function HudCorner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const base: React.CSSProperties = { position: 'absolute', width: 10, height: 10, pointerEvents: 'none' };
  const s: Record<string, React.CSSProperties> = {
    tl: { top: 10, left: 10, borderTop: `1.5px solid ${TEAL}66`, borderLeft: `1.5px solid ${TEAL}66` },
    tr: { top: 10, right: 10, borderTop: `1.5px solid ${TEAL}66`, borderRight: `1.5px solid ${TEAL}66` },
    bl: { bottom: 10, left: 10, borderBottom: `1.5px solid ${TEAL}66`, borderLeft: `1.5px solid ${TEAL}66` },
    br: { bottom: 10, right: 10, borderBottom: `1.5px solid ${TEAL}66`, borderRight: `1.5px solid ${TEAL}66` },
  };
  return <div style={{ ...base, ...s[pos] }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cycle progress bar — remounts (via key) on every spotlight change
// ─────────────────────────────────────────────────────────────────────────────

function CycleBar({ duration }: { duration: number }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    let raf: number;
    const tick = (now: number) => {
      setPct(Math.min((now - t0) / duration * 100, 100));
      if (now - t0 < duration) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  return (
    <div style={{ height: 2, background: 'rgba(0,230,160,0.08)', borderRadius: 1, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${TEAL}88, ${TEAL})`, borderRadius: 1 }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Spotlight card
// ─────────────────────────────────────────────────────────────────────────────

function SpotlightCard({ incident, cycleKey }: { incident: GlobeIncident; cycleKey: number }) {
  const story  = incident.description || `${incident.type} case opened. Volunteers have been dispatched to ${incident.locationName}.`;
  const typed  = useTypewriter(story);
  const typing = typed.length < story.length;

  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(135deg, rgba(0,18,10,0.95) 0%, rgba(8,11,20,0.95) 100%)',
      border: `1px solid ${TEAL}2e`,
      borderRadius: 6,
      padding: '26px 26px 22px',
      overflow: 'hidden',
      boxShadow: `0 0 50px ${TEAL}0a, inset 0 1px 0 ${TEAL}12`,
    }}>

      {/* Keyframes */}
      <style>{`
        @keyframes lmf-scan {
          0%   { top: -1px; opacity: 0; }
          6%   { opacity: 1; }
          90%  { opacity: 0.5; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes lmf-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>

      {/* Scan line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 1, top: 0, pointerEvents: 'none',
        background: `linear-gradient(90deg, transparent 0%, ${TEAL}55 35%, ${TEAL}cc 50%, ${TEAL}55 65%, transparent 100%)`,
        animation: 'lmf-scan 4.5s ease-in infinite',
      }} />

      <HudCorner pos="tl" /><HudCorner pos="tr" />
      <HudCorner pos="bl" /><HudCorner pos="br" />

      {/* Top bar: eyebrow + LIVE badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: `${TEAL}66` }}>
          ◈ Mission in Progress
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: RED }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: RED }} />
          </span>
          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.22em', fontWeight: 700, color: RED }}>
            LIVE
          </span>
        </div>
      </div>

      {/* Location — hero text */}
      <div style={{
        fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800,
        color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.05,
        marginBottom: 14,
        textShadow: `0 0 40px ${TEAL}22`,
      }}>
        {incident.locationName}
      </div>

      {/* Type + label + country */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
        <span style={{
          fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: TEAL,
          padding: '4px 12px', border: `1px solid ${TEAL}44`, background: `${TEAL}0f`, borderRadius: 3,
        }}>{incident.type}</span>
        <span style={{ fontFamily: MONO, fontSize: 9, color: '#3d5a72', letterSpacing: '0.12em' }}>
          {incident.label}
        </span>
        {incident.country && incident.country !== 'Unknown' && (
          <>
            <span style={{ color: '#2a3a46' }}>·</span>
            <span style={{ fontFamily: MONO, fontSize: 9, color: '#3d5a72', letterSpacing: '0.1em' }}>
              {incident.country}
            </span>
          </>
        )}
      </div>

      {/* Typewriter story */}
      <p style={{
        fontFamily: MONO, fontSize: 12, lineHeight: 1.85,
        color: '#7a9ab5', margin: '0 0 24px', minHeight: 48,
      }}>
        {typed}
        {typing && (
          <span style={{ animation: 'lmf-blink 0.8s step-end infinite', marginLeft: 1 }}>▌</span>
        )}
      </p>

      {/* CTA row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
        <a href={DONATE_URL} target="_blank" rel="noopener noreferrer"
          style={{
            fontFamily: MONO, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700,
            color: '#0B0E11', background: TEAL,
            padding: '11px 24px', borderRadius: 3, textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <span>♥</span> Fund This Mission
        </a>
        <span style={{ fontFamily: MONO, fontSize: 8, color: '#2a3a46', letterSpacing: '0.1em' }}>
          next mission in…
        </span>
      </div>

      {/* Cycle progress bar */}
      <CycleBar key={cycleKey} duration={CYCLE_MS} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Queue row
// ─────────────────────────────────────────────────────────────────────────────

function QueueRow({ incident, index }: { incident: GlobeIncident; index: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.035)',
        background: hovered ? 'rgba(0,230,160,0.03)' : 'transparent',
        transition: 'background 0.15s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontFamily: MONO, fontSize: 9, color: '#22303a', minWidth: 20, flexShrink: 0 }}>
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
          style={{ background: RED }} />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: RED }} />
      </span>
      <span style={{ fontFamily: MONO, fontSize: 11, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        <span style={{ color: '#d0e0ea', fontWeight: 700 }}>{incident.locationName}</span>
        <span style={{ color: '#2a3a46', margin: '0 7px' }}>—</span>
        <span style={{ color: `${TEAL}77` }}>{incident.type}</span>
      </span>
      <span style={{ fontFamily: MONO, fontSize: 8, color: '#22303a', letterSpacing: '0.1em', flexShrink: 0 }}>
        {incident.label}
      </span>
      <a href={DONATE_URL} target="_blank" rel="noopener noreferrer"
        style={{
          fontFamily: MONO, fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700,
          color: GOLD, border: `1px solid ${GOLD}33`, background: `${GOLD}0a`,
          padding: '3px 9px', borderRadius: 2, textDecoration: 'none', flexShrink: 0, transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        Fund ›
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

export default function LiveMissionFeed() {
  const [incidents,    setIncidents]    = useState<GlobeIncident[]>([]);
  const [spotlightIdx, setSpotlightIdx] = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [blink,        setBlink]        = useState(false);

  useEffect(() => {
    const load = () =>
      fetchGlobeIncidents()
        .then(all => { setIncidents(all); setLoading(false); })
        .catch(() => setLoading(false));
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const live = incidents.filter(i => i.isLive).slice(0, 9);

  useEffect(() => {
    if (live.length < 2) return;
    const id = setInterval(() => setSpotlightIdx(i => (i + 1) % live.length), CYCLE_MS);
    return () => clearInterval(id);
  }, [live.length]);

  // Blinking "TRANSMISSION ACTIVE" indicator
  useEffect(() => {
    const id = setInterval(() => setBlink(b => !b), 900);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return (
      <div style={{
        background: '#060e09', border: `1px solid ${TEAL}1a`, borderRadius: 10,
        padding: '36px 24px', fontFamily: MONO,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        fontSize: 11, color: '#3d5a72',
      }}>
        <span className="animate-spin inline-block">◌</span>
        Connecting to operations center…
      </div>
    );
  }

  if (live.length === 0) {
    return (
      <div style={{
        background: '#060e09', border: `1px solid ${TEAL}1a`, borderRadius: 10,
        padding: '36px 24px', fontFamily: MONO, textAlign: 'center',
        fontSize: 11, color: '#3d5a72',
      }}>
        No active missions at this time.
      </div>
    );
  }

  const spotlight = live[spotlightIdx];
  const queue     = live.filter((_, i) => i !== spotlightIdx);

  return (
    <div style={{
      background: 'linear-gradient(180deg, #060e09 0%, #07090e 100%)',
      border: `1px solid ${TEAL}22`,
      borderRadius: 10, overflow: 'hidden',
      boxShadow: `0 0 80px ${TEAL}07, 0 4px 32px rgba(0,0,0,0.4)`,
    }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: `1px solid ${TEAL}14`,
        background: `rgba(0,230,160,0.02)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70"
              style={{ background: RED }} />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: RED }} />
          </span>
          <span style={{
            fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: TEAL,
          }}>
            Live Operations Center
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.12em', color: '#3d5a72' }}>
            <span style={{ color: blink ? TEAL : '#3d5a72', transition: 'color 0.2s' }}>◉</span>
            {' '}<span style={{ color: `${TEAL}66` }}>TRANSMISSION ACTIVE</span>
          </span>
          <span style={{
            fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
            color: RED, border: `1px solid ${RED}44`, background: `${RED}0f`,
            padding: '3px 10px', borderRadius: 3,
          }}>
            {live.length} ACTIVE
          </span>
        </div>
      </div>

      {/* ── Spotlight ─────────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 16px 10px' }}>
        <SpotlightCard incident={spotlight} cycleKey={spotlightIdx} />
      </div>

      {/* ── Queue ─────────────────────────────────────────────────────────── */}
      {queue.length > 0 && (
        <>
          <div style={{
            padding: '8px 20px 6px',
            borderTop: '1px solid rgba(255,255,255,0.03)',
            fontFamily: MONO, fontSize: 8, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: '#22303a',
          }}>
            Other Active Missions
          </div>
          {queue.map((inc, i) => <QueueRow key={inc.id} incident={inc} index={i} />)}
        </>
      )}

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div style={{
        padding: '14px 20px',
        borderTop: `1px solid ${GOLD}15`,
        background: `${GOLD}06`,
        fontFamily: MONO, fontSize: 10, lineHeight: 1.7, color: `${GOLD}aa`,
      }}>
        Every active mission above relies on donor funding —{' '}
        <a href={DONATE_URL} target="_blank" rel="noopener noreferrer"
          style={{ color: GOLD, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3 }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          your contribution keeps our team operational 24/7 ›
        </a>
      </div>

    </div>
  );
}
