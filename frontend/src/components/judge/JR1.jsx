// ── JR1 ─────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Panel, PanelC, PanelY, BtnG, BtnY } from '../UI';
import api from '../../utils/api';
import { fmt } from '../../utils/helpers';

export function JR1({ teams, onRefresh }) {
  const [obituaries, setObituaries] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [investAmounts, setInvestAmounts] = useState({});

  useEffect(() => { fetchAll(); }, []);
  const fetchAll = async () => {
    try {
      const [obs, subs] = await Promise.all([api.get('/rounds/1/obituaries'), api.get('/rounds/1/submissions')]);
      setObituaries(obs); setSubmissions(subs);
    } catch (err) { toast.error(String(err)); }
  };

  const assign = async (teamId, obituaryId) => {
    try { await api.post('/rounds/1/assign', { teamId, obituaryId }); toast.success('Obituary assigned'); fetchAll(); }
    catch (err) { toast.error(String(err)); }
  };

  const award = async (teamId, teamName) => {
    const coins = investAmounts[teamId] || '';
    if (!coins || isNaN(+coins)) { toast.error('Enter amount first'); return; }
    try {
      const res = await api.post('/rounds/1/award', { teamId, coins: +coins });
      toast.success(`Code for ${teamName}: ${res.code} (${fmt(res.coins)})`);
      fetchAll();
    } catch (err) { toast.error(String(err)); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 1100 }}>
      {/* Assign obituaries */}
      <PanelC className="anim-fadeIn">
        <div style={{ fontSize: 11, color: '#00f5ff', letterSpacing: 2, marginBottom: 12 }}>$ ASSIGN OBITUARIES</div>
        {teams.map(t => {
          const sub = submissions.find(s => s.team_id === t.id);
          return (
            <div key={t.id} style={{ background: 'rgba(0,5,10,.6)', border: '1px solid rgba(0,245,255,.15)', padding: 12, marginBottom: 8 }}>
              <div style={{ fontFamily: '"Orbitron",monospace', fontSize: 12, color: '#a0d0a0', marginBottom: 8 }}>{t.name}</div>
              {sub?.obituary_title
                ? <span className="tag tag-c">{sub.obituary_title}</span>
                : (
                  <select className="inp" style={{ borderColor: 'rgba(0,245,255,.3)', color: '#00f5ff', fontSize: 12, marginBottom: 6 }}
                    defaultValue="" onChange={e => e.target.value && assign(t.id, e.target.value)}>
                    <option value="">— Select startup —</option>
                    {obituaries.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
                  </select>
                )
              }
            </div>
          );
        })}
      </PanelC>

      {/* Submissions + investment */}
      <Panel className="anim-fadeIn">
        <div style={{ fontSize: 11, color: '#00ff41', letterSpacing: 2, marginBottom: 12 }}>$ PITCH SUBMISSIONS & INVESTMENT</div>
        {submissions.length === 0 && <div style={{ color: '#3a5a7a' }}>No submissions yet.</div>}
        {submissions.map(s => (
          <div key={s.team_id} style={{ background: 'rgba(0,10,0,.6)', border: '1px solid rgba(0,255,65,.15)', padding: 14, marginBottom: 10 }}>
            <div style={{ fontFamily: '"Orbitron",monospace', fontSize: 12, color: '#00ff41', marginBottom: 6 }}>{s.team_name}</div>
            {s.company_name && <div style={{ fontSize: 12, color: '#a0d0a0', marginBottom: 4 }}>🚀 {s.company_name} — "{s.tagline}"</div>}
            {s.feasibility_signal && <div style={{ fontSize: 11, color: '#3a5a7a' }}>Signal: {s.feasibility_signal}</div>}
            <div style={{ fontSize: 11, color: '#3a5a7a', marginBottom: 10 }}>Bet: {s.valuation_bet ? fmt(s.valuation_bet) : '—'} · Awarded: {s.coins_awarded ? fmt(s.coins_awarded) : '—'}</div>
            {!s.is_locked && (
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="inp" type="number" placeholder="₢ amount" style={{ flex: 1 }}
                  value={investAmounts[s.team_id] || ''}
                  onChange={e => setInvestAmounts(a => ({ ...a, [s.team_id]: e.target.value }))} />
                <BtnG onClick={() => award(s.team_id, s.team_name)}>AWARD</BtnG>
              </div>
            )}
            {s.is_locked && <span className="tag tag-g">LOCKED ✓</span>}
          </div>
        ))}
      </Panel>
    </div>
  );
}

