import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  text: string;
  children?: React.ReactNode;
}

export function Tooltip({ text, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!visible || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setCoords({ x: r.left + r.width / 2, y: r.top });
  }, [visible]);

  const tooltip = visible
    ? createPortal(
        <span
          role="tooltip"
          style={{
            position: 'fixed',
            left: coords.x,
            top: coords.y - 8,
            transform: 'translate(-50%, -100%)',
            width: 200,
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            background: 'rgba(10,20,18,0.97)',
            border: '1px solid rgba(0,230,160,0.3)',
            color: '#c8d8d4',
            fontSize: 11,
            lineHeight: 1.55,
            padding: '7px 11px',
            borderRadius: 5,
            zIndex: 99999,
            pointerEvents: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
            textTransform: 'none',
            letterSpacing: 'normal',
            fontFamily: 'system-ui, sans-serif',
            fontWeight: 400,
          }}
        >
          {text}
          <span style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid rgba(0,230,160,0.3)',
          }} />
        </span>,
        document.body,
      )
    : null;

  return (
    <span
      ref={ref}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children ?? <TooltipIcon />}
      {tooltip}
    </span>
  );
}

export function TooltipIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      style={{ marginLeft: 4, cursor: 'help', flexShrink: 0, opacity: 0.55, verticalAlign: 'middle' }}
    >
      <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1" />
      <text x="6.5" y="9.5" textAnchor="middle" fontSize="7.5" fill="currentColor" fontWeight="600">?</text>
    </svg>
  );
}
