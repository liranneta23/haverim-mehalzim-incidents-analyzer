import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { DashboardData } from './types';
import './dashboard.css';

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

function KpiCard({ color, value, label, icon }: {
  color: string; value: number; label: string; icon: React.ReactNode;
}) {
  return (
    <div className={`kpi-card ${color} fade-in`}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-number">{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}

function TypeRows({ types }: { types: Record<string, number> }) {
  const entries = Object.entries(types).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return <div className="empty">אין נתונים</div>;
  const max = entries[0][1];
  return (
    <>
      {entries.map(([type, count]) => (
        <div className="type-row" key={type}>
          <div className="type-name">{type || 'לא ידוע'}</div>
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
  if (!entries.length) return <div className="empty">אין נתונים</div>;
  return (
    <>
      {entries.map(([country, count], i) => (
        <div className="country-row" key={country}>
          <div className="country-rank">{String(i + 1).padStart(2, '0')}</div>
          <div className="country-name">{country || 'לא ידוע'}</div>
          <div className="country-badge">{count}</div>
        </div>
      ))}
    </>
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData]         = useState<DashboardData | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('—');

  const load = () => {
    fetchDashboard()
      .then(d => {
        setData(d);
        setLastUpdate(new Date().toLocaleTimeString('he-IL'));
        setError(null);
      })
      .catch(e => setError(e.message));
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const hebrewMonth = new Date().toLocaleString('he-IL', { month: 'long', year: 'numeric' });

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
              <div className="brand-title">מנתח אירועים</div>
              <div className="brand-sub">Incident Command Dashboard</div>
            </div>
          </div>
          <div className="header-meta">
            <Link to="/map" className="map-link">🌍 מפת אירועים</Link>
            <div className="status-pill">
              <div className="status-dot" />
              LIVE
            </div>
            <div className="last-update">עודכן: {lastUpdate}</div>
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
        {data && (
          <>
            <SectionLabel text="סיכום כללי" />
            <div className="kpi-grid">
              <KpiCard color=""      value={data.summary.total_all_incidents}     label="סך הכל אירועים"   icon={<IconSignal />} />
              <KpiCard color=""      value={data.summary.total_handled_incidents}  label="אירועים שטופלו"   icon={<IconShield />} />
              <KpiCard color="blue"  value={data.summary.active_volunteers}        label="מתנדבים פעילים"   icon={<IconUsers />} />
              <KpiCard color="amber" value={data.summary.countries_operated}       label="מדינות פעולה"     icon={<IconGlobe />} />
            </div>

            <SectionLabel text="אימפקט" stagger="stagger-1" />
            <div className="impact-strip fade-in stagger-2">
              <div className="impact-card danger">
                <div className="impact-info">
                  <div className="impact-label">מקרי חירום</div>
                  <div className="impact-number">{data.impact.count_life_threatening_incidents}</div>
                </div>
                <div className="impact-badge">CRITICAL</div>
              </div>
              <div className="impact-card success">
                <div className="impact-info">
                  <div className="impact-label">חיים שניצלו</div>
                  <div className="impact-number">{data.impact.count_life_saved}</div>
                </div>
                <div className="impact-badge">SAVED</div>
              </div>
            </div>

            <SectionLabel text="סוגי אירועים — סך הכל" stagger="stagger-2" />
            <div className="two-col fade-in stagger-3">
              <Panel title="כל האירועים" count={`${Object.keys(data.all_time.incident_types).length} סוגים`}>
                <TypeRows types={data.all_time.incident_types} />
              </Panel>
              <Panel title="אירועים שטופלו" count={`${Object.keys(data.all_time.handled_incident_types).length} סוגים`}>
                <TypeRows types={data.all_time.handled_incident_types} />
              </Panel>
            </div>

            <SectionLabel text="פריסה גיאוגרפית" stagger="stagger-3" />
            <div className="two-col fade-in stagger-4">
              <Panel title="כל המדינות" count={`${Object.keys(data.all_time.countries).length} מדינות`}>
                <CountryRows countries={data.all_time.countries} />
              </Panel>
              <Panel title="מדינות שטיפלנו" count={`${Object.keys(data.all_time.handled_countries).length} מדינות`}>
                <CountryRows countries={data.all_time.handled_countries} />
              </Panel>
            </div>

            <SectionLabel text={`החודש הנוכחי — ${hebrewMonth}`} stagger="stagger-4" />
            <div className="month-hero fade-in stagger-5">
              <div className="month-stats">
                <div className="month-stat">
                  <div className="month-stat-value">{data.current_month.total_incidents}</div>
                  <div className="month-stat-label">סך אירועים בחודש</div>
                </div>
                <div className="month-stat">
                  <div className="month-stat-value" style={{ color: 'var(--accent-teal)' }}>
                    {data.current_month.handled_incidents}
                  </div>
                  <div className="month-stat-label">אירועים שטופלו</div>
                </div>
              </div>
              <div className="month-divider" />
              <div className="month-breakdown">
                <TypeRows types={data.current_month.incident_types} />
              </div>
            </div>

            <div className="two-col fade-in stagger-5">
              <Panel title="מדינות בחודש — כל האירועים">
                <CountryRows countries={data.current_month.countries} />
              </Panel>
              <Panel title="מדינות בחודש — אירועים שטופלו">
                <CountryRows countries={data.current_month.handled_countries} />
              </Panel>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
