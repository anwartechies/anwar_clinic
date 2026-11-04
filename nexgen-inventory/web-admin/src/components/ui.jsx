import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Card = ({ tone, pad0, flat, onClick, className = '', style, children }) => (
  <div className={`card ${tone || ''} ${pad0 ? 'pad0' : ''} ${flat ? 'flat' : ''} ${onClick ? 'click' : ''} ${className}`} style={style} onClick={onClick}
    role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}>
    {children}
  </div>
);
export const Chip = ({ tone = 'gray', icon: I, children, style }) => <span className={`chip c-${tone}`} style={style}>{I ? <I size={13} /> : null}{children}</span>;
export const Tile = ({ tone = 'gray', icon: I, size, children }) => <span className={`tile t-${tone} ${size || ''}`} aria-hidden="true">{I ? <I size={size === 'sm' ? 16 : 20} /> : children}</span>;
export const Avatar = ({ name = '', initials, bg = '#E7EBFF', fg = '#1B34C4', size }) => (
  <span className={`av ${size || ''}`} style={{ background: bg, color: fg }} aria-hidden="true">{initials || name.replace(/^Dr\.?\s+/i, '').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()}</span>
);
export const Btn = ({ tone = 'cobalt', icon: I, size, block, children, className = '', ...p }) => (
  <button type="button" className={`btn b-${tone} ${size || ''} ${block ? 'block' : ''} ${className}`} {...p}>{I ? <I size={size === 'sm' ? 15 : 17} /> : null}{children}</button>
);
export const IconBtn = ({ icon: I, label, badge, ...p }) => <button type="button" className="iconbtn" aria-label={label} title={label} {...p}><I size={19} />{badge ? <span className="badge" /> : null}</button>;
export const Toggle = ({ on, onChange, label, disabled }) => <button type="button" role="switch" aria-checked={!!on} aria-label={label} disabled={disabled} className={`tog ${on ? 'on' : ''}`} onClick={() => onChange(!on)} />;
export const Bar = ({ value, color = 'var(--mint)', thin }) => <div className={`bar ${thin ? 'thin' : ''}`}><i style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} /></div>;
export const KV = ({ k, v, color }) => <div className="kv"><span>{k}</span><span style={color ? { color } : null}>{v}</span></div>;
export const Banner = ({ tone = 'cobalt', icon: I, children }) => {
  const map = { cobalt: ['var(--cobalt-s)', 'var(--cobalt-d)'], amber: ['var(--amber-s)', 'var(--amber-t)'], coral: ['var(--coral-s)', 'var(--coral-t)'], mint: ['var(--mint-s)', 'var(--mint-t)'], gray: ['var(--line2)', 'var(--ink2)'] };
  const [bg, fg] = map[tone];
  return <div className="banner" style={{ background: bg, color: fg }}>{I ? <I size={16} style={{ flex: 'none', marginTop: 1 }} /> : null}<div>{children}</div></div>;
};

export function Pills({ options, value, onChange }) {
  return (
    <div className="pills" role="tablist">
      {options.map((o) => (
        <button key={o.key} type="button" role="tab" aria-selected={o.key === value} className={`pill ${o.key === value ? 'on' : ''}`} onClick={() => onChange(o.key)}>
          {o.label}{o.n !== undefined && o.n !== null ? <span className="n">{o.n}</span> : null}
        </button>
      ))}
    </div>
  );
}

export const SecHead = ({ title, action, onAction, right }) => (
  <div className="sec-head"><h2 className="h2">{title}</h2>{right || (action ? <button type="button" className="link" onClick={onAction}>{action}</button> : null)}</div>
);

export function Loading({ rows = 4 }) {
  return (
    <div className="card stack" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="row"><div className="skel" style={{ width: 40, height: 40 }} /><div className="grow col" style={{ gap: 8 }}><div className="skel" style={{ height: 12, width: `${70 - i * 8}%` }} /><div className="skel" style={{ height: 10, width: '40%' }} /></div></div>
      ))}
    </div>
  );
}
export const ErrorBox = ({ error, onRetry }) => (
  <div className="card night row"><span className="tile" style={{ background: 'var(--coral)', color: '#fff' }}>!</span><div className="grow"><b>Couldn't load</b><div style={{ color: 'var(--night-muted)', fontSize: 13 }}>{error}</div></div>{onRetry ? <Btn tone="white" size="sm" onClick={onRetry}>Retry</Btn> : null}</div>
);
// Shows skeleton / error / content for a useFetch result.
export function Async({ q, rows, children }) {
  if (q.loading && !q.data) return <Loading rows={rows} />;
  if (q.error && !q.data) return <ErrorBox error={q.error} onRetry={q.reload} />;
  return children(q.data);
}

export function Empty({ title, body }) {
  return <div className="card" style={{ textAlign: 'center', padding: 36 }}><div className="h2">{title}</div>{body ? <p className="sub" style={{ margin: '8px auto 0', maxWidth: 380 }}>{body}</p> : null}</div>;
}

function useEscape(onClose) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
}

export function Drawer({ title, subtitle, right, onClose, footer, children }) {
  useEscape(onClose);
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : 'Details'}>
        <div className="head"><div className="grow">{subtitle ? <div className="sub">{subtitle}</div> : null}<div className="h2">{title}</div></div>{right}<IconBtn icon={X} label="Close" onClick={onClose} /></div>
        <div className="body">{children}</div>
        {footer ? <div className="foot">{footer}</div> : null}
      </aside>
    </>
  );
}

export function Modal({ title, onClose, children, footer }) {
  useEscape(onClose);
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="between"><div className="h2">{title}</div><IconBtn icon={X} label="Close" onClick={onClose} /></div>
        {children}
        {footer ? <div className="row" style={{ justifyContent: 'flex-end' }}>{footer}</div> : null}
      </div>
    </>
  );
}

export const Field = ({ label, children, help }) => <div className="field"><label>{label}</label>{children}{help ? <span className="sub" style={{ fontSize: 12 }}>{help}</span> : null}</div>;
