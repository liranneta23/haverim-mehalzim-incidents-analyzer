import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import './tracker.css';

// ─── Step definitions ─────────────────────────────────────────────────────────

interface StepDef { step: number; title: string; subtitle: string; icon: string; }

const NORMAL_STEPS: StepDef[] = [
  { step: 1, title: 'Request Received',              subtitle: 'We are with you.',                                                                    icon: '◉' },
  { step: 2, title: 'Situation Assessment',           subtitle: 'We are reviewing what happened and how urgent it is.',                                icon: '◈' },
  { step: 3, title: 'Critical Information Verified',  subtitle: 'Identity, location, status, and contact details are being confirmed.',                icon: '✦' },
  { step: 4, title: 'Case Officer Assigned',          subtitle: 'A dedicated person is managing the case.',                                            icon: '◎' },
  { step: 5, title: 'Response Network Activated',     subtitle: 'The right people are being connected.',                                               icon: '⊕' },
  { step: 6, title: 'Action Plan in Motion',          subtitle: 'The required steps are underway.',                                                    icon: '▸' },
  { step: 7, title: "Person's Status Verified",       subtitle: 'The family receives a clear and personal update.',                                    icon: '◇' },
  { step: 8, title: 'Support & Next Steps',           subtitle: 'We continue supporting the family through the next steps.',                           icon: '♡' },
];

