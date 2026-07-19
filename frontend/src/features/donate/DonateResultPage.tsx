import { Link } from 'react-router-dom';

// Landing pages Tranzila redirects the browser to after a payment attempt.
// NOTE: these are cosmetic. The authoritative record of a payment is written
// server-side by /api/tranzilla/notify — never trust this page as proof of payment.

export default function DonateResultPage({ variant }: { variant: 'thanks' | 'failed' }) {
  const ok = variant === 'thanks';

  const accent = ok ? '#00e6a0' : '#ff6b6b';
  const title  = ok ? 'Thank you for your donation' : 'Payment not completed';
  const body   = ok
    ? 'Your contribution goes straight to funding the volunteers who respond. A confirmation has been sent to your email.'
    : 'Your payment did not go through and you have not been charged. You can try again whenever you are ready.';

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#080b0e', color: '#e6edf3', padding: 24, textAlign: 'center',
    }}>
      <div style={{
        maxWidth: 460, border: `1px solid ${accent}44`, borderRadius: 14,
        padding: '40px 32px', background: '#0d1117', boxShadow: `0 0 48px ${accent}1a`,
      }}>
        <div style={{ fontSize: 44, marginBottom: 12, color: accent }}>{ok ? '✓' : '✕'}</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{title}</h1>
        <p style={{ fontSize: 14, lineHeight: 1.6, opacity: .8, marginBottom: 28 }}>{body}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{
            padding: '11px 20px', borderRadius: 10, background: accent, color: '#0B0E11',
            fontWeight: 700, fontSize: 13, textDecoration: 'none',
          }}>Back to Dashboard</Link>
          <Link to="/map" style={{
            padding: '11px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,.18)',
            color: '#e6edf3', fontSize: 13, textDecoration: 'none',
          }}>Live Map</Link>
        </div>
      </div>
    </div>
  );
}
