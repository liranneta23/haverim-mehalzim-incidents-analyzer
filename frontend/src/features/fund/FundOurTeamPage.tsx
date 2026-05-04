import { Link } from 'react-router-dom';

const DONATE_URL = 'https://www.jgive.com/new/en/usd/donation-targets/110214';
const TEAL  = '#00e6a0';
const GOLD  = '#D4AF37';
const BG    = '#0B0E11';
const BG2   = '#0d1117';
const MONO  = "'JetBrains Mono', monospace";

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

interface RoleData {
  name: string;
  tagline: string;
  description: string;
  costPerIncident: number;
  deployedIn: string[];
}

const ROLES: RoleData[] = [
  {
    name: 'Case Manager',
    tagline: 'Backbone of every response',
    description:
      'The central hub of any incident. Manages communication between the person in need, their family, and our volunteer team — keeping everyone aligned under pressure from first call to case closure.',
    costPerIncident: 150,
    deployedIn: ['Medical', 'Rescue', 'Mental Health', 'Search & Locate', 'Antisemitism', 'Haverot Mehalzot', 'Other'],
  },
  {
    name: 'Supervisor',
    tagline: 'Senior oversight and critical decisions',
    description:
      'Authorizes escalations, coordinates with government agencies and embassies, and takes responsibility for the most complex and high-stakes outcomes across our entire operation.',
    costPerIncident: 200,
    deployedIn: ['Rescue', 'Haverot Mehalzot'],
  },
  {
    name: 'Standby Officer',
    tagline: 'Always on call, ready in minutes',
    description:
      'Handles initial rapid response and on-the-ground logistics. The first person activated the moment a new incident comes in — day or night, anywhere in the world.',
    costPerIncident: 80,
    deployedIn: ['Medical', 'Mental Health', 'Search & Locate', 'Other'],
  },
  {
    name: 'Intelligence Expert',
    tagline: 'Gathers intel, liaises with local authorities',
    description:
      'Collects situational intelligence and coordinates with local emergency services, embassies, and law enforcement. Essential for search operations and antisemitism incident documentation.',
    costPerIncident: 120,
    deployedIn: ['Search & Locate', 'Antisemitism'],
  },
  {
    name: 'Medical Coordinator',
    tagline: 'Manages medical logistics and care pathways',
    description:
      'Connects with local hospitals, arranges medical transport, and ensures the right care reaches the person in need — across languages, time zones, and international borders.',
    costPerIncident: 180,
    deployedIn: ['Medical'],
  },
  {
    name: 'Mental Health Specialist',
    tagline: 'Trained crisis counselor, available 24/7',
    description:
      'Provides immediate psychological de-escalation and ongoing support for individuals in acute distress. Trained to handle trauma, grief, and psychiatric emergencies.',
    costPerIncident: 160,
    deployedIn: ['Mental Health'],
  },
  {
    name: 'Logistics Coordinator',
    tagline: 'Gets people and resources where they need to be',
    description:
      'Manages travel arrangements, emergency accommodation, and practical support — ensuring that nothing delays the response when every hour counts.',
    costPerIncident: 100,
    deployedIn: ['Rescue'],
  },
  {
    name: 'Legal Advisor',
    tagline: 'Documentation and legal coordination',
    description:
      'Handles incident documentation, coordinates with legal authorities, and manages formal case reporting — critical for antisemitism incidents and complex cross-border extractions.',
    costPerIncident: 140,
    deployedIn: ['Antisemitism'],
  },
];

const INCIDENT_TEAMS: { type: string; roles: string[] }[] = [
  { type: 'Medical',          roles: ['Case Manager', 'Medical Coordinator', 'Standby Officer'] },
  { type: 'Rescue',           roles: ['Case Manager', 'Supervisor', 'Logistics Coordinator'] },
  { type: 'Mental Health',    roles: ['Case Manager', 'Mental Health Specialist', 'Standby Officer'] },
  { type: 'Search & Locate',  roles: ['Case Manager', 'Intelligence Expert', 'Standby Officer'] },
  { type: 'Antisemitism',     roles: ['Case Manager', 'Intelligence Expert', 'Legal Advisor'] },
  { type: 'Haverot Mehalzot', roles: ['Case Manager', 'Supervisor'] },
];

const DONATION_PRESETS = [
  {
    amount: 80,
    label: 'One Standby Officer',
    desc: 'The first person activated when an incident comes in — ready to deploy within minutes, anywhere in the world.',
  },
  {
    amount: 150,
    label: 'One Case Manager',
    desc: 'Funds full case coordination from first call to closure, keeping the family informed and the team aligned throughout.',
  },
  {
    amount: 350,
    label: 'Search & Locate Team',
    desc: 'Deploys a Case Manager, Intelligence Expert, and Standby Officer for one complete search operation.',
    highlight: true,
  },
  {
    amount: 530,
    label: 'Full Medical Response',
    desc: 'Funds all three roles for a complete medical emergency response — Case Manager, Medical Coordinator, and Standby Officer.',
  },
];

