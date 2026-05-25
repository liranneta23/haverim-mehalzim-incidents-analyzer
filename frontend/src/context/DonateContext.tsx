import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface DonateParams {
  incidentId?: string;
  fullName?: string;
  email?: string;   // pre-populated when known (e.g. returning donor)
  // Internal access tokens are intentionally excluded — never pass them to third-party URLs
}

interface DonateContextValue {
  openDonate: (params?: DonateParams) => void;
}

const DonateContext = createContext<DonateContextValue>({ openDonate: () => {} });

const EMBED_BASE   = 'https://www.jgive.com/new/en/ils/embeds/9810c15b-6b6f-4255-9e48-df2aaa659f38';
const EMBED_SCRIPT = 'https://www.jgive.com/embed/embedding-utm.js';
const EMAIL_RE     = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function buildSrc(email: string, params: DonateParams): string {
  const q = new URLSearchParams();
  q.set('email', email.trim());
  if (params.incidentId) q.set('incident_id', params.incidentId);
  if (params.fullName)   q.set('name',        params.fullName);
  return `${EMBED_BASE}?${q.toString()}`;
}

function DonateModal({ params, onClose }: { params: DonateParams; onClose: () => void }) {
  const prefilled = (params.email ?? '').trim();
  const [step,       setStep]       = useState<'email' | 'iframe'>(prefilled ? 'iframe' : 'email');
  const [email,      setEmail]      = useState(prefilled);
  const [emailError, setEmailError] = useState('');

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

  const handleContinue = () => {
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    setStep('iframe');
  };

  return (
    <div className="donate-overlay" onClick={onClose}>
      <div className="donate-modal" onClick={e => e.stopPropagation()}>
        <div className="donate-modal-header">
          <span className="donate-modal-title">♥ Donate</span>
          <button className="donate-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {step === 'email' ? (
          <div className="donate-email-step">
            <p className="donate-email-desc">
              Enter your email to receive a personal impact dashboard after your donation — so you can always see what your contribution made possible.
            </p>
            <input
              className={`donate-email-input${emailError ? ' donate-email-input--error' : ''}`}
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') handleContinue(); }}
              autoFocus
              autoComplete="email"
              maxLength={254}
            />
            {emailError && <p className="donate-email-error">{emailError}</p>}
            <button className="donate-email-cta" onClick={handleContinue}>
              Continue to Donation →
            </button>
            <button className="donate-email-skip" onClick={() => { setEmail(''); setStep('iframe'); }}>
              Skip
            </button>
          </div>
        ) : (
          <div className="donate-modal-body">
            <iframe
              id="jgive-iframe"
              width="100%"
              height="557"
              src={buildSrc(email, params)}
              name="Jgive iframe"
              title='חברים מחלצים - סיוע לישראלים, יהודים ומשפחותיהם בסכנת חיים בחו"ל.'
              frameBorder="0"
              scrolling="auto"
              allow="allow-forms; payment; clipboard-write;"
              style={{ display: 'block', border: 'none' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function DonateProvider({ children }: { children: ReactNode }) {
  const [open, setOpen]     = useState(false);
  const [params, setParams] = useState<DonateParams>({});

  const openDonate = (p?: DonateParams) => {
    setParams(p ?? {});
    setOpen(true);
  };

  return (
    <DonateContext.Provider value={{ openDonate }}>
      {children}
      {open && <DonateModal params={params} onClose={() => setOpen(false)} />}
    </DonateContext.Provider>
  );
}

export const useDonate = () => useContext(DonateContext);