// ── JR2 ─────────────────────────────────────────────────────
export function JR2({ teams, onRefresh }) {
  const awardTokens = async (teamId, teamName, n, tier) => {
    try {
      await api.post('/rounds/2/tokens', { teamId, tokens: n, tier });
      toast.success(`+${n} token(s) → ${teamName}`);
      onRefresh();
    } catch (err) { toast.error(String(err)); }
  };

  return (
    <PanelY className="anim-fadeIn">
      <div style={{ fontSize: 11, color: '#ffd700', letterSpacing: 2, marginBottom: 4 }}>$ TOKEN & WALLET MANAGER</div>
      <div style={{ fontSize: 12, color: '#3a5a7a', marginBottom: 16 }}>Teams WITH tokens get base prices. WITHOUT tokens pay 2×. Award tokens after challenge completion.</div>
      {teams.length === 0 && <div style={{ color: '#3a5a7a' }}>No teams yet.</div>}
      {teams.map(t => (
        <div key={t.id} style={{ background: 'rgba(10,8,0,.7)', border: '1px solid rgba(255,215,0,.2)', padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <div>
              <div className="head-font" style={{ fontSize: 13, color: '#ffd700', marginBottom: 4 }}>{t.name}</div>
              <div style={{ fontSize: 11, color: '#3a5a7a' }}>Wallet: {fmt(t.wallet)} · Tokens: <span style={{ color: '#ffd700' }}>⬡{t.tokens || 0}</span></div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[['easy', 1], ['medium', 2], ['hard', 3]].map(([tier, n]) => (
                <button key={tier} className="btn-y" style={{ padding: '6px 12px', fontSize: 10 }} onClick={() => awardTokens(t.id, t.name, n, tier)}>
                  <span>{tier.toUpperCase()} +{n}⬡</span>
                </button>
              ))}
              <button className="btn-g" style={{ padding: '6px 12px', fontSize: 10 }} onClick={async () => {
                const n = prompt(`Bonus coins for ${t.name}:`);
                if (!n || isNaN(+n)) return;
                await api.patch(`/teams/${t.id}/wallet`, { amount: +n, type: 'task', description: 'Round 2 bonus' });
                toast.success('Coins added'); onRefresh();
              }}>
                <span>+₢</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </PanelY>
  );
}

// ── JR3 ─────────────────────────────────────────────────────
export function JR3({ teams, onRefresh }) {
  const talentShow = async (teamId, teamName) => {
    const self = parseInt(prompt(`${teamName} self-rating (1–10):`));
    if (isNaN(self)) return;
    const judge = parseInt(prompt(`Your judge score for ${teamName} (1–10):`));
    if (isNaN(judge)) return;
    try {
      const res = await api.post('/rounds/3/talent', { teamId, selfRating: self, judgeScore: judge });
      toast.success(res.isMatch ? `MATCH! +₢800 cash injection` : `MISMATCH! ₢500 loan penalty`);
      onRefresh();
    } catch (err) { toast.error(String(err)); }
  };

  return (
    <div>
      <div className="panel-r anim-fadeIn" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#ff0030', letterSpacing: 2, marginBottom: 4 }}>$ SYNTAX TOLL MONITOR</div>
        <div style={{ fontSize: 12, color: '#3a5a7a', marginBottom: 16 }}>Wallet deductions happen automatically on player interfaces as they use syntax. Monitor balances here.</div>
        {teams.map(t => (
          <div key={t.id} style={{ background: 'rgba(10,0,0,.7)', border: '1px solid rgba(255,0,48,.2)', padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <div>
                <div className="head-font" style={{ fontSize: 13, color: '#ff0030', marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: '#3a5a7a' }}>
                  Wallet: <span style={{ color: (t.wallet || 0) <= 0 ? '#ff0030' : '#00ff41', fontWeight: 700 }}>{fmt(t.wallet || 0)}</span>
                  {t.loans > 0 && <span style={{ color: '#ff0030', marginLeft: 8 }}>Loans: {fmt(t.loans)}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn-r" style={{ padding: '6px 12px', fontSize: 11 }}
                  onClick={async () => {
                    const n = prompt(`Loan for ${t.name}:`);
                    if (!n || isNaN(+n)) return;
                    await api.patch(`/teams/${t.id}/loan`, { amount: +n });
                    toast.success('Loan added'); onRefresh();
                  }}><span>ADD LOAN</span></button>
                <button className="btn-g" style={{ padding: '6px 12px', fontSize: 11 }} onClick={() => talentShow(t.id, t.name)}>
                  <span>TALENT SHOW</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JR1;
