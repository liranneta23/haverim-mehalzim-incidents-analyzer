import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Two donation paths:
//   • GENERAL donation (no incident)  → JGive iframe (supports recurring + one-time)
//   • INCIDENT-SPECIFIC donation      → Tranzila hosted page (one-time only)
// openDonate() with no incidentId opens JGive; openDonate({incidentId}) opens
// the Tranzila flow so the payment is traceable to that incident + package.
// ─────────────────────────────────────────────────────────────────────────────

const EMBED_SRC    = 'https://www.jgive.com/new/en/ils/embeds/9810c15b-6b6f-4255-9e48-df2aaa659f38';
const EMBED_SCRIPT = 'https://www.jgive.com/embed/embedding-utm.js';

// Donation packages (USD) for the incident-specific Tranzila flow. Keep ids
// stable — they are stored on the Monday donation row via the package column.
export interface DonatePackage { id: string; label: string; amount: number; }

export const DONATE_PACKAGES: DonatePackage[] = [
  { id: 'golden_hour', label: 'Golden Hour',            amount: 150 },
  { id: 'six_hour',    label: '6-Hour Rapid Response',  amount: 900 },
  { id: 'sos_shift',   label: '24-Hour SOS Shift',      amount: 3000 },
  { id: 'scoop_run',   label: 'Scoop & Run',            amount: 14000 },
];

// Donor-selectable currencies. Package amounts above are USD; ILS is derived
// with the backend's rate (fetched at runtime), falling back to this constant.
export type Currency = 'USD' | 'ILS';
const USD_TO_ILS_FALLBACK = 3.7;

export interface DonateContext {
  incidentId?: string;
  incidentName?: string;
  packageId?: string;
  packageLabel?: string;
  amount?: number;
}

interface DonateContextValue {
  openDonate: (ctx?: DonateContext) => void;
}

const DonateCtx = createContext<DonateContextValue>({ openDonate: () => {} });

