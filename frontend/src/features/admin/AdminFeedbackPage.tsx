import { useState, useCallback } from 'react';

const MONO = "'JetBrains Mono', 'Courier New', monospace";
const BG   = '#06090f';
const BG2  = '#0c1420';
const TEAL = '#00c9b1';

interface FeedbackEntry {
  id:        string;
  name:      string;
  message:   string;
  case_id:   string;
  timestamp: string;
  approved:  boolean;
}

function fmtDate(ts: string) {
  try { return new Date(ts).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return ts; }
}

function EntryCard({
  entry, index, token, onDeleted, onApprovalChanged,
}: {
  entry: FeedbackEntry; index: number; token: string;
  onDeleted: (i: number) => void;
  onApprovalChanged: (i: number, approved: boolean) => void;
}) {
  const [deleting,   setDeleting]   = useState(false);
  const [confirmed,  setConfirmed]  = useState(false);
  const [approving,  setApproving]  = useState(false);

  const authHeader = { 'Authorization': `Bearer ${token}` };

  const handleApprove = useCallback(async (approve: boolean) => {
    setApproving(true);
    try {
      const res = await fetch(`/api/admin/feedback/${entry.id}/approve`, {
        method:  'PATCH',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ approved: approve }),
      });
      if (res.ok) onApprovalChanged(index, approve);
    } finally { setApproving(false); }
  }, [entry.id, index, token, onApprovalChanged]);

  const handleDelete = useCallback(async () => {
    if (!confirmed) { setConfirmed(true); return; }
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/feedback/${entry.id}`, { method: 'DELETE', headers: authHeader });
      if (res.ok) onDeleted(index);
    } finally { setDeleting(false); setConfirmed(false); }
  }, [confirmed, entry.id, index, token, onDeleted]);

  const isApproved = entry.approved;

  return (
    <div style={{
      background: BG2,
      border: `1px solid ${isApproved ? 'rgba(0,201,177,0.2)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 10,
      padding: '1.25rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      position: 'relative',
      transition: 'border-color 0.3s',
    }}>

      {/* Status pill */}
      <div style={{ position: 'absolute', top: 14, right: 14 }}>
        <span style={{
          fontFamily: MONO, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase',
          fontWeight: 700, padding: '3px 9px', borderRadius: 100,
          background: isApproved ? 'rgba(0,201,177,0.12)' : 'rgba(255,255,255,0.05)',
          color:      isApproved ? TEAL : 'rgba(255,255,255,0.25)',
          border:     `1px solid ${isApproved ? 'rgba(0,201,177,0.25)' : 'rgba(255,255,255,0.08)'}`,
        }}>
          {isApproved ? '✓ Published' : '⏳ Pending'}
        </span>
      </div>

      {/* Name + case */}
      <div style={{ paddingRight: '6rem' }}>
        <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
          {entry.name}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: `${TEAL}66`, marginTop: 3 }}>
          CASE {entry.case_id} · {fmtDate(entry.timestamp)}
        </div>
      </div>

      {/* Message */}
      <p style={{
        margin: 0, fontSize: 13, lineHeight: 1.75, color: '#8aa0b4',
        fontStyle: 'italic',
        borderLeft: `2px solid ${isApproved ? TEAL + '44' : 'rgba(255,255,255,0.1)'}`,
        paddingLeft: '0.9rem',
        fontFamily: 'system-ui, sans-serif',
        transition: 'border-color 0.3s',
      }}>
        "{entry.message}"
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {!isApproved ? (
          <button
            onClick={() => handleApprove(true)}
            disabled={approving}
            style={{
              fontFamily: MONO, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
              fontWeight: 700, padding: '6px 16px', borderRadius: 6, border: 'none',
              background: TEAL, color: '#06090f',
              cursor: approving ? 'not-allowed' : 'pointer',
              opacity: approving ? 0.6 : 1, transition: 'opacity 0.2s',
            }}
          >
            {approving ? 'Publishing…' : '✓ Approve & Publish'}
          </button>
        ) : (
          <button
            onClick={() => handleApprove(false)}
            disabled={approving}
            style={{
              fontFamily: MONO, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '6px 14px', borderRadius: 6,
              border: '1px solid rgba(0,201,177,0.2)',
              background: 'transparent', color: `${TEAL}88`,
              cursor: approving ? 'not-allowed' : 'pointer',
              opacity: approving ? 0.6 : 1, transition: 'opacity 0.2s',
            }}
          >
            {approving ? '…' : 'Revoke'}
          </button>
        )}

        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            fontFamily: MONO, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '6px 14px', borderRadius: 6,
            border: `1px solid ${confirmed ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
            background: confirmed ? 'rgba(239,68,68,0.1)' : 'transparent',
            color: confirmed ? '#f87171' : 'rgba(255,255,255,0.25)',
            cursor: deleting ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
          }}
        >
          {deleting ? 'Removing…' : confirmed ? 'Confirm?' : 'Remove'}
        </button>
      </div>
    </div>
  );
}

export default function AdminFeedbackPage() {
  const [token,   setToken]   = useState('');
  const [entries, setEntries] = useState<FeedbackEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const authHeaders = useCallback((t: string) => ({
    'Authorization': `Bearer ${t}`,
    'Content-Type': 'application/json',
  }), []);

  const load = useCallback(async (t: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/feedback', { headers: authHeaders(t) });
      if (res.status === 403) { setError('Wrong token.'); setEntries(null); return; }
      const json = await res.json();
      if (!json.success) { setError('Failed to load.'); return; }
      setEntries(json.data);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  const handleDeleted = useCallback((idx: number) => {
    setEntries(prev => prev ? prev.filter((_, i) => i !== idx) : prev);
  }, []);

  const handleApprovalChanged = useCallback((idx: number, approved: boolean) => {
    setEntries(prev => prev ? prev.map((e, i) => i === idx ? { ...e, approved } : e) : prev);
  }, []);

  const isLoggedIn = entries !== null;

  return (
    <div style={{ minHeight: '100dvh', background: BG, color: '#e2e8f0', fontFamily: MONO }}>

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: `${BG}ee`, backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,201,177,0.12)',
        padding: '1rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: TEAL, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            Haverim Mehalzim
          </span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', marginLeft: 12 }}>
            FEEDBACK ADMIN
          </span>
        </div>
        {isLoggedIn && (
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
            {entries!.filter(e => e.approved).length} published · {entries!.filter(e => !e.approved).length} pending
          </span>
        )}
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>

        {/* Login */}
        {!isLoggedIn && (
          <div style={{
            background: BG2,
            border: '1px solid rgba(0,201,177,0.14)',
            borderRadius: 14,
            padding: '2rem',
            maxWidth: 380,
            margin: '4rem auto',
          }}>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: TEAL, marginBottom: '1.25rem' }}>
              ◈ Admin Access
            </div>
            <input
              type="password"
              placeholder="Enter admin token"
              value={token}
              onChange={e => setToken(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && token && load(token)}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, color: '#e2e8f0',
                fontFamily: MONO, fontSize: 13,
                padding: '0.7rem 0.9rem',
                outline: 'none', marginBottom: '0.75rem', display: 'block',
              }}
            />
            {error && (
              <p style={{ fontSize: 11, color: '#f87171', margin: '0 0 0.75rem', fontFamily: 'system-ui, sans-serif' }}>
                {error}
              </p>
            )}
            <button
              onClick={() => token && load(token)}
              disabled={loading || !token}
              style={{
                width: '100%', padding: '0.75rem',
                background: TEAL, color: BG, border: 'none',
                borderRadius: 8, fontFamily: MONO, fontSize: 10,
                fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                cursor: loading || !token ? 'not-allowed' : 'pointer',
                opacity: loading || !token ? 0.6 : 1, transition: 'opacity 0.2s',
              }}
            >
              {loading ? 'Loading…' : 'Access →'}
            </button>
          </div>
        )}

        {/* Feedback list */}
        {isLoggedIn && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: TEAL, marginBottom: '0.4rem' }}>
                ◈ Family Feedback
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0, fontFamily: 'system-ui, sans-serif', lineHeight: 1.6 }}>
                Review submissions below. Only approved ones appear on the fund page.
              </p>
            </div>

            {entries!.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '4rem 2rem',
                color: 'rgba(255,255,255,0.2)', fontSize: 12,
                fontFamily: 'system-ui, sans-serif',
              }}>
                No feedback submitted yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {entries!.map((e, i) => (
                  <EntryCard key={i} entry={e} index={i} token={token} onDeleted={handleDeleted} onApprovalChanged={handleApprovalChanged} />
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
