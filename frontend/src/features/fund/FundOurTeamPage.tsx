import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDonate } from '../../context/DonateContext';
import './fund.css';

const DONATE_URL = 'https://www.jgive.com/new/en/usd/donation-targets/110214';

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

interface ResponseTier {
  amount: number;
  title: string;
  duration: string;
  description: string;
  includes: string[];
  highlight?: boolean;
  impactNote?: string;
}

const RESPONSE_TIERS: ResponseTier[] = [
  {
    amount: 150,
    title: 'Golden Hour',
    duration: '1 Hour',
    description: 'One hour of emergency case management — the critical first window that shapes every outcome.',
    includes: [
      'Dedicated case officer activated immediately',
      'Initial situation assessment and triage',
      'Family communication established',
      'Emergency response network alerted',
    ],
  },
  {
    amount: 900,
    title: 'Six-Hour Rapid Response Window',
    duration: '6 Hours',
    description: 'Six hours of coordinated response work — enough to manage the full arc of most emergency cases.',
    includes: [
      'All Golden Hour coverage',
      'Local authority and embassy coordination',
      'Escalation and critical decision support',
      'Continuous family briefings throughout',
    ],
  },
  {
    amount: 3000,
    title: '24-Hour SOS Shift',
    duration: '24 Hours',
    description: 'One full day of emergency response coverage — keeping our team fully operational for 24 hours straight.',
    includes: [
      'Round-the-clock team coordination',
      'Multi-agency liaison',
      '24/7 family support and updates',
      'Full case documentation and status updates',
    ],
  },
  {
    amount: 14000,
    title: 'Scoop & Run',
    duration: 'Full Operation',
    description: 'A complete Scoop & Run rescue — our most intensive, life-saving field intervention.',
    includes: [
      'Up to 24 hours of team coordination',
      'Up to 3 hours of helicopter support',
      '1 hour of ambulance transfer',
      '1 day of initial hospital care',
    ],
    impactNote: 'Donors at this level receive a private link to see the real-world impact of their contribution.',
    highlight: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="fund-section-label">
      <span className="fund-section-label-text">◈ {text}</span>
      <div className="fund-section-label-line" />
    </div>
  );
}

function TierCard({ tier }: { tier: ResponseTier }) {
  const { openDonate } = useDonate();
  return (
    <div className={`fund-tier-card${tier.highlight ? ' fund-tier-card--highlight' : ''}`}>
      <div className="fund-tier-duration">{tier.duration}</div>
      <div className="fund-tier-amount">${tier.amount.toLocaleString()}</div>
      <div className="fund-tier-title">{tier.title}</div>
      <p className="fund-tier-desc">{tier.description}</p>

      <div className="fund-tier-divider" />
      <div className="fund-tier-includes-label">Includes</div>
      <div className="fund-tier-includes">
        {tier.includes.map(item => (
          <div key={item} className="fund-tier-include-row">
            <span className="fund-tier-check">✓</span>
            <span className="fund-tier-include-text">{item}</span>
          </div>
        ))}
      </div>

      {tier.impactNote && (
        <div className="fund-tier-impact-note">
          <span className="fund-tier-impact-icon">★</span>
          <span>{tier.impactNote}</span>
        </div>
      )}

      <a href={DONATE_URL} onClick={e => { e.preventDefault(); openDonate(); }} className="fund-tier-cta">
        ♥ Donate Now →
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Testimonials
// ─────────────────────────────────────────────────────────────────────────────

interface Testimonial { name: string; message: string; case_ref: string; timestamp: string; }

function TestimonialsSection() {
  const [items,   setItems]   = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/testimonials')
      .then(r => r.json())
      .then(j => { if (j.success) setItems(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <>
      <SectionLabel text="What Families Say" />
      <p className="fund-section-sub">
        Real words from families we've served — shared with their permission.
      </p>
      <div className="fund-testimonials-grid">
        {items.map((t, i) => (
          <div key={i} className="fund-testimonial-card">
            <div className="fund-testimonial-quote">❝</div>
            <p className="fund-testimonial-body">{t.message}</p>
            <div className="fund-testimonial-footer">
              <div>
                <div className="fund-testimonial-name">{t.name}</div>
                {t.case_ref && (
                  <div className="fund-testimonial-case">CASE ···{t.case_ref}</div>
                )}
              </div>
              {t.timestamp && (
                <div className="fund-testimonial-ts">{t.timestamp}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function FundOurTeamPage() {
  const { openDonate } = useDonate();
  return (
    <div className="fund-page">
      <div className="fund-wrapper">

        {/* ── Nav ─────────────────────────────────────────────────────────── */}
        <nav className="fund-nav">
          <div className="fund-nav-links">
            <Link to="/" className="fund-back">← Dashboard</Link>
            <span className="fund-nav-sep">|</span>
            <Link to="/map" className="fund-back">Live Map</Link>
          </div>
          <a href={DONATE_URL} onClick={e => { e.preventDefault(); openDonate(); }} className="fund-nav-donate">
            ♥ Donate Now
          </a>
        </nav>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <div className="fund-hero">
          <div className="fund-hero-eyebrow">◈ Haverim Mehalzim · Transparency</div>
          <div className="fund-hero-status">
            <span className="fund-hero-status-dot">
              <span className="fund-hero-status-ping" />
              <span className="fund-hero-status-core" />
            </span>
            Response active — 24 hours a day, 7 days a week
          </div>
          <h1 className="fund-hero-headline">
            Every Minute Counts.<br />Here's What It Costs.
          </h1>
          <p className="fund-hero-body">
            Every donation goes directly into funding the people who respond.
            In an emergency, time is the resource we can't afford to lose —
            your support keeps our team on the clock, at no cost to those we help.
          </p>
        </div>

        {/* ── Response Value Model ────────────────────────────────────────── */}
        <SectionLabel text="Emergency Response Value Model" />
        <p className="fund-section-sub">
          Every amount funds something real and measurable. Pick the response you want to make possible.
        </p>
        <div className="fund-tiers-grid">
          {RESPONSE_TIERS.map(tier => (
            <TierCard key={tier.amount} tier={tier} />
          ))}
        </div>

        {/* ── Testimonials ────────────────────────────────────────────────── */}
        <TestimonialsSection />

        {/* ── Final CTA ───────────────────────────────────────────────────── */}
        <div className="fund-cta">
          <div className="fund-cta-corner fund-cta-corner--tl" />
          <div className="fund-cta-corner fund-cta-corner--tr" />
          <div className="fund-cta-corner fund-cta-corner--bl" />
          <div className="fund-cta-corner fund-cta-corner--br" />
          <div className="fund-cta-eyebrow">◈ Every Minute Counts</div>
          <h2 className="fund-cta-headline">Fund the people who show up.</h2>
          <p className="fund-cta-body">
            Our volunteers respond at no cost to the people they help. Your donation covers
            everything it takes to make that possible — every hour of coordination, every
            call answered, every family kept informed.
          </p>
          <a href={DONATE_URL} onClick={e => { e.preventDefault(); openDonate(); }} className="fund-cta-btn">
            <span style={{ fontSize: 14 }}>♥</span>
            Donate Now
          </a>
        </div>

      </div>
    </div>
  );
}
