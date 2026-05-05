import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchGlobeIncidents, type GlobeIncident } from '../map/GlobeService';

const DONATE_URL = 'https://www.jgive.com/new/en/usd/donation-targets/110214';
const GOLD  = '#D4AF37';
const TEAL  = '#00e6a0';
const RED   = '#ff4040';
const MONO  = "'JetBrains Mono', monospace";
const READ_MS = 4000; // ms to hold card after typing before advancing

// ─── Typewriter ───────────────────────────────────────────────────────────────

function useTypewriter(text: string, speed = 18): { displayed: string; done: boolean } {
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
  return { displayed, done: displayed.length > 0 && displayed.length >= text.length };
}

// ─── HUD corner ───────────────────────────────────────────────────────────────

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

// ─── Reading countdown bar ────────────────────────────────────────────────────

function ReadingBar({ duration }: { duration: number }) {
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
    <div style={{ height: 2, background: `rgba(0,230,160,0.08)`, borderRadius: 1, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${TEAL}88, ${TEAL})`, borderRadius: 1 }} />
    </div>
  );
}

// ─── Incoming card (currently broadcasting with typewriter) ───────────────────

function IncomingCard({
  incident, position, total, onTypingDone, isReading,
}: {
  incident: GlobeIncident; position: number; total: number;
  onTypingDone: () => void; isReading: boolean;
}) {
  const story = incident.description
    || `${incident.type} case opened — volunteers are being coordinated to support ${incident.locationName}.`;
  const { displayed: typed, done: typingDone } = useTypewriter(story);

  const notifiedRef = useRef(false);
  useEffect(() => { notifiedRef.current = false; }, [incident.id]);
  useEffect(() => {
    if (!notifiedRef.current && typingDone) {
      notifiedRef.current = true;
      onTypingDone();
    }
  }, [typingDone, onTypingDone]);

  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(135deg, rgba(0,18,10,0.97) 0%, rgba(8,11,20,0.97) 100%)',
      border: `1px solid ${typingDone ? TEAL + '44' : TEAL + '2e'}`,
      borderRadius: 8,
      padding: '26px 26px 22px',
      overflow: 'hidden',
      boxShadow: `0 0 60px ${TEAL}0d, inset 0 1px 0 ${TEAL}18`,
      transition: 'border-color 0.6s',
    }}>
      {/* Scan line — only while typing */}
      {!typingDone && (
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 1, top: 0, pointerEvents: 'none',
          background: `linear-gradient(90deg, transparent 0%, ${TEAL}55 35%, ${TEAL}cc 50%, ${TEAL}55 65%, transparent 100%)`,
          animation: 'lmf-scan 4.5s ease-in infinite',
        }} />
      )}
      <HudCorner pos="tl" /><HudCorner pos="tr" />
      <HudCorner pos="bl" /><HudCorner pos="br" />

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: `${TEAL}66` }}>
          ◈ {typingDone ? 'Transmission Received' : 'Incoming Transmission'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontFamily: MONO, fontSize: 9, color: '#2a3a46', letterSpacing: '0.1em' }}>
            {position + 1} / {total}
          </span>
          {!typingDone ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: RED }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: RED }} />
              </span>
              <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.22em', fontWeight: 700, color: RED }}>LIVE</span>
            </div>
          ) : (
            <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.15em', color: TEAL, fontWeight: 700 }}>✓ RECEIVED</span>
          )}
        </div>
      </div>

      {/* Location */}
      <div style={{
        fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 800,
        color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.05,
        marginBottom: 12, textShadow: `0 0 40px ${TEAL}22`,
      }}>
        {incident.locationName}
      </div>

      {/* Type + country */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        <span style={{
          fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: TEAL,
          padding: '4px 12px', border: `1px solid ${TEAL}44`, background: `${TEAL}0f`, borderRadius: 3,
        }}>{incident.type}</span>
        <span style={{ fontFamily: MONO, fontSize: 9, color: '#3d5a72', letterSpacing: '0.12em' }}>{incident.label}</span>
        {incident.country && incident.country !== 'Unknown' && (
          <>
            <span style={{ color: '#2a3a46' }}>·</span>
            <span style={{ fontFamily: MONO, fontSize: 9, color: '#3d5a72', letterSpacing: '0.1em' }}>{incident.country}</span>
          </>
        )}
      </div>

      {/* Story */}
      <p style={{ fontFamily: MONO, fontSize: 12, lineHeight: 1.85, color: '#7a9ab5', margin: '0 0 22px', minHeight: 52 }}>
        {typed}
        {!typingDone && (
          <span style={{ animation: 'lmf-blink 0.8s step-end infinite', marginLeft: 1 }}>▌</span>
        )}
      </p>

      {/* CTA row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: isReading ? 14 : 0 }}>
        <a href={DONATE_URL} target="_blank" rel="noopener noreferrer"
          style={{
            fontFamily: MONO, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700,
            color: '#0B0E11', background: TEAL,
            padding: '10px 22px', borderRadius: 3, textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <span>♥</span> Fund This Mission
        </a>
        {isReading && (
          <span style={{ fontFamily: MONO, fontSize: 8, color: '#2a3a46', letterSpacing: '0.1em' }}>
            next mission in…
          </span>
        )}
      </div>

      {/* Reading countdown bar — only shown after typing, before advancing */}
      {isReading && <ReadingBar key={position} duration={READ_MS} />}
    </div>
  );
}

// ─── Completed card (settled, full story preserved) ───────────────────────────

function CompletedCard({ incident, seq }: { incident: GlobeIncident; seq: number }) {
  const story = incident.description
    || `${incident.type} case opened — volunteers were coordinated to support ${incident.locationName}.`;
  return (
    <div style={{
      position: 'relative',
      background: 'rgba(6,12,8,0.75)',
      border: `1px solid rgba(0,230,160,0.1)`,
      borderRadius: 8,
      padding: '18px 22px',
      animation: 'lmf-fadein 0.4s ease both',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: `${TEAL}44` }}>
          ◉ Transmitted
        </span>
        <span style={{ fontFamily: MONO, fontSize: 9, color: '#1d2a30', letterSpacing: '0.1em' }}>
          #{String(seq).padStart(2, '0')}
        </span>
      </div>
      <div style={{ fontSize: 19, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '-0.3px', marginBottom: 8 }}>
        {incident.locationName}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
        <span style={{
          fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: `${TEAL}66`, padding: '3px 10px', border: `1px solid ${TEAL}1a`, background: `${TEAL}06`, borderRadius: 3,
        }}>{incident.type}</span>
        {incident.country && incident.country !== 'Unknown' && (
          <span style={{ fontFamily: MONO, fontSize: 9, color: '#2a3a46', letterSpacing: '0.08em' }}>{incident.country}</span>
        )}
      </div>
      <p style={{ fontFamily: MONO, fontSize: 11, lineHeight: 1.8, color: 'rgba(100,135,160,0.65)', margin: '0 0 14px' }}>
        {story}
      </p>
      <a href={DONATE_URL} target="_blank" rel="noopener noreferrer"
        style={{
          fontFamily: MONO, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700,
          color: `${GOLD}88`, border: `1px solid ${GOLD}22`, background: `${GOLD}08`,
          padding: '5px 14px', borderRadius: 3, textDecoration: 'none', display: 'inline-block', transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        ♥ Fund This Mission
      </a>
    </div>
  );
}

// ─── Upcoming row (queued, not yet broadcast) ─────────────────────────────────

function UpcomingRow({ incident, index }: { incident: GlobeIncident; index: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '9px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.02)',
        background: hovered ? 'rgba(0,230,160,0.02)' : 'transparent', transition: 'background 0.15s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontFamily: MONO, fontSize: 9, color: '#1d2a30', minWidth: 20, flexShrink: 0 }}>
        {String(index + 1).padStart(2, '0')}
      </span>
      <span style={{ fontFamily: MONO, fontSize: 11, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#3d5a72' }}>
        {incident.locationName}
        <span style={{ color: '#1d2a30', margin: '0 7px' }}>—</span>
        <span style={{ color: `${TEAL}44` }}>{incident.type}</span>
      </span>
      <a href={DONATE_URL} target="_blank" rel="noopener noreferrer"
        style={{
          fontFamily: MONO, fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700,
          color: `${GOLD}55`, border: `1px solid ${GOLD}1a`, background: `${GOLD}06`,
          padding: '3px 9px', borderRadius: 2, textDecoration: 'none', flexShrink: 0,
        }}
      >Fund ›</a>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function LiveMissionFeed() {
  const [incidents,     setIncidents]     = useState<GlobeIncident[]>([]);
  const [broadcastIdx,  setBroadcastIdx]  = useState(0);
  const [completedIdxs, setCompletedIdxs] = useState<number[]>([]);
  const [phase,         setPhase]         = useState<'typing' | 'reading' | 'done'>('typing');
  const [loading,       setLoading]       = useState(true);
  const [blink,         setBlink]         = useState(false);

  useEffect(() => {
    fetchGlobeIncidents()
      .then(all => { setIncidents(all); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const live = incidents.filter(i => i.isLive).slice(0, 8);

  useEffect(() => {
    const id = setInterval(() => setBlink(b => !b), 900);
    return () => clearInterval(id);
  }, []);

  const handleTypingDone = useCallback(() => setPhase('reading'), []);

  // After reading phase ends, settle the card and advance (or finish)
  useEffect(() => {
    if (phase !== 'reading' || live.length === 0) return;
    const id = setTimeout(() => {
      setCompletedIdxs(prev => [...prev, broadcastIdx]);
      if (broadcastIdx >= live.length - 1) {
        setPhase('done');
      } else {
        setBroadcastIdx(i => i + 1);
        setPhase('typing');
      }
    }, READ_MS);
    return () => clearTimeout(id);
  }, [phase, broadcastIdx, live.length]);

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

  const allBroadcast = phase === 'done';
  // Show newest-completed first so it sits right below the incoming card
  const completedIncidents = [...completedIdxs].reverse().map(i => live[i]).filter(Boolean);
  const upcomingIncidents  = !allBroadcast ? live.slice(broadcastIdx + 1) : [];

  return (
    <div style={{
      background: 'linear-gradient(180deg, #060e09 0%, #07090e 100%)',
      border: `1px solid ${TEAL}22`,
      borderRadius: 10, overflow: 'hidden',
      boxShadow: `0 0 80px ${TEAL}07, 0 4px 32px rgba(0,0,0,0.4)`,
    }}>

      {/* Keyframes injected once */}
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
        @keyframes lmf-fadein {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: `1px solid ${TEAL}14`,
        background: `rgba(0,230,160,0.02)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!allBroadcast ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70" style={{ background: RED }} />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: RED }} />
            </span>
          ) : (
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: TEAL, flexShrink: 0, display: 'inline-block' }} />
          )}
          <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: TEAL }}>
            Live Operations Center
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.12em', color: '#3d5a72' }}>
            <span style={{ color: allBroadcast ? TEAL : (blink ? TEAL : '#3d5a72'), transition: 'color 0.2s' }}>◉</span>
            {' '}
            <span style={{ color: allBroadcast ? `${TEAL}aa` : `${TEAL}66` }}>
              {allBroadcast ? 'BROADCAST COMPLETE' : 'TRANSMISSION ACTIVE'}
            </span>
          </span>
          <span style={{
            fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
            color: allBroadcast ? TEAL : RED,
            border: `1px solid ${allBroadcast ? TEAL + '44' : RED + '44'}`,
            background: allBroadcast ? `${TEAL}0f` : `${RED}0f`,
            padding: '3px 10px', borderRadius: 3,
          }}>
            {live.length} ACTIVE
          </span>
        </div>
      </div>

      {/* ── Incoming card ───────────────────────────────────────────────────── */}
      {!allBroadcast && (
        <div style={{ padding: '14px 14px 0' }}>
          <IncomingCard
            key={broadcastIdx}
            incident={live[broadcastIdx]}
            position={broadcastIdx}
            total={live.length}
            onTypingDone={handleTypingDone}
            isReading={phase === 'reading'}
          />
        </div>
      )}

      {/* ── All broadcast banner ────────────────────────────────────────────── */}
      {allBroadcast && (
        <div style={{
          margin: '14px 14px 0',
          padding: '18px 22px',
          background: `rgba(0,230,160,0.04)`,
          border: `1px solid ${TEAL}22`,
          borderRadius: 8,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <span style={{ fontSize: 18, color: TEAL, flexShrink: 0 }}>✓</span>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: TEAL, marginBottom: 3 }}>
              All {live.length} Active Missions Broadcast
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: '#3d5a72', letterSpacing: '0.08em' }}>
              Full mission details logged below — your support keeps these operations running.
            </div>
          </div>
        </div>
      )}

      {/* ── Completed mission log ────────────────────────────────────────────── */}
      {completedIncidents.length > 0 && (
        <>
          <div style={{
            padding: '14px 20px 6px',
            fontFamily: MONO, fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1d2a30',
          }}>
            {allBroadcast ? 'All Missions' : 'Prior Transmissions'}
          </div>
          <div style={{ padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {completedIncidents.map((inc, i) => (
              <CompletedCard key={inc.id} incident={inc} seq={completedIdxs.length - i} />
            ))}
          </div>
        </>
      )}

      {/* ── Upcoming queue ───────────────────────────────────────────────────── */}
      {upcomingIncidents.length > 0 && (
        <>
          <div style={{
            padding: '12px 20px 6px',
            borderTop: '1px solid rgba(255,255,255,0.03)',
            fontFamily: MONO, fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1d2a30',
          }}>
            Up Next
          </div>
          {upcomingIncidents.map((inc, i) => (
            <UpcomingRow key={inc.id} incident={inc} index={i} />
          ))}
        </>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <div style={{
        padding: '14px 20px', marginTop: 14,
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
