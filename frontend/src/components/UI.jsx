import { useEffect, useState } from 'react';
import { fmtTime, secondsLeft } from '../utils/helpers';

// ── Panel variants ────────────────────────────────
export const Panel  = ({ children, className = '', style }) => <div className={`panel p-5 ${className}`} style={style}>{children}</div>;
export const PanelY = ({ children, className = '', style }) => <div className={`panel-y p-5 ${className}`} style={style}>{children}</div>;
export const PanelR = ({ children, className = '', style }) => <div className={`panel-r p-5 ${className}`} style={style}>{children}</div>;
export const PanelC = ({ children, className = '', style }) => <div className={`panel-c p-5 ${className}`} style={style}>{children}</div>;

// ── Buttons ───────────────────────────────────────
export const BtnG = ({ children, onClick, disabled, className = '', style }) => (
  <button className={`btn-g ${className}`} onClick={onClick} disabled={disabled} style={{ opacity: disabled ? .4 : 1, cursor: disabled ? 'not-allowed' : 'pointer', ...style }}>
    <span>{children}</span>
  </button>
);
export const BtnY = ({ children, onClick, disabled, className = '' }) => (
  <button className={`btn-y ${className}`} onClick={onClick} disabled={disabled} style={{ opacity: disabled ? .4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}>
    <span>{children}</span>
  </button>
);
export const BtnR = ({ children, onClick, disabled, className = '' }) => (
  <button className={`btn-r ${className}`} onClick={onClick} disabled={disabled} style={{ opacity: disabled ? .4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}>
    <span>{children}</span>
  </button>
);

// ── Tags ──────────────────────────────────────────
export const Tag  = ({ c = 'g', children }) => <span className={`tag tag-${c}`}>{children}</span>;

// ── Label ─────────────────────────────────────────
export const Label = ({ children, color = '#00ff41' }) => (
  <div style={{ fontSize: 10, color, letterSpacing: 2, marginBottom: 6, fontFamily: '"Share Tech Mono",monospace' }}>
    {children}
  </div>
);

// ── Input ─────────────────────────────────────────
export const Input = ({ value, onChange, placeholder, type = 'text', style, yellow, onKeyDown }) => (
  <input
    className={`inp${yellow ? ' inp-y' : ''}`}
    type={type} value={value} onChange={onChange}
    placeholder={placeholder} onKeyDown={onKeyDown}
    style={style}
  />
);

// ── Textarea ──────────────────────────────────────
export const Textarea = ({ value, onChange, placeholder, rows = 4 }) => (
  <textarea
    className="inp"
    rows={rows} value={value} onChange={onChange}
    placeholder={placeholder}
    style={{ resize: 'vertical', lineHeight: 1.7 }}
  />
);

// ── Select ────────────────────────────────────────
export const Select = ({ value, onChange, children, yellow }) => (
  <select className={`inp${yellow ? ' inp-y' : ''}`} value={value} onChange={onChange}>
    {children}
  </select>
);

// ── Section heading ───────────────────────────────
export const SectionHead = ({ children, color = '#00ff41', prefix = '//' }) => (
  <div style={{ fontFamily: '"Share Tech Mono",monospace', fontSize: 11, color, letterSpacing: 3, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{ opacity: .5 }}>{prefix}</span> {children}
  </div>
);

// ── Wallet display ────────────────────────────────
export const WalletBig = ({ amount, label = 'GENESIS WALLET', color = '#ffd700' }) => (
  <div style={{ textAlign: 'right' }}>
    <div className="wallet-num" style={{ fontSize: 28, color, textShadow: `0 0 16px ${color}`, letterSpacing: 2 }}>
      ₢{Number(amount || 0).toLocaleString()}
    </div>
    <div style={{ fontSize: 9, color: '#3a5a7a', letterSpacing: 2 }}>{label}</div>
  </div>
);

// ── Timer ─────────────────────────────────────────
export function Timer({ endsAt, onExpire, large }) {
  const [secs, setSecs] = useState(secondsLeft(endsAt));

  useEffect(() => {
    setSecs(secondsLeft(endsAt));
    if (!endsAt) return;
    const iv = setInterval(() => {
      const s = secondsLeft(endsAt);
      setSecs(s);
      if (s === 0) { clearInterval(iv); onExpire?.(); }
    }, 1000);
    return () => clearInterval(iv);
  }, [endsAt]);

  if (!endsAt || secs === null) return null;
  const critical = secs < 60;
  const size = large ? 48 : 28;

  return (
    <div className="wallet-num" style={{
      fontSize: size, fontVariantNumeric: 'tabular-nums',
      color: critical ? '#ff0030' : '#ffd700',
      textShadow: `0 0 16px ${critical ? '#ff0030' : '#ffd700'}`,
    }}>
      {fmtTime(secs)}
    </div>
  );
}

// ── Progress bar ──────────────────────────────────
export const ProgressBar = ({ value, max, color = '#00ff41' }) => (
  <div className="progress-bar">
    <div className="progress-fill" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
  </div>
);

// ── Rank medal ────────────────────────────────────
export const Medal = ({ rank }) => {
  if (rank === 1) return <span style={{ fontSize: 20 }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize: 20 }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: 20 }}>🥉</span>;
  return <span style={{ fontFamily: '"Share Tech Mono",monospace', color: '#3a5a7a', fontSize: 14 }}>#{rank}</span>;
};

// ── Terminal line ─────────────────────────────────
export const TermLine = ({ text, type = 'normal' }) => {
  const color = type === 'success' ? '#00ff41' : type === 'error' ? '#ff0030' : type === 'warn' ? '#ffd700' : '#5a9a5a';
  return <div style={{ color, fontFamily: '"VT323",monospace', fontSize: 16, marginBottom: 2 }}>{text}</div>;
};

// ── Overlay (game over / complete) ────────────────
export const FullOverlay = ({ icon, title, sub, color = '#ff0030' }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
    <div style={{ textAlign: 'center', border: `2px solid ${color}`, padding: 64, background: 'rgba(0,0,0,.9)', boxShadow: `0 0 60px ${color}44`, maxWidth: 480 }}>
      <div style={{ fontSize: 72, marginBottom: 12 }}>{icon}</div>
      <div className="head-font" style={{ fontSize: 36, color, textShadow: `0 0 20px ${color}`, letterSpacing: 4 }}>{title}</div>
      <div style={{ color: '#3a5a7a', marginTop: 12, fontSize: 14, letterSpacing: 2 }}>{sub}</div>
    </div>
  </div>
);

// ── Loading spinner ───────────────────────────────
export const Loading = ({ label = 'LOADING...' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
    <div style={{ width: 40, height: 40, border: '2px solid #003311', borderTop: '2px solid #00ff41', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    <div style={{ fontFamily: '"VT323",monospace', fontSize: 24, color: '#3a5a7a', letterSpacing: 3 }} className="anim-blink">{label}</div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ── Matrix rain ───────────────────────────────────
const CHARS = 'ｦｱｳｵｶｷｸｺｻｼｾｿﾀﾁﾃﾄﾅﾆﾇﾈﾊﾋﾌﾍﾎﾐﾒﾔﾖﾗﾚﾜﾝ01';
export function MatrixRain({ opacity = 0.15, count = 25 }) {
  const drops = Array.from({ length: count }, (_, i) => ({
    x: (i / count) * 100 + Math.random() * (100 / count),
    delay: Math.random() * 8,
    dur: 4 + Math.random() * 6,
  }));
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0, opacity }}>
      {drops.map((d, i) => (
        <span key={i} style={{
          position: 'absolute', left: `${d.x}%`, top: 0,
          fontFamily: '"VT323",monospace', color: '#00ff41',
          fontSize: `${10 + Math.random() * 6}px`, whiteSpace: 'nowrap',
          animation: `matrixRain ${d.dur}s ${d.delay}s linear infinite`,
        }}>
          {Array.from({ length: 24 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('\n')}
        </span>
      ))}
      <style>{`@keyframes matrixRain { 0%{transform:translateY(-20px);opacity:0} 5%{opacity:.7} 90%{opacity:.5} 100%{transform:translateY(110vh);opacity:0} }`}</style>
    </div>
  );
}

// ── Ticker ────────────────────────────────────────
export function Ticker({ teams = [] }) {
  const items = teams.length
    ? teams.flatMap(t => [`⬡ ${t.name}: ₢${Number(t.wallet || 0).toLocaleString()}`, '//'])
    : ['⬡ SYNTAXCIPHER CHAMPION', '//', '⬡ GENESIS WALLET ARENA', '//', '⬡ AWAITING TEAMS', '//'];
  return (
    <div style={{ overflow: 'hidden', borderTop: '1px solid rgba(0,255,65,.15)', borderBottom: '1px solid rgba(0,255,65,.15)', padding: '5px 0', background: 'rgba(0,5,0,.6)' }}>
      <div style={{ display: 'flex', gap: 48, animation: 'tickerScroll 28s linear infinite', whiteSpace: 'nowrap', fontSize: 11, color: '#00cc33', letterSpacing: 2, fontFamily: '"Share Tech Mono",monospace' }}>
        {[...items, ...items].map((s, i) => <span key={i}>{s}</span>)}
      </div>
      <style>{`@keyframes tickerScroll { 0%{transform:translateX(100vw)} 100%{transform:translateX(-100%)} }`}</style>
    </div>
  );
}