const SENSITIVE_STEPS: StepDef[] = [
  ...NORMAL_STEPS.slice(0, 6),
  { step: 7, title: 'Family Notified with Care',      subtitle: 'The family has been updated personally and with care.',                               icon: '◇' },
  { step: 8, title: 'Family Support & Next Steps',    subtitle: 'We continue supporting the family through the next steps.',                           icon: '♡' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface CaseData {
  item_id:      string;
  step:         number;
  is_sensitive: boolean;
  opened_date:  string | null;
  total_steps:  number;
}

type LoadState = 'loading' | 'not_found' | 'error' | 'ready';
type StepState  = 'complete' | 'active' | 'upcoming';

// ─── Constants ────────────────────────────────────────────────────────────────

const REFRESH_MS = 60_000;
const RADIUS     = 55;
const CIRC       = 2 * Math.PI * RADIUS;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stepState(def: StepDef, current: number): StepState {
  if (def.step < current)  return 'complete';
  if (def.step === current) return 'active';
  return 'upcoming';
}

function fmtCaseId(id: string): string {
  return `CASE-${id.slice(-7).toUpperCase()}`;
}

function fmtDate(d: string | null): string {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return ''; }
}

function timeAgoLabel(d: Date): string {
  const mins = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (mins < 1) return 'Just updated';
  if (mins === 1) return 'Updated 1 min ago';
  return `Updated ${mins} min ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RingProgress({ step, total, sensitive }: { step: number; total: number; sensitive: boolean }) {
  const offset = CIRC * (1 - step / total);
  return (
    <div className="tracker-ring-wrap">
      <svg className="tracker-ring-svg" viewBox="0 0 148 148">
        <circle className="tracker-ring-track" cx="74" cy="74" r={RADIUS} />
        <circle
          className="tracker-ring-fill"
          cx="74" cy="74" r={RADIUS}
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          style={sensitive ? { stroke: 'var(--tr-amber)' } : undefined}
        />
      </svg>
      <div className="tracker-ring-center">
        <div className="tracker-ring-num">{step}</div>
        <div className="tracker-ring-denom">of {total}</div>
      </div>
    </div>
  );
}

function TimelineStep({ def, current }: { def: StepDef; current: number }) {
  const state = stepState(def, current);
  return (
    <div className={`tracker-step ${state}`}>
      <div className="tracker-step-node">
        {state === 'complete' ? '✓' : state === 'active' ? def.icon : def.step}
      </div>
      <div className="tracker-step-body">
        <div className="tracker-step-title">{def.title}</div>
        <div className="tracker-step-subtitle">{def.subtitle}</div>
        {state === 'active'   && <span className="tracker-step-pill">In Progress</span>}
        {state === 'complete' && <span className="tracker-step-pill">Complete</span>}
      </div>
    </div>
  );
}

// ─── State screens ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="tracker-fullpage-state">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', width: 300 }}>
        <div className="tr-skel" style={{ height: 148, borderRadius: '50%', width: 148, margin: '0 auto' }} />
        <div className="tr-skel" style={{ height: '1.4rem', width: '55%', margin: '0.75rem auto 0' }} />
        <div className="tr-skel" style={{ height: '0.9rem', width: '80%', margin: '0 auto' }} />
        <div className="tr-skel" style={{ height: '0.9rem', width: '65%', margin: '0 auto' }} />
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div className="tr-skel" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="tr-skel" style={{ height: '0.8rem', width: '60%', marginBottom: '0.4rem' }} />
                <div className="tr-skel" style={{ height: '0.65rem', width: '85%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotFoundScreen({ caseId }: { caseId?: string }) {
  return (
    <div className="tracker-fullpage-state">
      <div className="tracker-state-code">404</div>
      <div className="tracker-state-title">Case Not Found</div>
      <p className="tracker-state-body">
        We couldn't find a case matching{' '}
        <strong style={{ color: '#00c9b1' }}>{caseId || 'this ID'}</strong>.
        Please check the link you received or contact our support team.
      </p>
      <a href="mailto:info@haverimmehalzim.org" className="tracker-state-link">
        Contact Support →
      </a>
    </div>
  );
}

function ErrorScreen() {
  return (
    <div className="tracker-fullpage-state">
      <div className="tracker-state-code">ERR</div>
      <div className="tracker-state-title">Connection Error</div>
      <p className="tracker-state-body">
        We couldn't reach our systems right now. The page will retry automatically.
        If this persists, please contact our team.
      </p>
      <a href="mailto:info@haverimmehalzim.org" className="tracker-state-link">
        Contact Support →
      </a>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CaseTrackerPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const [loadState,   setLoadState]   = useState<LoadState>('loading');
  const [data,        setData]        = useState<CaseData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [tick,        setTick]        = useState(0);

  const fetchData = useCallback(async () => {
    if (!caseId) { setLoadState('error'); return; }
    try {
      const res = await fetch(`/api/track/${caseId}`);
      if (res.status === 404) { setLoadState('not_found'); return; }
      if (!res.ok)            { setLoadState('error');     return; }
      const json = await res.json();
      if (!json.success)      { setLoadState('error');     return; }
      setData(json.data as CaseData);
      setLastUpdated(new Date());
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  }, [caseId]);

  // Initial fetch + auto-refresh
  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, REFRESH_MS);
    return () => clearInterval(iv);
  }, [fetchData]);

  // Tick every 30s to refresh "X min ago" label
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(iv);
  }, []);
  void tick; // consumed only for re-render

  if (loadState === 'loading')   return <LoadingScreen />;
  if (loadState === 'not_found') return <NotFoundScreen caseId={caseId} />;
  if (loadState === 'error' || !data) return <ErrorScreen />;

  const steps      = data.is_sensitive ? SENSITIVE_STEPS : NORMAL_STEPS;
  const current    = Math.min(Math.max(data.step, 1), data.total_steps);
  const isComplete = current === data.total_steps;
  const progress   = current / data.total_steps;
  const currentDef = steps.find(s => s.step === current) ?? steps[0];

  return (
    <div className={`tracker-page${data.is_sensitive ? ' sensitive' : ''}`}>

      {/* ── Header ── */}
      <header className="tracker-header">
        <span className="tracker-header-org">Haverim Mehalzim</span>
        <span className="tracker-live-badge">
          <span className="tracker-live-dot" />
          Live
        </span>
        <span className="tracker-case-id">{fmtCaseId(data.item_id)}</span>
      </header>

      {/* ── Top progress bar ── */}
      <div className="tracker-topbar">
        <div className="tracker-topbar-fill" style={{ width: `${progress * 100}%` }} />
      </div>

      <main className="tracker-content">

        {/* ── Completion banner ── */}
        {isComplete && (
          <div className="tracker-done-banner">
            <div className="tracker-done-mark">✦</div>
            <div className="tracker-done-title">Case Complete</div>
            <p className="tracker-done-subtitle">
              Your case has been fully managed by our team.<br />
              We remain here if you need any further support.
            </p>
          </div>
        )}

        {/* ── Hero ── */}
        {!isComplete && (
          <section className="tracker-hero">
            <RingProgress step={current} total={data.total_steps} sensitive={data.is_sensitive} />
            <div className="tracker-hero-eyebrow">Current Step</div>
            <h1 className="tracker-hero-title">{currentDef.title}</h1>
            <p className="tracker-hero-subtitle">{currentDef.subtitle}</p>
          </section>
        )}

        <div className="tracker-divider" />

        {/* ── Timeline ── */}
        <div className="tracker-timeline">
          {steps.map((s, idx) => (
            <div key={s.step}>
              {idx > 0 && (
                <div className={`tracker-connector ${s.step <= current ? 'filled' : 'empty'}`} />
              )}
              <TimelineStep def={s} current={current} />
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        <footer className="tracker-footer">
          {data.opened_date && (
            <span className="tracker-footer-meta">
              Case opened: {fmtDate(data.opened_date)}
            </span>
          )}
          <span className="tracker-footer-meta">
            {lastUpdated ? timeAgoLabel(lastUpdated) : 'Loading…'}
            {' · '}Auto-refreshes every 60 s
          </span>
          <a href="mailto:info@haverimmehalzim.org" className="tracker-footer-link">
            Need help? Contact us →
          </a>
        </footer>

      </main>
    </div>
  );
}
