import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Panel, PanelC, PanelY, BtnG, BtnY, BtnR, Timer } from '../UI';
import api from '../../utils/api';
import { fmt } from '../../utils/helpers';

// ── JR4 ─────────────────────────────────────────────────────
export default function JR4({ teams, roundState, onRefresh }) {
  const setTimer = async (secs) => {
    try { await api.post('/rounds/control', { action: 'set_timer', durationSeconds: secs }); toast.success('Timer set'); }
    catch (err) { toast.error(String(err)); }
  };
  const clearTimer = async () => {
    try { await api.post('/rounds/control', { action: 'clear_timer' }); toast.success('Timer cleared'); }
    catch (err) { toast.error(String(err)); }
  };
  const grantReward = async (teamId, teamName) => {
    try { await api.post('/rounds/4/reward', { teamId }); toast.success(`Reward granted to ${teamName}`); onRefresh(); }
    catch (err) { toast.error(String(err)); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, maxWidth: 1000 }}>
      <PanelC className="anim-fadeIn" style={{ padding: 20 }}>
        <div style={{ fontSize: 11, color: '#00f5ff', letterSpacing: 2, marginBottom: 12 }}>$ GAUNTLET TIMER</div>
        {roundState.timerEndsAt
          ? (
            <div>
              <Timer endsAt={roundState.timerEndsAt} large />
              <div style={{ height: 6, background: 'rgba(0,255,65,.1)', marginTop: 12, marginBottom: 16 }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg,#00cc33,#00ff41)' }} />
              </div>
              <BtnR onClick={clearTimer} className="w-full"><span>STOP / RESET</span></BtnR>
            </div>
          )
          : <BtnG onClick={() => setTimer(25 * 60)} style={{ width: '100%', padding: 14 }}><span>▶ START 25-MIN GAUNTLET</span></BtnG>
        }
      </PanelC>

      <Panel className="anim-fadeIn" style={{ padding: 20 }}>
        <div style={{ fontSize: 11, color: '#00ff41', letterSpacing: 2, marginBottom: 12 }}>$ TEAM PROGRESS</div>
        {teams.length === 0 && <div style={{ color: '#3a5a7a' }}>No teams yet.</div>}
        {teams.map(t => {
          const flags = t.r4_captured || [];
          const flagCount = Array.isArray(flags) ? flags.length : 0;
          return (
            <div key={t.id} style={{ background: 'rgba(0,10,0,.5)', border: '1px solid rgba(0,255,65,.15)', padding: 12, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <div>
                  <div className="head-font" style={{ fontSize: 12, marginBottom: 6 }}>{t.name}</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4,5].map(n => (
                      <div key={n} style={{ width: 22, height: 22, background: flags.includes?.(n) || flags.includes?.(String(n)) ? '#00ff41' : 'rgba(0,255,65,.1)', border: `1px solid rgba(0,255,65,${flags.includes?.(n) ? '.7' : '.2'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: flags.includes?.(n) ? '#000' : '#3a5a7a' }}>
                        {flags.includes?.(n) || flags.includes?.(String(n)) ? '⚑' : n}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: '#3a5a7a', marginTop: 6 }}>{flagCount}/5 flags · Wallet: {fmt(t.wallet || 0)}</div>
                </div>
                {flagCount >= 5 && !t.r4_done
                  ? <BtnG onClick={() => grantReward(t.id, t.name)} style={{ padding: '6px 14px', fontSize: 11 }}><span>GRANT REWARD</span></BtnG>
                  : t.r4_done ? <span className="tag tag-g">REWARDED ✓</span>
                  : null
                }
              </div>
            </div>
          );
        })}
      </Panel>
    </div>
  );
}

// ── JR5 ─────────────────────────────────────────────────────
export function JR5({ teams, onRefresh }) {
  const [sel, setSel] = useState('');
  const [form, setForm] = useState({ investment: '', product: '', tech: '', market: '', presentation: '' });

  const invest = async () => {
    if (!sel || !form.investment) return;
    try {
      await api.post('/rounds/5/invest', {
        teamId: sel, investment: +form.investment,
        productScore: +form.product || 0, techScore: +form.tech || 0,
        marketScore: +form.market || 0, presentationScore: +form.presentation || 0,
      });
      toast.success('Investment applied');
      onRefresh(); setForm({ investment: '', product: '', tech: '', market: '', presentation: '' });
    } catch (err) { toast.error(String(err)); }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <PanelY className="anim-fadeIn" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#ffd700', letterSpacing: 2, marginBottom: 12 }}>$ FINAL VC INVESTMENT & SCORING</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: '#ffd700', letterSpacing: 2, marginBottom: 6 }}>SELECT TEAM</div>
            <select className="inp inp-y" value={sel} onChange={e => setSel(e.target.value)}>
              <option value="">— Choose team —</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#ffd700', letterSpacing: 2, marginBottom: 6 }}>INVESTMENT AMOUNT (₢)</div>
            <input className="inp inp-y" type="number" placeholder="e.g. 500" value={form.investment} onChange={e => setForm(f => ({ ...f, investment: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 }}>
          {[['PRODUCT MATCH (30%)', 'product'], ['TECH EXECUTION (30%)', 'tech'], ['MARKET IMPACT (25%)', 'market'], ['PRESENTATION (15%)', 'presentation']].map(([l, k]) => (
            <div key={k}>
              <div style={{ fontSize: 9, color: '#3a5a7a', letterSpacing: 1, marginBottom: 4 }}>{l}</div>
              <input className="inp inp-y" type="number" min="0" max="100" placeholder="0–100" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} style={{ padding: '8px 10px', fontSize: 13 }} />
            </div>
          ))}
        </div>
        <BtnY onClick={invest}><span>[ APPLY INVESTMENT & SCORES ]</span></BtnY>
      </PanelY>

      <div style={{ fontSize: 11, color: '#3a5a7a', letterSpacing: 2, marginBottom: 12 }}>CURRENT NET WORTH STANDINGS</div>
      {teams.map((t, i) => (
        <div key={t.id} className="panel anim-slideIn" style={{ animationDelay: `${i * 0.05}s`, marginBottom: 8, padding: '12px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="head-font" style={{ fontSize: 13, color: '#a0d0a0' }}>
                {['🥇','🥈','🥉'][i] || `#${i+1}`} {t.name}
              </div>
              <div style={{ fontSize: 10, color: '#3a5a7a', marginTop: 4 }}>
                Wallet {fmt(t.wallet)} + VC {fmt(t.final_investment || 0)} − Loans {fmt(t.loans || 0)}
              </div>
            </div>
            <div className="wallet-num" style={{ fontSize: 24, color: '#ffd700' }}>{fmt(t.net_worth || t.wallet)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