// ─────────────────────────────────────────────────────────────────────────────
// General donation — JGive iframe (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
function JGiveModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    if (!document.querySelector(`script[src="${EMBED_SCRIPT}"]`)) {
      const s = document.createElement('script');
      s.src = EMBED_SCRIPT;
      document.body.appendChild(s);
    }
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="donate-overlay" onClick={onClose}>
      <div className="donate-modal" onClick={e => e.stopPropagation()}>
        <div className="donate-modal-header">
          <span className="donate-modal-title">♥ Donate</span>
          <button className="donate-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="donate-modal-body">
          <iframe
            id="jgive-iframe"
            width="100%"
            height="557"
            src={EMBED_SRC}
            name="Jgive iframe"
            title='חברים מחלצים - סיוע לישראלים, יהודים ומשפחותיהם בסכנת חיים בחו"ל.'
            frameBorder="0"
            scrolling="auto"
            allow="allow-forms; payment; clipboard-write;"
            style={{ display: 'block', border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Incident-specific donation — Tranzila. Collects donor details + amount, then
// hands off to Tranzila's secure hosted page (full-page redirect). No card data
// ever touches this app.
// ─────────────────────────────────────────────────────────────────────────────
function TranzilaModal({ ctx, onClose }: { ctx: DonateContext; onClose: () => void }) {
  const preset = ctx.amount
    ? { id: ctx.packageId || 'custom', label: ctx.packageLabel || 'Custom', amount: ctx.amount }
    : DONATE_PACKAGES[0];

  // Preset package amounts are defined in USD; the donor may pay in USD or ILS.
  const [currency,  setCurrency]  = useState<Currency>('USD');
  const [rate,      setRate]      = useState<number>(USD_TO_ILS_FALLBACK);
  const [packageId, setPackageId] = useState(preset.id);
  const [amount,    setAmount]    = useState<string>(String(preset.amount));
  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [phone,     setPhone]     = useState('');
  const [error,     setError]     = useState('');
  const [busy,      setBusy]      = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  // One shared USD→ILS rate from the backend, so the price shown here and the
  // 14K-USD impact-link threshold checked on the server never diverge.
  useEffect(() => {
    fetch('/api/payment-config')
      .then(r => r.json())
      .then(j => { if (j?.success && j.usd_to_ils > 0) setRate(j.usd_to_ils); })
      .catch(() => {});
  }, []);

  const symbol   = currency === 'USD' ? '$' : '₪';
  // A USD package amount shown in the selected currency.
  const display  = (usd: number) => (currency === 'USD' ? usd : Math.round(usd * rate));

  const pickPackage = (p: DonatePackage) => { setPackageId(p.id); setAmount(String(display(p.amount))); };

  const changeCurrency = (next: Currency) => {
    if (next === currency) return;
    const cur = Number(amount);
    if (Number.isFinite(cur) && cur > 0) {
      setAmount(String(next === 'ILS' ? Math.round(cur * rate) : Math.round(cur / rate)));
    }
    setCurrency(next);
  };

  const submit = async () => {
    setError('');
    const amt = Math.round(Number(amount) * 100) / 100;
    if (!Number.isFinite(amt) || amt < 1) { setError('Please enter a valid amount.'); return; }
    if (!name.trim())                     { setError('Please enter your name.'); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setError('Please enter a valid email.'); return; }

    const chosen = DONATE_PACKAGES.find(p => p.id === packageId);
    const isPreset = chosen && Number(amount) === display(chosen.amount);

    setBusy(true);
    try {
      const res = await fetch('/api/donate/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amt,
          currency,
          incident_id:   ctx.incidentId || '',
          package_id:    isPreset ? chosen!.id : 'custom',
          package_label: isPreset ? chosen!.label : 'Custom amount',
          donor_name:  name.trim(),
          donor_email: email.trim(),
          donor_phone: phone.trim(),
        }),
      });
      const json = await res.json();
      if (json.success && json.payment_url) {
        window.location.href = json.payment_url;   // hand off to Tranzila
      } else {
        setError(json.message || 'Could not start the payment. Please try again.');
        setBusy(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setBusy(false);
    }
  };

  const S = STYLES;
  return (
    <div className="donate-overlay" style={S.overlay} onClick={onClose}>
      <div className="donate-modal" style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.header}>
          <span style={S.title}>♥ Donate to this case</span>
          <button style={S.close} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {ctx.incidentName && (
          <div style={S.caseBanner}>Supporting: <strong>{ctx.incidentName}</strong></div>
        )}

        <div style={S.body}>
          <div style={S.currencyRow}>
            <span style={S.fieldLabel}>Currency</span>
            <div style={S.currencyToggle}>
              {(['USD', 'ILS'] as Currency[]).map(c => (
                <button
                  key={c}
                  onClick={() => changeCurrency(c)}
                  style={{ ...S.curBtn, ...(currency === c ? S.curBtnActive : {}) }}
                >
                  {c === 'USD' ? '$ USD' : '₪ ILS'}
                </button>
              ))}
            </div>
          </div>

          <div style={S.fieldLabel}>Choose an amount ({currency})</div>
          <div style={S.tiers}>
            {DONATE_PACKAGES.map(p => (
              <button
                key={p.id}
                onClick={() => pickPackage(p)}
                style={{ ...S.tier, ...(packageId === p.id && Number(amount) === display(p.amount) ? S.tierActive : {}) }}
              >
                <span style={S.tierAmt}>{symbol}{display(p.amount).toLocaleString()}</span>
                <span style={S.tierLbl}>{p.label}</span>
              </button>
            ))}
          </div>

          <div style={S.customRow}>
            <span style={S.customPrefix}>{symbol}</span>
            <input
              style={S.customInput}
              type="number" min={1} inputMode="decimal"
              value={amount}
              onChange={e => { setAmount(e.target.value); setPackageId('custom'); }}
              placeholder="Other amount"
            />
          </div>

          <input style={S.input} value={name}  onChange={e => setName(e.target.value)}  placeholder="Full name" />
          <input style={S.input} value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"  type="email" />
          <input style={S.input} value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone (optional)" type="tel" />

          {error && <div style={S.error}>{error}</div>}

          <button style={{ ...S.cta, ...(busy ? S.ctaBusy : {}) }} onClick={submit} disabled={busy}>
            {busy ? 'Redirecting to secure payment…' : 'Continue to secure payment →'}
          </button>
          <div style={S.secure}>🔒 Processed securely by Tranzila. We never see your card details.</div>
        </div>
      </div>
    </div>
  );
}

