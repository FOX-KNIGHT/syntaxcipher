import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Panel, PanelR, BtnG, BtnR, FullOverlay } from '../UI';
import api from '../../utils/api';
import { fmt, fmtTime } from '../../utils/helpers';

const SYNTAX_COSTS = { forLoop: 80, whileLoop: 80, ifBlock: 50, arith: 30, cmp: 30 };

function parseSyntax(code) {
  return {
    forLoop:   (code.match(/\bfor\b/g) || []).length,
    whileLoop: (code.match(/\bwhile\b/g) || []).length,
    ifBlock:   (code.match(/\b(if|else|elif)\b/g) || []).length,
    arith:     (code.match(/[+\-*\/]/g) || []).length,
    cmp:       (code.match(/(===|!==|==|!=|>=|<=|>(?!=)|<(?!=))/g) || []).length,
  };
}
const syntaxTotal = (s) => s.forLoop*80 + s.whileLoop*80 + s.ifBlock*50 + s.arith*30 + s.cmp*30;

export default function PR3({ team, onRefresh }) {
  const [code, setCode] = useState('');
  const [secs, setSecs] = useState(20 * 60);
  const [over, setOver] = useState(false);
  const [ops, setOps] = useState([]);          // local op log
  const timerRef = useRef(); const debRef = useRef(); const prevDebt = useRef(0);

  useEffect(() => {
    timerRef.current = setInterval(() => setSecs(s => {
      if (s <= 1) { clearInterval(timerRef.current); setOver(true); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleSyntaxAction = useCallback(async (opType) => {
    try {
      const res = await api.post('/rounds/3/action', { operationType: opType });
      if (!res.shielded) {
        setOps(o => [...o.slice(-14), { type: opType, cost: res.cost, time: new Date().toLocaleTimeString() }]);
        onRefresh();
      } else {
        toast.success('🛡️ SHIELD ACTIVE — No deduction');
      }
    } catch (err) { toast.error(String(err)); }
  }, []);

  const handleUndo = async () => {
    try {
      const res = await api.post('/rounds/3/undo');
      toast.success(`Refunded: ${fmt(res.refund)}`);
      setOps(o => o.slice(0, -1)); onRefresh();
    } catch (err) { toast.error(String(err)); }
  };

  const counts = parseSyntax(code);
  const curDebt = syntaxTotal(counts);
  const critical = secs < 120;

  if (over) return <FullOverlay icon="⌛" title="TIMEOUT" sub="Round 3 ended. Final syntax debt charged." color="#ff0030" />;

  return (
    <div className="anim-fadeIn">
      <div className="panel-r" style={{ padding: 20 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: '#ff0030', letterSpacing: 3 }}>// ROUND 3 — SYNTAX TOLL</div>
          <div className="wallet-num" style={{ fontSize: 32, color: critical ? '#ff0030' : '#ffd700', textShadow: `0 0 16px ${critical ? '#ff0030' : '#ffd700'}`, fontVariantNumeric: 'tabular-nums' }}>
            {fmtTime(secs)}
          </div>
        </div>

        {team?.shield_active && (
          <div style={{ background: 'rgba(0,10,20,.8)', border: '1px solid rgba(0,245,255,.3)', padding: 8, marginBottom: 10, fontSize: 12, color: '#00f5ff', letterSpacing: 1 }}>
            🛡️ SYNTAX SHIELD ACTIVE — DEDUCTIONS SUSPENDED
          </div>
        )}

        {/* Cost reference */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 14 }}>
          {[['for loop', 'forLoop', 80], ['while loop', 'whileLoop', 80], ['if/elif/else', 'ifBlock', 50], ['+ − * /', 'arith', 30], ['== != > < ≥ ≤', 'cmp', 30], ['TOTAL DEBT', 'total', null]].map(([l, k, cost]) => (
            <div key={k} style={{ background: 'rgba(0,0,0,.6)', border: `1px solid ${k !== 'total' && counts[k] > 0 ? '#ff0030' : 'rgba(255,0,48,.2)'}`, padding: '8px 10px' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,0,48,.7)', letterSpacing: 1 }}>{l}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                <div style={{ color: '#ff0030', fontWeight: 700, fontSize: 13 }}>{k === 'total' ? fmt(curDebt) : `−₢${cost}`}</div>
                {k !== 'total' && counts[k] > 0 && <span className="tag tag-r">{counts[k]}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Problem */}
        <div style={{ background: 'rgba(0,0,0,.85)', border: '1px solid rgba(0,255,65,.15)', padding: 16, fontFamily: '"Share Tech Mono",monospace', fontSize: 12, color: '#86efac', lineHeight: 1.9, whiteSpace: 'pre-wrap', marginBottom: 14 }}>
{`CHALLENGE: Write a function that:
  1. Takes a list of integers
  2. Returns sum of all EVEN numbers
  3. If sum > 100 → return "Jackpot"
  4. Otherwise   → return the sum

EXAMPLES:
  [2,5,8,11,4]     → 14         (2+8+4)
  [40,30,50,7,3]   → "Jackpot"  (sum=120 > 100)
  [1,3,7,9]        → 0          (no even numbers)

⚠ SYNTAX TOLL: every construct costs coins — delete to refund.`}
        </div>

        {/* Syntax action buttons */}
        <div style={{ fontSize: 10, color: '#3a5a7a', letterSpacing: 2, marginBottom: 8 }}>USE SYNTAX ELEMENTS (each press deducts coins):</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {[['FOR LOOP', 'forLoop', 80], ['WHILE', 'whileLoop', 80], ['IF/ELSE', 'ifBlock', 50], ['ARITHMETIC', 'arith', 30], ['COMPARE', 'cmp', 30]].map(([l, k, c]) => (
            <button key={k} className="btn-r" style={{ padding: '8px 14px', fontSize: 11 }} onClick={() => handleSyntaxAction(k)}>
              <span>{l} (−₢{c})</span>
            </button>
          ))}
          <button className="btn-g" style={{ padding: '8px 14px', fontSize: 11 }} onClick={handleUndo}>
            <span>↩ UNDO (REFUND)</span>
          </button>
        </div>

        {/* Code editor */}
        <div style={{ fontSize: 10, color: '#3a5a7a', letterSpacing: 2, marginBottom: 6 }}>YOUR SOLUTION:</div>
        <textarea className="inp" style={{ minHeight: 180, resize: 'vertical', fontSize: 13, lineHeight: 1.7, fontFamily: '"Share Tech Mono",monospace' }}
          value={code} onChange={e => setCode(e.target.value)} placeholder="# Write your solution here…" spellCheck={false} />

        {/* Help buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button className="btn-r" style={{ padding: '8px 16px', fontSize: 11 }} onClick={() => handleSyntaxAction('hint')}><span>REQUEST HINT (−₢200)</span></button>
          <button className="btn-r" style={{ padding: '8px 16px', fontSize: 11, opacity: .6 }} onClick={() => handleSyntaxAction('solution')}><span>DIRECT SOLUTION (−₢500)</span></button>
        </div>

        {/* Live operation log */}
        {ops.length > 0 && (
          <div style={{ marginTop: 14, background: 'rgba(0,0,0,.8)', border: '1px solid rgba(255,0,48,.15)', padding: 12 }}>
            <div style={{ fontSize: 10, color: '#3a5a7a', letterSpacing: 2, marginBottom: 6 }}>DEDUCTION LOG</div>
            {ops.slice().reverse().map((o, i) => (
              <div key={i} style={{ fontFamily: '"VT323",monospace', fontSize: 15, color: '#ff0030', marginBottom: 2 }}>
                [{o.time}] {o.type.toUpperCase()} → −₢{o.cost}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
