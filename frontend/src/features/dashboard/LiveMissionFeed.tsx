import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchGlobeIncidents, type GlobeIncident } from '../map/GlobeService';
import { useDonate } from '../../context/DonateContext';

const DONATE_URL = 'https://www.jgive.com/new/en/usd/donation-targets/110214';
const GOLD  = '#D4AF37';
const TEAL  = '#00e6a0';
const RED   = '#ff4040';
const MONO  = "'JetBrains Mono', monospace";
const READ_MS = 2000; // ms to hold card after typing before advancing

// ─── Typewriter ───────────────────────────────────────────────────────────────

function useTypewriter(text: string, speed = 18, forceComplete = false): { displayed: string; done: boolean } {
  const [displayed, setDisplayed] = useState('');
  const prev = useRef('');
  useEffect(() => {
    if (prev.current !== text) { setDisplayed(''); prev.current = text; }
    if (forceComplete) { setDisplayed(text); return; }
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, forceComplete]);
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
  incident, position, total, onTypingDone, isReading, forceComplete, onSkip,
}: {
  incident: GlobeIncident; position: number; total: number;
  onTypingDone: () => void; isReading: boolean; forceComplete: boolean; onSkip: () => void;
}) {
  const { openDonate } = useDonate();
  const story = incident.description
    || `${incident.type} case — volunteers are being coordinated to support ${incident.locationName}.`;
  const speed = Math.min(40, Math.max(10, Math.round(5000 / story.length)));
  const { displayed: typed, done: typingDone } = useTypewriter(story, speed, forceComplete);

  const notifiedRef = useRef(false);
  useEffect(() => { notifiedRef.current = false; }, [incident.id]);
  useEffect(() => {
    if (!notifiedRef.current && typingDone) {
      notifiedRef.current = true;
      onTypingDone();
    }
  }, [typingDone, onTypingDone]);

  return (
    <div
      onClick={onSkip}
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(0,18,10,0.97) 0%, rgba(8,11,20,0.97) 100%)',
        border: `1px solid ${typingDone ? TEAL + '44' : TEAL + '2e'}`,
        borderRadius: 8,
        padding: '26px 26px 22px',
        overflow: 'hidden',
        boxShadow: `0 0 60px ${TEAL}0d, inset 0 1px 0 ${TEAL}18`,
        transition: 'border-color 0.6s',
        cursor: !typingDone ? 'pointer' : 'default',
      }}
    >
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: RED }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: RED }} />
                </span>
                <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.22em', fontWeight: 700, color: RED }}>LIVE</span>
              </div>
              <span style={{ fontFamily: MONO, fontSize: 8, color: `${TEAL}40`, letterSpacing: '0.1em' }}>click to skip →</span>
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
        <a href={DONATE_URL} onClick={e => { e.preventDefault(); openDonate(); }}
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

// ─── Queue row (all non-active incidents, shown immediately) ─────────────────

