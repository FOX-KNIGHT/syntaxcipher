// ── PR1 ─────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Panel, PanelC, PanelY, BtnG, BtnY } from '../UI';
import api from '../../utils/api';
import { fmt } from '../../utils/helpers';

export function PR1({ team, onRefresh }) {
  const [pitch, setPitch] = useState(null);
  const [form, setForm] = useState({ rootCause: '', companyName: '', tagline: '', pivot: '', targetMarket: '', marketingHook: '', feasibilitySignal: '', valuationBet: '' });
  const [submitted, setSubmitted] = useState(false);
  const [claimCode, setClaimCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchPitch(); }, []);

  const fetchPitch = async () => {
    try { const d = await api.get('/rounds/1/my'); if (d) { setPitch(d); if (d.company_name) setSubmitted(true); } }
    catch {}
  };

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.companyName || !form.tagline) { toast.error('Company name and tagline are required'); return; }
    setLoading(true);
    try {
      await api.post('/rounds/1/submit', { ...form, valuationBet: +form.valuationBet || 0 });
      toast.success('Pitch submitted!');
      setSubmitted(true); fetchPitch();
    } catch (err) { toast.error(String(err)); }
    finally { setLoading(false); }
  };

  const claimCoins = async () => {
    const n = parseInt(claimCode);
    if (isNaN(n) || n <= 0) { toast.error('Enter your investment coins amount from judge'); return; }
    setLoading(true);
    try {
      await api.post('/rounds/1/claim', { coins: n });
      toast.success(`${fmt(n)} credited to your wallet!`);
      setClaimCode(''); onRefresh();
    } catch (err) { toast.error(String(err)); }
    finally { setLoading(false); }
  };

  return (
    <div className="anim-fadeIn">
      <div className="panel-c" style={{ padding: 20, marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: '#00f5ff', letterSpacing: 3, marginBottom: 8 }}>// ROUND 1 — DEAD STARTUP RESURRECTION</div>
        <div style={{ fontSize: 12, color: '#3a5a7a', lineHeight: 1.9, marginBottom: 14 }}>Read your sealed startup obituary. Diagnose the failure. Redesign it into a winning product. Pitch to judges in 90 minutes.</div>
        {pitch && (
          <div style={{ background: 'rgba(0,5,10,.8)', border: '1px solid rgba(0,245,255,.2)', padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: '#00f5ff', letterSpacing: 2, marginBottom: 8 }}>YOUR STARTUP OBITUARY</div>
            <div style={{ fontFamily: '"Orbitron",monospace', fontSize: 14, color: '#00f5ff', marginBottom: 6 }}>{pitch.title}</div>
            <div style={{ fontSize: 12, color: '#3a5a7a', lineHeight: 1.8 }}>{pitch.description}</div>
            {pitch.phoenix_elements && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 10, color: '#00f5ff', letterSpacing: 2, marginBottom: 4 }}>PHOENIX ELEMENTS:</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {pitch.phoenix_elements.map(e => <span key={e} className="tag tag-c">{e}</span>)}
                </div>
              </div>
            )}
          </div>
        )}
        {!pitch && <div style={{ color: '#3a5a7a', fontFamily: '"VT323",monospace', fontSize: 20 }}>Waiting for judge to assign your startup obituary…</div>}
      </div>

      {pitch && !submitted && (
        <div className="panel-y" style={{ padding: 20, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: '#ffd700', letterSpacing: 2, marginBottom: 14 }}>$ PHOENIX PITCH</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[['Company Name', 'companyName'], ['Tagline', 'tagline'], ['The Pivot', 'pivot'], ['Target Market', 'targetMarket'], ['Marketing Hook', 'marketingHook'], ['Feasibility Signal', 'feasibilitySignal']].map(([l, k]) => (
              <div key={k}>
                <div style={{ fontSize: 10, color: '#ffd700', letterSpacing: 2, marginBottom: 5 }}>{l.toUpperCase()}</div>
                <input className="inp inp-y" placeholder={l} value={form[k]} onChange={update(k)} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 10, color: '#ffd700', letterSpacing: 2, marginBottom: 5 }}>ROOT CAUSE OF ORIGINAL FAILURE</div>
            <textarea className="inp inp-y" rows={3} placeholder="What killed the original startup?" value={form.rootCause} onChange={update('rootCause')} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ marginTop: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: '#bf00ff', letterSpacing: 2, marginBottom: 5 }}>🎲 VALUATION BET (predict judge investment)</div>
            <input className="inp" style={{ borderColor: 'rgba(191,0,255,.4)', color: '#bf00ff' }} type="number" placeholder="Your coin prediction" value={form.valuationBet} onChange={update('valuationBet')} />
          </div>
          <BtnY onClick={submit} disabled={loading}><span>{loading ? 'SUBMITTING…' : '[ SUBMIT PITCH ]'}</span></BtnY>
        </div>
      )}

      {submitted && <div style={{ marginBottom: 12 }}><span className="tag tag-g">✓ PITCH SUBMITTED</span></div>}

      <div className="panel" style={{ padding: 20 }}>
        <div style={{ fontSize: 11, color: '#00ff41', letterSpacing: 2, marginBottom: 8 }}>💰 CLAIM INVESTMENT COINS</div>
        <div style={{ fontSize: 12, color: '#3a5a7a', marginBottom: 10 }}>After your pitch the judge awards coins. Enter the amount they tell you.</div>
        {(team?.wallet || 0) > 0 && <div style={{ marginBottom: 12 }}><span className="tag tag-g">Wallet: {fmt(team.wallet)}</span></div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="inp" type="number" placeholder="Coin amount from judge" style={{ flex: 1 }} value={claimCode} onChange={e => setClaimCode(e.target.value)} />
          <BtnG onClick={claimCoins} disabled={loading}><span>CLAIM ₢</span></BtnG>
        </div>
      </div>
    </div>
  );
}

