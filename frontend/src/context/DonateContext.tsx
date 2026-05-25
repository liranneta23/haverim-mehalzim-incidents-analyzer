import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DonateContextValue {
  openDonate: () => void;
}

const DonateContext = createContext<DonateContextValue>({ openDonate: () => {} });

const EMBED_SRC    = 'https://www.jgive.com/new/en/ils/embeds/9810c15b-6b6f-4255-9e48-df2aaa659f38';
const EMBED_SCRIPT = 'https://www.jgive.com/embed/embedding-utm.js';

function DonateModal({ onClose }: { onClose: () => void }) {
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

export function DonateProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openDonate = () => setOpen(true);

  return (
    <DonateContext.Provider value={{ openDonate }}>
      {children}
      {open && <DonateModal onClose={() => setOpen(false)} />}
    </DonateContext.Provider>
  );
}

export const useDonate = () => useContext(DonateContext);
