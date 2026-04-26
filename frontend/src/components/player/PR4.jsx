import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Panel, PanelC, BtnG, BtnR, FullOverlay } from '../UI';
import api from '../../utils/api';
import { fmt, CTF_NODES } from '../../utils/helpers';

export default function PR4({ team, roundState, onRefresh }) {
  const [progress, setProgress] = useState({ r4_captured: [], r4_done: false, r4_hint_cost: 0, wallet: 0, layers: [] });
  const [activeNode, setActiveNode] = useState(null);
  const [, setTick] = useState(0);

  useEffect(() => { fetchProgress(); const iv = setInterval(() => setTick(t => t + 1), 500); return () => clearInterval(iv); }, []);

  const fetchProgress = async () => {
    try { const d = await api.get('/rounds/4/progress'); setProgress(d || {}); }
    catch {}
  };

  const tl = roundState.timerEndsAt ? Math.max(0, Math.floor((new Date(roundState.timerEndsAt) - Date.now()) / 1000)) : null;
  const captured = progress.r4_captured || [];
  const gameOver = tl === 0 && !progress.r4_done;

  if (gameOver) return <FullOverlay icon="💀" title="GAME OVER" sub="25-minute gauntlet expired. No reward granted." color="#ff0030" />;
  if (progress.r4_done) return (
    <div className="panel pulse-g" style={{ textAlign: 'center', padding: 60, borderColor: 'rgba(0,255,65,.6)' }}>
      <div style={{ fontSize: 60, marginBottom: 12 }}>🏆</div>
      <div className="head-font" style={{ fontSize: 22, color: '#00ff41', letterSpacing: 4, marginBottom: 8 }}>ALL FLAGS CAPTURED</div>
      <div style={{ color: '#3a5a7a' }}>Gauntlet complete. Await reward from judge.</div>
    </div>
  );

  const W = 320, H = 260;
  const nodePts = CTF_NODES.map(n => ({ ...n, px: n.cx * W / 100, py: n.cy * H / 100 }));
  const lines = [[0,1],[1,2],[2,3],[3,4],[4,0],[0,2],[1,3]];
  const isCaptured = id => captured.includes(id) || captured.includes(String(id));

  return (
    <div className="anim-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div className="head-font" style={{ fontSize: 14, color: '#00ff41', letterSpacing: 3 }}>// CTF GAUNTLET — CAPTURE THE FLAG</div>
          <div style={{ fontSize: 11, color: '#3a5a7a', marginTop: 4 }}>Infiltrate all 5 servers. Each correct answer captures a flag.</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {tl !== null
            ? <div className="wallet-num" style={{ fontSize: 30, color: tl < 60 ? '#ff0030' : '#ffd700', textShadow: `0 0 16px ${tl < 60 ? '#ff0030' : '#ffd700'}`, fontVariantNumeric: 'tabular-nums' }}>
                {String(Math.floor(tl / 60)).padStart(2,'0')}:{String(tl % 60).padStart(2,'0')}
              </div>
            : <span className="tag tag-c">AWAITING JUDGE START</span>
          }
          <div style={{ fontSize: 10, color: '#3a5a7a', marginTop: 4 }}>FLAGS: {captured.length}/5</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 8, background: 'rgba(0,255,65,.1)', marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg,#00cc33,#00ff41)', width: `${(captured.length / 5) * 100}%`, transition: 'width .6s ease', boxShadow: '0 0 8px #00ff41' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Network map */}
        <div className="panel-c" style={{ padding: 16 }}>
          <div style={{ fontSize: 10, color: '#00f5ff', letterSpacing: 2, marginBottom: 10 }}>NETWORK TOPOLOGY</div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
            {lines.map(([a, b], i) => {
              const na = nodePts[a], nb = nodePts[b];
              const bothCap = isCaptured(na.id) && isCaptured(nb.id);
              return <line key={i} x1={na.px} y1={na.py} x2={nb.px} y2={nb.py} stroke={bothCap ? 'rgba(0,255,65,.7)' : 'rgba(0,255,65,.12)'} strokeWidth={bothCap ? 1.5 : 1} strokeDasharray={bothCap ? 'none' : '5 4'} />;
            })}
            {nodePts.map(n => {
              const cap = isCaptured(n.id);
              const active = activeNode?.id === n.id;
              const r = 20;
              const pts = [...Array(6)].map((_, i) => { const a = Math.PI / 180 * (60 * i - 30); return `${n.px + r * Math.cos(a)},${n.py + r * Math.sin(a)}`; }).join(' ');
              return (
                <g key={n.id} onClick={() => !cap && setActiveNode(n)} style={{ cursor: cap ? 'default' : 'pointer' }}>
                  <polygon points={pts}
                    fill={cap ? 'rgba(0,40,0,.9)' : active ? 'rgba(0,20,10,.9)' : 'rgba(0,10,5,.9)'}
                    stroke={cap ? n.color : active ? n.color : 'rgba(0,255,65,.2)'}
                    strokeWidth={cap || active ? 2 : 1}
                    style={{ filter: cap || active ? `drop-shadow(0 0 6px ${n.color})` : 'none', transition: 'all .3s' }} />
                  <text x={n.px} y={n.py - 3} textAnchor="middle" fill={cap ? n.color : active ? n.color : 'rgba(0,255,65,.5)'} fontSize="8" fontFamily='"Share Tech Mono",monospace' letterSpacing="1">{n.codename}</text>
                  <text x={n.px} y={n.py + 8} textAnchor="middle" fill={cap ? '#00ff41' : 'rgba(0,255,65,.35)'} fontSize="7" fontFamily='"Share Tech Mono",monospace'>{cap ? '⚑ CAPTURED' : n.domain}</text>
                </g>
              );
            })}
          </svg>

          {/* Node list */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginTop: 10 }}>
            {CTF_NODES.map(n => {
              const cap = isCaptured(n.id);
              return (
                <div key={n.id} onClick={() => !cap && setActiveNode(n)}
                  style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '6px 8px', background: cap ? 'rgba(0,20,0,.6)' : 'rgba(0,5,0,.4)', border: `1px solid ${cap ? n.color + '55' : 'rgba(0,255,65,.1)'}`, cursor: cap ? 'default' : 'pointer', transition: 'all .2s' }}>
                  <div style={{ width: 7, height: 7, background: n.color, boxShadow: `0 0 4px ${n.color}` }} />
                  <div>
                    <div style={{ fontSize: 9, color: cap ? n.color : '#3a5a7a', letterSpacing: 1 }}>{n.domain}</div>
                    <div style={{ fontSize: 8, color: cap ? '#00ff41' : 'rgba(0,255,65,.3)' }}>{cap ? 'CAPTURED' : 'SECURE'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Challenge */}
        <div>
          {!activeNode && (
            <div className="panel" style={{ textAlign: 'center', padding: 40 }}>
              <div className="vt-font" style={{ fontSize: 36, color: '#3a5a7a', letterSpacing: 2, marginBottom: 8 }}>SELECT TARGET NODE</div>
              <div style={{ fontSize: 12, color: '#3a5a7a' }}>Click a node on the network map to begin infiltration.</div>
            </div>
          )}
          {activeNode && !isCaptured(activeNode.id) && (
            <CTFChallenge node={activeNode} team={team} onCapture={() => { fetchProgress(); onRefresh(); setActiveNode(null); }} />
          )}
        </div>
      </div>
    </div>
  );
}

function CTFChallenge({ node, team, onCapture }) {
  const [ans, setAns] = useState('');
  const [msg, setMsg] = useState('');
  const [hints, setHints] = useState([]);
  const [captured, setCaptured] = useState(false);
  const [termLines, setTermLines] = useState([
    `> CONNECTING TO ${node.codename}…`,
    `> TARGET: ${node.domain} SERVER`,
    `> CHALLENGE: ${node.challenge}`,
    `> ENTER EXPLOIT PAYLOAD BELOW`,
  ]);

  const addLine = l => setTermLines(p => [...p.slice(-9), l]);

  const revealHint = async (hi) => {
    if (hints.includes(hi)) return;
    const cost = node.hints[hi].cost;
    if ((team?.wallet || 0) < cost) { setMsg('// INSUFFICIENT FUNDS FOR DECRYPTION KEY'); return; }
    try {
      await api.post('/rounds/4/hint', { layer: node.id, hintIndex: hi });
      setHints(h => [...h, hi]);
      addLine(`> DECRYPT KEY ${hi + 1} PURCHASED — ${fmt(cost)} DEDUCTED`);
      setMsg('');
    } catch (err) { setMsg(`// ${String(err)}`); }
  };

  const submit = async () => {
    addLine(`> INJECTING PAYLOAD: "${ans.toUpperCase()}"`);
    try {
      const res = await api.post('/rounds/4/submit', { layer: node.id, answer: ans });
      if (res.correct) {
        addLine('> ✓ AUTHENTICATION BYPASS SUCCESSFUL');
        addLine(`> ✓ FLAG CAPTURED: ${node.flagCode || `FLAG{NODE_${node.id}_PWNED}`}`);
        addLine(`> ✓ SERVER ${node.codename} COMPROMISED`);
        setCaptured(true);
        setTimeout(() => onCapture(), 2500);
      } else {
        addLine('> ✗ PAYLOAD REJECTED — ACCESS DENIED');
        addLine('> ✗ INTRUSION DETECTION TRIGGERED');
        setMsg('// WRONG ANSWER — TRY AGAIN OR BUY A DECRYPTION KEY');
      }
    } catch (err) { setMsg(`// ${String(err)}`); }
  };

  return (
    <div className="anim-fadeIn">
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ width: 10, height: 10, background: node.color, boxShadow: `0 0 6px ${node.color}` }} />
        <div className="head-font" style={{ fontSize: 12, color: node.color, letterSpacing: 2 }}>{node.codename}</div>
        <span className="tag" style={{ borderColor: node.color + '55', color: node.color }}>{node.domain}</span>
        <span className="tag" style={{ borderColor: node.color + '44', color: node.color, fontFamily: '"VT323",monospace', fontSize: 14 }}>{node.challenge}</span>
      </div>

      <div style={{ background: 'rgba(0,0,0,.9)', border: `1px solid ${node.color}33`, padding: 16, fontFamily: '"Share Tech Mono",monospace', fontSize: 12, color: '#00ff41', lineHeight: 1.9, whiteSpace: 'pre-wrap', marginBottom: 10 }}>
        {node.brief}
      </div>

      {/* Terminal */}
      <div style={{ background: '#000', border: `1px solid ${captured ? '#00ff41' : 'rgba(0,255,65,.15)'}`, padding: 12, fontFamily: '"VT323",monospace', fontSize: 16, marginBottom: 10, minHeight: 100, transition: 'border .3s' }}>
        {termLines.map((l, i) => (
          <div key={i} style={{ color: l.startsWith('> ✓') ? '#00ff41' : l.startsWith('> ✗') ? '#ff0030' : l.startsWith('> INJECT') ? '#ffd700' : '#3a5a7a', marginBottom: 1 }}>{l}</div>
        ))}
        {captured && (
          <div style={{ marginTop: 8, padding: 8, background: 'rgba(0,40,0,.8)', border: '1px solid #00ff41', textAlign: 'center' }}>
            <div className="head-font" style={{ fontSize: 12, color: '#00ff41', letterSpacing: 3 }}>FLAG CAPTURED ✓</div>
          </div>
        )}
        <span className="anim-blink" style={{ color: '#00ff41' }}>█</span>
      </div>

      {/* Hints */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: '#3a5a7a', letterSpacing: 2, marginBottom: 6 }}>DECRYPTION KEYS:</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {node.hints.map((h, hi) => (
            <div key={hi} style={{ flex: 1, minWidth: 160, background: 'rgba(0,5,0,.8)', border: `1px solid ${hints.includes(hi) ? node.color + '55' : 'rgba(0,255,65,.15)'}`, padding: 10, transition: 'all .2s' }}>
              {hints.includes(hi)
                ? <div style={{ fontSize: 12, color: node.color, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{h.text}</div>
                : <button className="btn-g" style={{ width: '100%', fontSize: 10, padding: '7px 10px' }} onClick={() => revealHint(hi)}>
                    <span>KEY {hi + 1} — {fmt(h.cost)}</span>
                  </button>
              }
            </div>
          ))}
        </div>
      </div>

      {!captured && (
        <div>
          {msg && <div style={{ fontFamily: '"VT323",monospace', color: '#ff0030', fontSize: 16, marginBottom: 8 }}>{msg}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="inp" style={{ flex: 1, borderColor: `${node.color}55`, color: '#00ff41', fontSize: 14 }}
              placeholder="ENTER EXPLOIT PAYLOAD…"
              value={ans} onChange={e => { setAns(e.target.value); setMsg(''); }} onKeyDown={e => e.key === 'Enter' && submit()} />
            <button className="btn-g" style={{ padding: '12px 18px' }} onClick={submit}><span>INJECT →</span></button>
          </div>
        </div>
      )}
    </div>
  );
}