function roleCost(name: string): number {
  return ROLES.find(r => r.name === name)?.costPerIncident ?? 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const styles: Record<string, React.CSSProperties> = {
    tl: { top: 0,    left: 0,    borderTop:    `1.5px solid ${TEAL}`, borderLeft:  `1.5px solid ${TEAL}` },
    tr: { top: 0,    right: 0,   borderTop:    `1.5px solid ${TEAL}`, borderRight: `1.5px solid ${TEAL}` },
    bl: { bottom: 0, left: 0,    borderBottom: `1.5px solid ${TEAL}`, borderLeft:  `1.5px solid ${TEAL}` },
    br: { bottom: 0, right: 0,   borderBottom: `1.5px solid ${TEAL}`, borderRight: `1.5px solid ${TEAL}` },
  };
  return (
    <div style={{
      position: 'absolute', width: 14, height: 14, pointerEvents: 'none',
      ...styles[pos],
    }} />
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, marginTop: 56 }}>
      <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: TEAL }}>
        ◈ {text}
      </span>
      <div style={{ flex: 1, height: 1, background: `${TEAL}22` }} />
    </div>
  );
}

function RoleCard({ role }: { role: RoleData }) {
  return (
    <div style={{
      background: BG2,
      border: `1px solid rgba(0,230,160,0.12)`,
      borderRadius: 4,
      padding: '24px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      transition: 'border-color 0.2s',
      position: 'relative',
    }}>
      {/* Role name + cost */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
          {role.name}
        </div>
        <div style={{
          fontFamily: MONO, fontSize: 18, fontWeight: 700, color: TEAL,
          fontVariantNumeric: 'tabular-nums', flexShrink: 0, marginLeft: 12,
        }}>
          ${role.costPerIncident}
          <span style={{ fontSize: 9, color: `${TEAL}66`, marginLeft: 4, fontWeight: 400 }}>/incident</span>
        </div>
      </div>

      {/* Tagline */}
      <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: `${TEAL}66`, marginBottom: 14 }}>
        {role.tagline}
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, lineHeight: 1.7, color: '#8aa0b4', margin: 0, flex: 1 }}>
        {role.description}
      </p>

      {/* Deployed in */}
      <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#3d5a72', marginBottom: 8 }}>
          Deployed in
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {role.deployedIn.map(t => (
            <span key={t} style={{
              fontFamily: MONO, fontSize: 8, letterSpacing: '0.12em',
              padding: '3px 7px', borderRadius: 2,
              background: 'rgba(0,230,160,0.07)',
              border: '1px solid rgba(0,230,160,0.15)',
              color: `${TEAL}99`,
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Fund this role CTA */}
      <a
        href={DONATE_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          marginTop: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '9px 0',
          fontFamily: MONO, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700,
          color: BG, background: TEAL,
          borderRadius: 2, textDecoration: 'none',
          opacity: 1, transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        ♥ Fund this role
      </a>
    </div>
  );
}

function TeamCard({ type, roles }: { type: string; roles: string[] }) {
  const total = roles.reduce((sum, r) => sum + roleCost(r), 0);
  return (
    <div style={{
      background: BG2,
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 4,
      padding: '20px 20px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.06em' }}>
          {type}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: GOLD }}>
          ${total}<span style={{ fontSize: 8, color: `${GOLD}66`, marginLeft: 4 }}>/incident</span>
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {roles.map(r => (
          <div key={r} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: TEAL, flexShrink: 0, display: 'inline-block' }} />
              <span style={{ fontFamily: MONO, fontSize: 10, color: '#8aa0b4' }}>{r}</span>
            </div>
            <span style={{ fontFamily: MONO, fontSize: 10, color: TEAL, fontWeight: 700 }}>${roleCost(r)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PresetCard({ amount, label, desc, highlight = false }: {
  amount: number; label: string; desc: string; highlight?: boolean;
}) {
  return (
    <a
      href={DONATE_URL}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex', flexDirection: 'column', gap: 0,
        background: highlight ? `${TEAL}0d` : BG2,
        border: `1px solid ${highlight ? `${TEAL}44` : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 4, padding: '22px 20px',
        textDecoration: 'none', cursor: 'pointer',
        transition: 'border-color 0.2s, background 0.2s',
        position: 'relative',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${TEAL}55`;
        e.currentTarget.style.background  = `${TEAL}10`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = highlight ? `${TEAL}44` : 'rgba(255,255,255,0.06)';
        e.currentTarget.style.background  = highlight ? `${TEAL}0d` : BG2;
      }}
    >
      {highlight && (
        <span style={{
          position: 'absolute', top: -1, right: 14,
          fontFamily: MONO, fontSize: 7, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: BG, background: TEAL, padding: '3px 8px', borderRadius: '0 0 3px 3px',
        }}>Most Impactful</span>
      )}
      <div style={{ fontFamily: MONO, fontSize: 28, fontWeight: 700, color: highlight ? TEAL : '#fff', marginBottom: 6 }}>
        ${amount}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: highlight ? TEAL : '#c0d0e0', marginBottom: 12 }}>
        {label}
      </div>
      <p style={{ fontSize: 12, lineHeight: 1.65, color: '#6a8a9a', margin: 0, flex: 1 }}>
        {desc}
      </p>
      <div style={{
        marginTop: 18,
        fontFamily: MONO, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
        color: highlight ? TEAL : `${TEAL}66`,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        Donate ${amount} →
      </div>
    </a>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function FundOurTeamPage() {
  return (
    <div style={{ background: BG, minHeight: '100vh', color: '#c8d8e4', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Nav bar ─────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: `${BG}f5`, backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${TEAL}22`,
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/" style={{
            fontFamily: MONO, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: `${TEAL}88`, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
            transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = TEAL)}
            onMouseLeave={e => (e.currentTarget.style.color = `${TEAL}88`)}
          >
            ← Dashboard
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 12 }}>|</span>
          <Link to="/map" style={{
            fontFamily: MONO, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: `${TEAL}88`, textDecoration: 'none', transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = TEAL)}
            onMouseLeave={e => (e.currentTarget.style.color = `${TEAL}88`)}
          >
            Live Map
          </Link>
        </div>
        <a
          href={DONATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: MONO, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700,
            color: BG, background: TEAL, textDecoration: 'none',
            padding: '7px 16px', borderRadius: 2, transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          ♥ Donate Now
        </a>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <div style={{ paddingTop: 64, paddingBottom: 16, maxWidth: 680 }}>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: TEAL, marginBottom: 18 }}>
            ◈ Haverim Mehalzim · Transparency
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 700, color: '#fff', lineHeight: 1.15, margin: '0 0 20px' }}>
            The Team Behind<br />Every Rescue
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: '#8aa0b4', margin: '0 0 32px' }}>
            Every donation we receive goes directly into funding the people who respond.
            Here's exactly who shows up when someone calls for help — and what it costs
            to keep them ready 24/7.
          </p>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            {[
              { value: '8', label: 'Specialized Roles' },
              { value: '6', label: 'Incident Types' },
              { value: '$80', label: 'Minimum deployment' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 700, color: TEAL }}>{value}</div>
                <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#3d5a72', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Roles ───────────────────────────────────────────────────────── */}
        <SectionLabel text="Our Response Roles" />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {ROLES.map(role => <RoleCard key={role.name} role={role} />)}
        </div>

        {/* ── How We Deploy ───────────────────────────────────────────────── */}
        <SectionLabel text="Who We Deploy — By Incident Type" />
        <p style={{ fontSize: 13, lineHeight: 1.7, color: '#6a8a9a', marginBottom: 24, marginTop: -16, maxWidth: 600 }}>
          Different emergencies require different expertise. Here's the exact team we assemble for each type of incident, and what it costs to make that response happen.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 14,
        }}>
          {INCIDENT_TEAMS.map(({ type, roles }) => (
            <TeamCard key={type} type={type} roles={roles} />
          ))}
        </div>

        {/* ── Donation presets ────────────────────────────────────────────── */}
        <SectionLabel text="Choose Your Impact" />
        <p style={{ fontSize: 13, lineHeight: 1.7, color: '#6a8a9a', marginBottom: 24, marginTop: -16, maxWidth: 600 }}>
          Every amount funds something real and measurable. Pick the response you want to make possible.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 14,
        }}>
          {DONATION_PRESETS.map(p => (
            <PresetCard key={p.amount} {...p} />
          ))}
        </div>

        {/* ── Final CTA ───────────────────────────────────────────────────── */}
        <div style={{
          marginTop: 64,
          position: 'relative',
          background: BG2,
          border: `1px solid ${TEAL}33`,
          borderRadius: 4,
          padding: 'clamp(32px, 5vw, 56px) clamp(24px, 5vw, 56px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          overflow: 'hidden',
        }}>
          <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: `${TEAL}77`, marginBottom: 16 }}>
            ◈ Make a Difference
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 700, color: '#fff', margin: '0 0 16px', lineHeight: 1.2 }}>
            Fund the people who show up.
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: '#6a8a9a', maxWidth: 520, margin: '0 0 32px' }}>
            Our volunteers respond at no cost to the people they help. Your donation covers
            everything it takes to make that possible — the coordinators, specialists, and
            officers ready to act the moment a call comes in.
          </p>
          <a
            href={DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '14px 36px',
              fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700,
              color: BG, background: TEAL, borderRadius: 2, textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <span style={{ fontSize: 14 }}>♥</span>
            Donate Now
          </a>
        </div>

      </div>
    </div>
  );
}