function QueueRow({ incident, seq, isDone }: { incident: GlobeIncident; seq: number; isDone: boolean }) {
  const { openDonate } = useDonate();
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered]   = useState(false);
  const story = incident.description
    || `${incident.type} case — volunteers coordinated to support ${incident.locationName}.`;

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', opacity: isDone ? 1 : 0.45, transition: 'opacity 0.4s' }}>
      {/* Compact row */}
      <div
        onClick={() => { if (isDone) setExpanded(e => !e); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px',
          background: hovered && isDone ? 'rgba(0,230,160,0.03)' : 'transparent',
          transition: 'background 0.15s',
          cursor: isDone ? 'pointer' : 'default',
        }}
      >
        <span style={{ fontFamily: MONO, fontSize: 9, color: isDone ? TEAL : '#2a3a46', minWidth: 20, flexShrink: 0 }}>
          {isDone ? '✓' : String(seq).padStart(2, '0')}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 11, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#4a6d88' }}>
          {incident.locationName}
          <span style={{ color: '#1d2a30', margin: '0 7px' }}>—</span>
          <span style={{ color: `${TEAL}55` }}>{incident.type}</span>
          {incident.country && incident.country !== 'Unknown' && (
            <span style={{ color: '#1d2a30', margin: '0 7px' }}>· {incident.country}</span>
          )}
        </span>
        {isDone ? (
          <span style={{ fontFamily: MONO, fontSize: 8, color: `${TEAL}50`, letterSpacing: '0.1em', flexShrink: 0 }}>
            {expanded ? '▲ close' : '▼ read'}
          </span>
        ) : (
          <a href={DONATE_URL} onClick={e => { e.preventDefault(); e.stopPropagation(); openDonate(); }}
            style={{
              fontFamily: MONO, fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700,
              color: `${GOLD}55`, border: `1px solid ${GOLD}1a`, background: `${GOLD}06`,
              padding: '3px 9px', borderRadius: 2, textDecoration: 'none', flexShrink: 0,
            }}
          >Fund ›</a>
        )}
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div style={{
          padding: '18px 22px 20px',
          background: 'rgba(0,230,160,0.025)',
          borderTop: '1px solid rgba(0,230,160,0.08)',
          animation: 'lmf-fadein 0.2s ease both',
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.75)', letterSpacing: '-0.3px', marginBottom: 10 }}>
            {incident.locationName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{
              fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: `${TEAL}88`, padding: '3px 10px', border: `1px solid ${TEAL}22`, background: `${TEAL}08`, borderRadius: 3,
            }}>{incident.type}</span>
            {incident.country && incident.country !== 'Unknown' && (
              <span style={{ fontFamily: MONO, fontSize: 9, color: '#3d5a72', letterSpacing: '0.08em' }}>{incident.country}</span>
            )}
          </div>
          <p style={{ fontFamily: MONO, fontSize: 11, lineHeight: 1.85, color: 'rgba(100,135,160,0.85)', margin: '0 0 16px' }}>
            {story}
          </p>
          <a href={DONATE_URL} onClick={e => { e.preventDefault(); openDonate(); }}
            style={{
              fontFamily: MONO, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700,
              color: `${GOLD}88`, border: `1px solid ${GOLD}22`, background: `${GOLD}08`,
              padding: '6px 16px', borderRadius: 3, textDecoration: 'none', display: 'inline-block', transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >♥ Fund This Mission</a>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function LiveMissionFeed() {
  const { openDonate } = useDonate();
  const [incidents,     setIncidents]     = useState<GlobeIncident[]>([]);
  const [broadcastIdx,  setBroadcastIdx]  = useState(0);
  const [completedIdxs, setCompletedIdxs] = useState<number[]>([]);
  const [phase,         setPhase]         = useState<'typing' | 'reading' | 'done'>('typing');
  const [skipTyping,    setSkipTyping]    = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [blink,         setBlink]         = useState(false);
  const [collapsed,     setCollapsed]     = useState(true);
  const [isMobile,      setIsMobile]      = useState(false);
  const readTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    fetchGlobeIncidents()
      .then(all => { setIncidents(all); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const live = incidents.filter(i => i.isLive).slice(0, 4);

  useEffect(() => {
    const id = setInterval(() => setBlink(b => !b), 900);
    return () => clearInterval(id);
  }, []);

  const handleTypingDone = useCallback(() => setPhase('reading'), []);

  const advance = () => {
    if (readTimerRef.current) { clearTimeout(readTimerRef.current); readTimerRef.current = null; }
    setSkipTyping(false);
    setCompletedIdxs(prev => [...prev, broadcastIdx]);
    if (broadcastIdx >= live.length - 1) {
      setPhase('done');
    } else {
      setBroadcastIdx(i => i + 1);
      setPhase('typing');
    }
  };

  const handleSkip = () => {
    if (phase === 'typing') {
      setSkipTyping(true); // typewriter jumps to end → onTypingDone fires → reading phase
    } else if (phase === 'reading') {
      advance();
    }
  };

  // After reading phase ends, settle the card and advance (or finish)
  useEffect(() => {
    if (phase !== 'reading' || live.length === 0) return;
    readTimerRef.current = setTimeout(advance, READ_MS);
    return () => { if (readTimerRef.current) clearTimeout(readTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

      {/* ── Collapsible body ────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        maxHeight: isMobile && collapsed ? 170 : undefined,
        overflow: isMobile && collapsed ? 'hidden' : undefined,
      }}>

        {/* ── Active broadcast card ─────────────────────────────────────────── */}
        {!allBroadcast && (
          <div style={{ padding: '14px 14px 0' }}>
            <IncomingCard
              key={broadcastIdx}
              incident={live[broadcastIdx]}
              position={broadcastIdx}
              total={live.length}
              onTypingDone={handleTypingDone}
              isReading={phase === 'reading'}
              forceComplete={skipTyping}
              onSkip={handleSkip}
            />
          </div>
        )}

        {/* ── All broadcast banner ──────────────────────────────────────────── */}
        {allBroadcast && (
          <div style={{
            margin: '14px 14px 0',
            padding: '16px 22px',
            background: `rgba(0,230,160,0.04)`,
            border: `1px solid ${TEAL}22`,
            borderRadius: 8,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <span style={{ fontSize: 16, color: TEAL, flexShrink: 0 }}>✓</span>
            <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: TEAL }}>
              All {live.length} Active Missions Broadcast
            </div>
          </div>
        )}

        {/* ── Immediate queue — all other incidents visible from the start ──── */}
        {(live.length > 1 || allBroadcast) && (
          <>
            <div style={{
              padding: '12px 20px 4px',
              marginTop: 10,
              borderTop: '1px solid rgba(255,255,255,0.03)',
              fontFamily: MONO, fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1d2a30',
            }}>
              {allBroadcast ? 'All Missions' : 'Active Queue'}
            </div>
            {live.map((inc, i) => {
              if (!allBroadcast && i === broadcastIdx) return null;
              return (
                <QueueRow
                  key={inc.id}
                  incident={inc}
                  seq={i + 1}
                  isDone={completedIdxs.includes(i) || allBroadcast}
                />
              );
            })}
          </>
        )}

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div style={{
          padding: '14px 20px', marginTop: 14,
          borderTop: `1px solid ${GOLD}15`,
          background: `${GOLD}06`,
          fontFamily: MONO, fontSize: 10, lineHeight: 1.7, color: `${GOLD}aa`,
        }}>
          Every active mission above relies on donor funding —{' '}
          <a href={DONATE_URL} onClick={e => { e.preventDefault(); openDonate(); }}
            style={{ color: GOLD, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            your contribution keeps our team operational 24/7 ›
          </a>
        </div>

        {/* ── Gradient fade + Read more (mobile collapsed) ──────────────────── */}
        {isMobile && collapsed && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
            background: 'linear-gradient(to bottom, transparent, #07090e)',
            pointerEvents: 'none',
          }} />
        )}
      </div>

      {/* ── Read more / Show less toggle (mobile only) ──────────────────────── */}
      {isMobile && (
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            width: '100%',
            padding: '12px 20px',
            background: collapsed ? `rgba(0,230,160,0.04)` : 'transparent',
            border: 'none',
            borderTop: `1px solid ${TEAL}18`,
            fontFamily: MONO,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: TEAL,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = `rgba(0,230,160,0.08)`)}
          onMouseLeave={e => (e.currentTarget.style.background = collapsed ? `rgba(0,230,160,0.04)` : 'transparent')}
        >
          {collapsed ? <>Read more <span style={{ fontSize: 14 }}>↓</span></> : <>Show less <span style={{ fontSize: 14 }}>↑</span></>}
        </button>
      )}

    </div>
  );
}