// ── PR2 ─────────────────────────────────────────────────────
export function PR2({ team, onRefresh }) {
  const [items, setItems] = useState([]);
  const [owned, setOwned] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => { fetchAll(); }, []);
  const fetchAll = async () => {
    try {
      const [all, mine] = await Promise.all([api.get('/market/items'), api.get('/market/my-items')]);
      setItems(all); setOwned(mine.map(m => m.item_id));
    } catch (err) { toast.error(String(err)); }
  };

  const buy = async (item) => {
    setLoading(true); setMsg(null);
    try {
      const res = await api.post('/market/buy', { itemId: item.id });
      setMsg({ ok: true, text: `✓ PURCHASED: ${item.name.toUpperCase()}` });
      toast.success(res.item); fetchAll(); onRefresh();
    } catch (err) {
      setMsg({ ok: false, text: `✗ ${String(err)}` }); toast.error(String(err));
    } finally { setLoading(false); }
  };

  const hasToken = (team?.tokens || 0) > 0;

  return (
    <div className="anim-fadeIn">
      <div className="panel-y" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: '#ffd700', letterSpacing: 3, marginBottom: 4 }}>// ROUND 2 — RESOURCE MARKET</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="wallet-num" style={{ color: '#ffd700' }}>{fmt(team?.wallet)}</span>
              <span>Tokens: <b style={{ color: '#ffd700' }}>⬡{team?.tokens || 0}</b></span>
              <span className={`tag ${hasToken ? 'tag-g' : 'tag-r'}`}>{hasToken ? 'DISCOUNT ACTIVE' : 'NO TOKEN — 2× PRICES'}</span>
            </div>
          </div>
        </div>

        {msg && (
          <div style={{ fontFamily: '"VT323",monospace', fontSize: 18, color: msg.ok ? '#00ff41' : '#ff0030', borderLeft: `3px solid ${msg.ok ? '#00ff41' : '#ff0030'}`, paddingLeft: 12, marginBottom: 12 }}>
            {msg.text}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 10 }}>
          {items.map(item => {
            const price = hasToken ? item.price : item.price * 2;
            const got = owned.includes(item.id);
            const canBuy = (team?.wallet || 0) >= price && !got && !loading;
            return (
              <div key={item.id} style={{ background: got ? 'rgba(0,20,0,.8)' : 'rgba(0,5,0,.8)', border: `1px solid ${got ? 'rgba(0,255,65,.5)' : 'rgba(255,215,0,.2)'}`, padding: 14, position: 'relative' }}>
                {got && <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 16, color: '#00ff41' }}>✓</div>}
                <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
                <div className="head-font" style={{ fontSize: 11, color: got ? '#00ff41' : '#ffd700', marginBottom: 4 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: '#3a5a7a', lineHeight: 1.5, marginBottom: 10 }}>{item.description}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="wallet-num" style={{ fontSize: 14, color: canBuy ? '#ffd700' : '#3a5a7a' }}>
                    {fmt(price)}{!hasToken && <span style={{ fontSize: 9, marginLeft: 4 }}>(2×)</span>}
                  </div>
                  {!got && (
                    <button className={canBuy ? 'btn-y' : 'btn-r'} style={{ padding: '5px 12px', fontSize: 10 }} disabled={!canBuy} onClick={() => buy(item)}>
                      <span>{canBuy ? 'BUY' : '—'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PR1;
