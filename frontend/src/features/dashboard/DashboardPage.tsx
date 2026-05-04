import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { DashboardData } from './types';
import LiveMissionFeed from './LiveMissionFeed';
import { Tooltip } from '../../components/Tooltip';
import './dashboard.css';

// ── Replace with your real donation page URL ──────────────────────────────────
const DONATE_URL = 'https://www.jgive.com/new/en/usd/donation-targets/110214';
const CONTACT_EMAIL = 'info@haverimmehalzim.org';

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch('/api/dashboard');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error('API returned success: false');
  return json.data as DashboardData;
}

// ─── Small components ─────────────────────────────────────────────────────────

function SectionLabel({ text, stagger = '' }: { text: string; stagger?: string }) {
  return (
    <div className={`section-label fade-in ${stagger}`}>
      <div className="section-label-text">{text}</div>
      <div className="section-label-line" />
    </div>
  );
}

function KpiCard({ color, value, label, icon, tooltip }: {
  color: string; value: number | string; label: string; icon: React.ReactNode; tooltip?: string;
}) {
  return (
    <div className={`kpi-card ${color} fade-in`}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-number">{value}</div>
      <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </div>
    </div>
  );
}


function YearTypeRows({ received, handled }: { received: Record<string, number>; handled: Record<string, number> }) {
  const allTypes = Array.from(new Set([...Object.keys(received), ...Object.keys(handled)]));
  allTypes.sort((a, b) => (received[b] ?? 0) - (received[a] ?? 0));
  if (!allTypes.length) return <div className="empty">No data</div>;
  const maxReceived = Math.max(...allTypes.map(t => received[t] ?? 0), 1);
  return (
    <>
      {/* Column headers */}
      <div className="type-row" style={{ paddingBottom: 6, borderBottom: '1px solid var(--border-dim)' }}>
        <div className="type-name" style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Type</div>
        <div style={{ flex: 1 }} />
        <div className="type-count" style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', minWidth: 64, display: 'flex', alignItems: 'center', gap: 2 }}>
          All
          <Tooltip text="Total incidents reported, regardless of outcome" />
        </div>
        <div className="type-count" style={{ fontSize: 10, color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.1em', minWidth: 56, display: 'flex', alignItems: 'center', gap: 2 }}>
          Handled
          <Tooltip text="Incidents where our volunteers successfully intervened" />
        </div>
      </div>
      {allTypes.map(type => {
        const recv = received[type] ?? 0;
        const done = handled[type] ?? 0;
        const pct  = Math.round((recv / maxReceived) * 100);
        return (
          <div className="type-row" key={type}>
            <div className="type-name">{type || 'Unknown'}</div>
            <div className="type-bar-container">
              <div className="type-bar" style={{ width: `${pct}%` }} />
            </div>
            <div className="type-count" style={{ minWidth: 64 }}>{recv}</div>
            <div className="type-count" style={{ minWidth: 56, color: 'var(--accent-teal)' }}>{done}</div>
          </div>
        );
      })}
    </>
  );
}

function TypeRows({ types }: { types: Record<string, number> }) {
  const entries = Object.entries(types).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return <div className="empty">No data</div>;
  const max = entries[0][1];
  return (
    <>
      {entries.map(([type, count]) => (
        <div className="type-row" key={type}>
          <div className="type-name">{type || 'Unknown'}</div>
          <div className="type-bar-container">
            <div className="type-bar" style={{ width: `${Math.round((count / max) * 100)}%` }} />
          </div>
          <div className="type-count">{count}</div>
        </div>
      ))}
    </>
  );
}

function CountryRows({ countries }: { countries: Record<string, number> }) {
  const entries = Object.entries(countries).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return <div className="empty">No data</div>;
  return (
    <>
      {entries.map(([country, count], i) => (
        <div className="country-row" key={country}>
          <div className="country-rank">{String(i + 1).padStart(2, '0')}</div>
          <div className="country-name">{country || 'Unknown'}</div>
          <div className="country-badge">{count}</div>
        </div>
      ))}
    </>
  );
}

type PeriodTab = 'month' | 'year';

function PeriodCard({
  currentMonth,
  currentYear,
  monthData,
  yearData,
}: {
  currentMonth: string;
  currentYear: number;
  monthData: { total: number; handled: number; types: Record<string, number>; handled_types: Record<string, number> };
  yearData:  { total: number; handled: number; types: Record<string, number>; handled_types: Record<string, number> };
}) {
  const [tab, setTab] = useState<PeriodTab>('month');
  const indicatorRef = useRef<HTMLDivElement>(null);
  const monthBtnRef  = useRef<HTMLButtonElement>(null);
  const yearBtnRef   = useRef<HTMLButtonElement>(null);

  // Slide the active-tab underline indicator
  useEffect(() => {
    const btn = tab === 'month' ? monthBtnRef.current : yearBtnRef.current;
    const ind = indicatorRef.current;
    if (!btn || !ind) return;
    ind.style.left  = `${btn.offsetLeft}px`;
    ind.style.width = `${btn.offsetWidth}px`;
  }, [tab]);

  const d = tab === 'month' ? monthData : yearData;
  const label = tab === 'month' ? currentMonth : String(currentYear);

  return (
    <div className="panel fade-in">
      {/* Tab header */}
      <div className="panel-header" style={{ paddingBottom: 0, borderBottom: 'none', flexDirection: 'column', alignItems: 'stretch', gap: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="panel-title">Performance by Period</div>
          <span className="panel-count">{label}</span>
        </div>
        {/* Tabs */}
        <div style={{ position: 'relative', display: 'flex', gap: 0, borderBottom: '1px solid var(--border-dim)' }}>
          {(['month', 'year'] as PeriodTab[]).map(t => (
            <button
              key={t}
              ref={t === 'month' ? monthBtnRef : yearBtnRef}
              onClick={() => setTab(t)}
              style={{
                padding: '8px 20px',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                transition: 'color 0.2s',
              }}
            >
              {t === 'month' ? 'This Month' : 'This Year'}
            </button>
          ))}
          {/* Sliding underline */}
          <div
            ref={indicatorRef}
            style={{
              position: 'absolute',
              bottom: -1,
              height: 2,
              background: 'var(--accent-teal)',
              borderRadius: 1,
              transition: 'left 0.25s ease, width 0.25s ease',
            }}
          />
        </div>
      </div>

      {/* Stats + breakdown */}
      <div className="month-hero" style={{ borderRadius: 0, border: 'none', padding: '24px 22px', marginBottom: 0 }}>
        <div className="month-stats">
          <div className="month-stat">
            <div className="month-stat-value">{d.total}</div>
            <div className="month-stat-label">All Incidents</div>
          </div>
          <div className="month-stat">
            <div className="month-stat-value" style={{ color: 'var(--accent-teal)' }}>{d.handled}</div>
            <div className="month-stat-label">Incidents Handled</div>
          </div>
        </div>
        <div className="month-divider" />
        <div className="month-breakdown">
          {tab === 'month'
            ? <TypeRows types={d.types} />
            : <YearTypeRows received={d.types} handled={d.handled_types} />
          }
        </div>
      </div>
    </div>
  );
}

function Panel({ title, count, children }: {
  title: string; count?: string; children: React.ReactNode;
}) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">{title}</div>
        {count && <div className="panel-count">{count}</div>}
      </div>
      <div className="panel-body">{children}</div>
    </div>
  );
}

// ─── Hero globe visual ───────────────────────────────────────────────────────

const HQ_X = 172, HQ_Y = 131;
const GLOBE_MARKERS = [
  { cx: 116, cy: 100 },  // Western Europe
  { cx: 65,  cy: 115 },  // East Coast USA
  { cx: 48,  cy: 135 },  // West Coast USA
  { cx: 216, cy: 150 },  // Southeast Asia
  { cx: 80,  cy: 192 },  // South America
  { cx: 153, cy: 196 },  // Southern Africa
  { cx: 232, cy: 196 },  // Australia
  { cx: 184, cy: 108 },  // Eastern Europe / Turkey
];

function HeroGlobe() {
  return (
    <div className="hero-visual-wrap">
      <div className="hud-corner hud-tl" />
      <div className="hud-corner hud-tr" />
      <div className="hud-corner hud-bl" />
      <div className="hud-corner hud-br" />
      <div className="hud-tag hud-tag-tl">◈ LIVE OPS</div>
      <div className="hud-tag hud-tag-br">GLOBAL NET</div>
      <svg viewBox="0 0 300 300" className="hero-globe-svg" aria-hidden="true">
        <defs>
          <radialGradient id="hgGlobe" cx="38%" cy="35%" r="65%">
            <stop offset="0%"   stopColor="#0d2a1e" />
            <stop offset="100%" stopColor="#040c09" />
          </radialGradient>
          <filter id="hgGlow">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="hgDot">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Globe body */}
        <circle cx="150" cy="150" r="115" fill="url(#hgGlobe)" />
        <circle cx="150" cy="150" r="115" fill="none" stroke="rgba(0,230,160,0.22)" strokeWidth="1" />

        {/* Latitude lines */}
        <ellipse cx="150" cy="50"  rx="58"  ry="13"  fill="none" stroke="rgba(0,230,160,0.07)" strokeWidth="0.6" />
        <ellipse cx="150" cy="93"  rx="100" ry="22"  fill="none" stroke="rgba(0,230,160,0.07)" strokeWidth="0.6" />
        <ellipse cx="150" cy="150" rx="115" ry="27"  fill="none" stroke="rgba(0,230,160,0.11)" strokeWidth="0.7" />
        <ellipse cx="150" cy="207" rx="100" ry="22"  fill="none" stroke="rgba(0,230,160,0.07)" strokeWidth="0.6" />
        <ellipse cx="150" cy="250" rx="58"  ry="13"  fill="none" stroke="rgba(0,230,160,0.07)" strokeWidth="0.6" />

        {/* Longitude lines */}
        <line x1="150" y1="35" x2="150" y2="265" stroke="rgba(0,230,160,0.09)" strokeWidth="0.6" />
        <ellipse cx="150" cy="150" rx="58"  ry="115" fill="none" stroke="rgba(0,230,160,0.07)" strokeWidth="0.6" />
        <ellipse cx="150" cy="150" rx="100" ry="115" fill="none" stroke="rgba(0,230,160,0.07)" strokeWidth="0.6" />

        {/* Radar sweep */}
        <g className="hg-sweep">
          <path d="M 150 150 L 150 35 A 115 115 0 0 1 250 93 Z" fill="rgba(0,230,160,0.05)" />
          <line x1="150" y1="150" x2="150" y2="35" stroke="rgba(0,230,160,0.6)" strokeWidth="1.2" />
        </g>

        {/* Outer dashed ring */}
        <circle cx="150" cy="150" r="118" fill="none" stroke="rgba(0,230,160,0.22)"
          strokeWidth="0.8" strokeDasharray="3 4" className="hg-outer-ring" />

        {/* Connection arcs from HQ to each marker */}
        {GLOBE_MARKERS.map(({ cx, cy }, i) => {
          const cpx = (HQ_X + cx) / 2 + (150 - (HQ_X + cx) / 2) * 0.3;
          const cpy = (HQ_Y + cy) / 2 + (150 - (HQ_Y + cy) / 2) * 0.3 - 16;
          return (
            <path key={i}
              d={`M ${HQ_X} ${HQ_Y} Q ${cpx} ${cpy} ${cx} ${cy}`}
              fill="none" stroke="rgba(0,230,160,0.22)" strokeWidth="0.8"
              className="hg-arc" style={{ animationDelay: `${i * 0.35}s` }}
            />
          );
        })}

        {/* Pulse rings */}
        {GLOBE_MARKERS.map(({ cx, cy }, i) => (
          <circle key={i} cx={cx} cy={cy} r="7" fill="none"
            stroke="rgba(0,230,160,0.55)" strokeWidth="0.9"
            className="hg-pulse" style={{ animationDelay: `${i * 0.32}s` }}
          />
        ))}

        {/* Incident dots */}
        {GLOBE_MARKERS.map(({ cx, cy }, i) => (
          <circle key={i} cx={cx} cy={cy} r="2.5" fill="#00e6a0" filter="url(#hgDot)" />
        ))}

        {/* HQ marker */}
        <circle cx={HQ_X} cy={HQ_Y} r="16" fill="none" stroke="rgba(0,230,160,0.2)"
          strokeWidth="0.8" className="hg-pulse" style={{ animationDelay: '0.6s' }} />
        <circle cx={HQ_X} cy={HQ_Y} r="9"  fill="none" stroke="rgba(0,230,160,0.5)" strokeWidth="1" />
        <circle cx={HQ_X} cy={HQ_Y} r="4"  fill="#00e6a0" filter="url(#hgGlow)" />
        <text x={HQ_X + 7} y={HQ_Y - 7} fontSize="5.5" fill="rgba(0,230,160,0.75)"
          fontFamily="monospace" letterSpacing="0.08em">HQ</text>
      </svg>
    </div>
  );
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const IconSignal = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="#00e6a0" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="8" cy="8" r="2" /><path d="M3 13a7 7 0 0 1 0-10M13 3a7 7 0 0 1 0 10" />
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="#00e6a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2L3 4.5v4c0 3 2 5 5 5.5 3-.5 5-2.5 5-5.5v-4L8 2z" />
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="#4da6ff" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="6" cy="5" r="2.5" /><path d="M1.5 13.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
    <path d="M11 3.5a2.5 2.5 0 0 1 0 5M14.5 13.5c0-2-1.5-3.5-3.5-3.5" />
  </svg>
);
const IconGlobe = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="#ffb930" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="8" cy="8" r="6" /><path d="M2 8h12M8 2a10 10 0 0 1 0 12M8 2a10 10 0 0 0 0 12" />
  </svg>
);
const IconRate = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="#00e6a0" strokeWidth="1.5" strokeLinecap="round">
    <path d="M2 12L6 7l3 3 5-6" /><circle cx="14" cy="4" r="1.5" fill="#00e6a0" stroke="none" />
  </svg>
);

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData]             = useState<DashboardData | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('—');

  const load = () => {
    fetchDashboard()
      .then(d => {
        setData(d);
        setLastUpdate(new Date().toLocaleTimeString('en-GB'));
        setError(null);
      })
      .catch(e => setError(e.message));
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const currentMonth = new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <div className="page-bg">
      <div className="page-wrapper">

        {/* ── Header ── */}
        <header>
          <div className="header-brand">
            <div className="brand-icon">
              <svg viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="8" stroke="#00e6a0" strokeWidth="1.5" />
                <circle cx="11" cy="11" r="3" fill="#00e6a0" />
                <line x1="11" y1="3" x2="11" y2="1" stroke="#00e6a0" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="11" y1="21" x2="11" y2="19" stroke="#00e6a0" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="3" y1="11" x2="1" y2="11" stroke="#00e6a0" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="21" y1="11" x2="19" y2="11" stroke="#00e6a0" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="brand-title">Haverim Mehalzim</div>
              <div className="brand-sub">Incident Command Dashboard</div>
            </div>
          </div>
          <div className="header-meta">
            <div className="status-pill">
              <div className="status-dot" />
              LIVE
            </div>
            <div className="last-update">Updated: {lastUpdate}</div>
          </div>
        </header>

        {/* ── Error ── */}
        {error && <div className="error-box">⚠ {error}</div>}

        {/* ── Loading ── */}
        {!data && !error && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="loader-ring" />
          </div>
        )}

        {/* ── Content ── */}
        {data && (() => {
          const successRate = data.summary.total_all_incidents > 0
            ? Math.round((data.summary.total_handled_incidents / data.summary.total_all_incidents) * 100)
            : 0;

          return (
            <>
              {/* ── Mission Hero ── */}
              <div className="mission-hero-strip fade-in">
                <div className="mission-hero-content">
                  <div className="mission-eyebrow">Haverim Mehalzim · Israelis Helping Israelis</div>
                  <h1 className="mission-headline">
                    When Israelis are in distress,<br />we answer the call — worldwide.
                  </h1>
                  <p className="mission-body">
                    Our volunteers respond 24/7 to medical emergencies, rescue operations,
                    and mental health crises wherever Israelis travel or live — at no cost
                    to the people we help. Every donation funds a real response.
                  </p>
                  <div className="mission-stats-row">
                    <div className="mission-stat-item">
                      <div className="mission-stat-num">{data.impact.count_life_saved}</div>
                      <div className="mission-stat-lbl">Lives Saved</div>
                    </div>
                    <div className="mission-stat-divider" />
                    <div className="mission-stat-item">
                      <div className="mission-stat-num teal">{successRate}%</div>
                      <div className="mission-stat-lbl" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                        Response Rate
                        <Tooltip text="Percentage of all reported incidents successfully handled by our volunteers" />
                      </div>
                    </div>
                    <div className="mission-stat-divider" />
                    <div className="mission-stat-item">
                      <div className="mission-stat-num amber">{data.summary.countries_operated}</div>
                      <div className="mission-stat-lbl">Countries Active</div>
                    </div>
                  </div>
                  <div className="mission-actions">
                    <Link to="/map" className="mission-btn-primary">View Live Operations →</Link>
                  </div>
                </div>
                <HeroGlobe />
              </div>

              {/* ── KPIs ── */}
              <SectionLabel text="Operations Overview" />
              <div className="kpi-grid">
                <KpiCard color=""      value={data.summary.total_all_incidents}    label="Total Incidents"   icon={<IconSignal />} />
                <KpiCard color=""      value={data.summary.total_handled_incidents} label="Handled"           icon={<IconShield />} />
                <KpiCard color=""      value={`${successRate}%`}                    label="Response Rate"     icon={<IconRate />} tooltip="Percentage of all reported incidents that were successfully handled by our volunteers" />
                <KpiCard color="blue"  value={data.summary.active_volunteers}       label="Active Volunteers" icon={<IconUsers />} />
                <KpiCard color="amber" value={data.summary.countries_operated}      label="Countries Active"  icon={<IconGlobe />} />
              </div>

              {/* ── Impact ── */}
              <SectionLabel text="Impact" stagger="stagger-1" />
              <div className="impact-strip fade-in stagger-2">
                <div className="impact-card danger">
                  <div className="impact-info">
                    <div className="impact-label">Life-Threatening Incidents</div>
                    <div className="impact-number">{data.impact.count_life_threatening_incidents}</div>
                  </div>
                  <div className="impact-badge">CRITICAL</div>
                </div>
                <div className="impact-card success">
                  <div className="impact-info">
                    <div className="impact-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      Lives Saved
                      <Tooltip text="Incidents classified as significant — where our intervention directly prevented loss of life" />
                    </div>
                    <div className="impact-number">{data.impact.count_life_saved}</div>
                  </div>
                  <div className="impact-badge">SAVED</div>
                </div>
              </div>

              {/* ── Live Mission Feed ── */}
              <SectionLabel text="Live Operations" stagger="stagger-2" />
              <div className="stagger-2" style={{ marginBottom: 40 }}>
                <LiveMissionFeed />
              </div>

              {/* ── Live Operations Globe CTA ── */}
              <Link to="/map" className="globe-cta-banner fade-in stagger-3">
                <div className="globe-cta-text">
                  <div className="globe-cta-label">◈ Live Operations</div>
                  <div className="globe-cta-title">Watch Our Operations in Real Time</div>
                  <div className="globe-cta-sub">
                    See every active and resolved incident plotted on a live 3D world map
                  </div>
                </div>
                <div className="globe-cta-arrow">Open Live Map →</div>
              </Link>

              {/* ── Incident Types ── */}
              <SectionLabel text="Incident Types — All Time" stagger="stagger-3" />
              <div className="two-col fade-in stagger-4">
                <Panel title="All Incidents" count={`${Object.keys(data.all_time.incident_types).length} types`}>
                  <TypeRows types={data.all_time.incident_types} />
                </Panel>
                <Panel title="Incidents Handled" count={`${Object.keys(data.all_time.handled_incident_types).length} types`}>
                  <TypeRows types={data.all_time.handled_incident_types} />
                </Panel>
              </div>

              {/* ── Performance by Period (combined month + year) ── */}
              <div style={{ marginBottom: 40 }}>
              <PeriodCard
                currentMonth={currentMonth}
                currentYear={new Date().getFullYear()}
                monthData={{
                  total:         data.current_month.total_incidents,
                  handled:       data.current_month.handled_incidents,
                  types:         data.current_month.incident_types,
                  handled_types: data.current_month.handled_incident_types,
                }}
                yearData={{
                  total:         data.current_year.total_incidents,
                  handled:       data.current_year.handled_incidents,
                  types:         data.current_year.incident_types,
                  handled_types: data.current_year.handled_incident_types,
                }}
              />
              </div>

              {/* ── Geographic Distribution ── */}
              <SectionLabel text="Geographic Distribution" stagger="stagger-4" />
              <div className="two-col fade-in stagger-5">
                <Panel title="All Countries" count={`${Object.keys(data.all_time.countries).length} countries`}>
                  <CountryRows countries={data.all_time.countries} />
                </Panel>
                <Panel title="Countries Handled" count={`${Object.keys(data.all_time.handled_countries).length} countries`}>
                  <CountryRows countries={data.all_time.handled_countries} />
                </Panel>
              </div>

              {/* ── Countries This Month ── */}
              <div className="two-col fade-in stagger-5">
                <Panel title="Countries This Month — All">
                  <CountryRows countries={data.current_month.countries} />
                </Panel>
                <Panel title="Countries This Month — Handled">
                  <CountryRows countries={data.current_month.handled_countries} />
                </Panel>
              </div>

              {/* ── Support CTA ── */}
              <div className="support-section fade-in">
                <div className="support-eyebrow">Make a Difference</div>
                <h2 className="support-headline">Every donation funds a real response.</h2>
                <p className="support-body">
                  Our volunteers are on call 24/7 — your support covers coordination,
                  medical consulting, legal assistance, and rescue operations for Israelis
                  in crisis anywhere in the world.
                </p>
                <div className="support-actions">
                  <a href={DONATE_URL} className="support-donate-btn" target="_blank" rel="noopener noreferrer">
                    Donate Now
                  </a>
                  <Link to="/fund-our-team" className="support-contact-btn">
                    See How Funds Are Used
                  </Link>
                  <a href={`mailto:${CONTACT_EMAIL}`} className="support-contact-btn">
                    Get in Touch
                  </a>
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