export function DonateProvider({ children }: { children: ReactNode }) {
  const [ctx, setCtx] = useState<DonateContext | null>(null);
  const isIncident = !!ctx?.incidentId;
  return (
    <DonateCtx.Provider value={{ openDonate: (c) => setCtx(c || {}) }}>
      {children}
      {ctx && (isIncident
        ? <TranzilaModal ctx={ctx} onClose={() => setCtx(null)} />
        : <JGiveModal onClose={() => setCtx(null)} />)}
    </DonateCtx.Provider>
  );
}

export const useDonate = () => useContext(DonateCtx);

// ─────────────────────────────────────────────────────────────────────────────
// Inline styles for the Tranzila modal — use the app's CSS custom properties
// with safe fallbacks so it matches the dark military aesthetic. (The JGive
// modal keeps using the existing .donate-* stylesheet classes.)
// ─────────────────────────────────────────────────────────────────────────────
const TEAL = 'var(--accent-teal, #2dd4bf)';
const STYLES: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.78)', backdropFilter: 'blur(4px)',
             display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 },
  modal:   { width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto',
             background: 'var(--bg-panel, #0f1720)', border: '1px solid rgba(45,212,191,.25)',
             borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,.6)', color: 'var(--text-primary, #e6edf3)' },
  header:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between',
             padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.08)' },
  title:   { fontSize: 16, fontWeight: 700, letterSpacing: .3 },
  close:   { background: 'transparent', border: 'none', color: 'inherit', fontSize: 18, cursor: 'pointer', opacity: .7 },
  caseBanner: { padding: '10px 20px', fontSize: 13, background: 'rgba(45,212,191,.08)',
                borderBottom: '1px solid rgba(45,212,191,.15)', color: TEAL },
  body:    { padding: 20, display: 'flex', flexDirection: 'column', gap: 12 },
  fieldLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, opacity: .7 },
  currencyRow:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  currencyToggle: { display: 'flex', gap: 6, background: 'rgba(255,255,255,.04)',
                    border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: 3 },
  curBtn:         { padding: '7px 14px', border: 'none', borderRadius: 8, cursor: 'pointer',
                    background: 'transparent', color: 'inherit', fontSize: 13, fontWeight: 700, opacity: .7 },
  curBtnActive:   { background: TEAL, color: '#04121a', opacity: 1 },
  tiers:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  tier:    { display: 'flex', flexDirection: 'column', gap: 2, padding: '10px 12px', cursor: 'pointer',
             background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.12)',
             borderRadius: 10, color: 'inherit', textAlign: 'left' },
  tierActive: { borderColor: TEAL, background: 'rgba(45,212,191,.12)' },
  tierAmt: { fontSize: 16, fontWeight: 700 },
  tierLbl: { fontSize: 11, opacity: .75 },
  customRow: { display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,.12)',
               borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,.03)' },
  customPrefix: { padding: '0 12px', opacity: .7 },
  customInput: { flex: 1, background: 'transparent', border: 'none', color: 'inherit', padding: '12px 8px', fontSize: 15, outline: 'none' },
  input:   { background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10,
             color: 'inherit', padding: '12px', fontSize: 14, outline: 'none' },
  error:   { color: '#f87171', fontSize: 13 },
  cta:     { marginTop: 4, padding: '13px', border: 'none', borderRadius: 10, cursor: 'pointer',
             background: TEAL, color: '#04121a', fontSize: 14, fontWeight: 700 },
  ctaBusy: { opacity: .6, cursor: 'default' },
  secure:  { fontSize: 11, opacity: .55, textAlign: 'center', marginTop: 2 },
};
