import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './leaderboard.css';

const DONATE_URL = 'https://www.jgive.com/new/en/usd/donation-targets/110214';

interface LeaderboardEntry {
  rank:        number;
  name:        string;
  lives_saved: number;
}

type LoadState = 'loading' | 'error' | 'ready';

function CountUp({ to, duration = 1400 }: { to: number; duration?: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!to) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setValue(Math.floor((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <>{value}</>;
}

const ORDINAL = ['1st', '2nd', '3rd'];

export default function LeaderboardPage() {
  const [searchParams] = useSearchParams();
  const you = (searchParams.get('you') || '').toLowerCase();
  const [state,   setState]   = useState<LoadState>('loading');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(j => { if (!j.success) throw new Error(); setEntries(j.data); setState('ready'); })
      .catch(() => setState('error'));
  }, []);

  const isYou = (name: string) => you && name.toLowerCase() === you;

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const youRank = you ? entries.findIndex(e => e.name.toLowerCase() === you) + 1 : 0;

  // ── Loading ──
  if (state === 'loading') return (
    <div className="lb-page">
      <div className="lb-wrapper">
        <div className="lb-loading">
          <div className="lb-spinner" />
          <div className="lb-loading-text">Loading leaderboard…</div>
        </div>
      </div>
    </div>
  );

  // ── Error ──
  if (state === 'error') return (
    <div className="lb-page">
      <div className="lb-wrapper">
        <nav className="lb-nav">
          <Link to="/" className="lb-back">← Back to Dashboard</Link>
          <div className="lb-nav-brand"><span className="lb-nav-dot" />Haverim Mehalzim</div>
        </nav>
        <div className="lb-error">
          <div className="lb-error-icon">◈</div>
          <p>Could not load the leaderboard right now. Please try again shortly.</p>
          <Link to="/" className="lb-home-btn">View Our Operations →</Link>
        </div>
      </div>
    </div>
  );

  // ── Ready ──
  return (
    <div className="lb-page">
      <div className="lb-wrapper">

        <nav className="lb-nav">
          <Link to="/" className="lb-back">← Back to Dashboard</Link>
          <div className="lb-nav-brand"><span className="lb-nav-dot" />Haverim Mehalzim</div>
        </nav>

        <div className="lb-hero">
          <div className="lb-eyebrow">◈ Impact Leaderboard</div>
          <h1 className="lb-title">
            Every life saved<br />
            <span className="lb-title-accent">starts with you.</span>
          </h1>
          <p className="lb-sub">
            Our donors make emergency response possible. See the real-world impact of every
            contribution — measured in lives saved.
          </p>
          {youRank > 0 && (
            <div className="lb-your-rank-chip">
              Your current rank: <span className="lb-your-rank-num">#{youRank}</span>
            </div>
          )}
        </div>

        {/* Top 3 podium */}
        {top3.length > 0 && (
          <div className="lb-podium">
            {top3.map((entry, i) => (
              <div
                key={entry.rank}
                className={`lb-podium-card rank-${i + 1}${isYou(entry.name) ? ' you' : ''}`}
              >
                {isYou(entry.name) && <div className="lb-you-badge">You</div>}
                <div className="lb-podium-ordinal">{ORDINAL[i]}</div>
                <div className="lb-podium-name">{entry.name}</div>
                <div className="lb-podium-lives"><CountUp to={entry.lives_saved} /></div>
                <div className="lb-podium-lives-label">
                  {entry.lives_saved === 1 ? 'life saved' : 'lives saved'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ranked list (#4 onwards) */}
        {rest.length > 0 && (
          <div className="lb-table">
            {rest.map(entry => (
              <div
                key={entry.rank}
                className={`lb-row${isYou(entry.name) ? ' you' : ''}`}
              >
                <span className="lb-row-rank">#{entry.rank}</span>
                <span className="lb-row-name">
                  {entry.name}
                  {isYou(entry.name) && <span className="lb-you-inline">← You</span>}
                </span>
                <span className="lb-row-lives">
                  {entry.lives_saved}
                  <span className="lb-row-lives-label">
                    {entry.lives_saved === 1 ? ' life' : ' lives'}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}

        {entries.length === 0 && (
          <div className="lb-empty">No entries yet. Be the first to make an impact.</div>
        )}

        {/* CTA */}
        <div className="lb-cta">
          <div className="lb-cta-headline">Ready to climb the ranks?</div>
          <div className="lb-cta-sub">
            Every 5,000 ₪ saves another life. Your next donation could move you up.
          </div>
          <a href={DONATE_URL} target="_blank" rel="noopener noreferrer" className="lb-cta-btn">
            ♥ Donate Now
          </a>
        </div>

      </div>
    </div>
  );
}
