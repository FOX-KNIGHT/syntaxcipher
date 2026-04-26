import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Panel, PanelY, PanelR, PanelC, BtnG, BtnY, BtnR, Tag, Timer, Ticker, Medal, Loading } from '../components/UI';
import { ROUND_NAMES, fmt } from '../utils/helpers';
import api from '../utils/api';
import JR1 from '../components/judge/JR1';
import JR2 from '../components/judge/JR2';
import JR3 from '../components/judge/JR3';
import JR4 from '../components/judge/JR4';
import JR5 from '../components/judge/JR5';

export default function JudgePanel() {
  const { token, role, logout } = useAuth();
  const { roundState, leaderboard } = useSocket();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  useEffect(() => {
    if (!token || role !== 'judge') { navigate('/login'); return; }
    fetchTeams();
  }, [token]);

  const fetchTeams = async () => {
    setLoadingTeams(true);
    try { setTeams(await api.get('/teams')); }
    catch (err) { toast.error(String(err)); }
    finally { setLoadingTeams(false); }
  };

  const setRound = async (r, durationSeconds) => {
    try {
      await api.post('/rounds/control', { action: 'set_round', round: r, durationSeconds });
      toast.success(`Round ${r} started`);
    } catch (err) { toast.error(String(err)); }
  };

  const announce = async (msg) => {
    if (!msg) return;
    try { await api.post('/rounds/control', { action: 'announce', announcement: msg }); toast.success('Announcement sent'); }
    catch (err) { toast.error(String(err)); }
  };

  const TABS = [
    { id: 'overview', l: 'OVERVIEW' },
    { id: 'r1', l: 'ROUND 1' },
    { id: 'r2', l: 'ROUND 2' },
    { id: 'r3', l: 'ROUND 3' },
    { id: 'r4', l: 'ROUND 4' },
    { id: 'r5', l: 'ROUND 5' },
  ];

  const cr = roundState.currentRound;

  return (
    <div style={{ minHeight: '100vh', background: '#000a00', color: '#00ff41', fontFamily: '"Share Tech Mono",monospace' }}>
      {/* Top bar */}
      <div style={{ background: 'rgba(0,5,0,.97)', borderBottom: '1px solid rgba(0,255,65,.25)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 200, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="head-font" style={{ fontSize: 16, fontWeight: 700, color: '#00ff41', textShadow: '0 0 12px #00ff41' }}>⚡ SYNTAXCIPHER</div>
          <span className="tag tag-g">JUDGE CONTROL</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, color: '#3a5a7a', letterSpacing: 2 }}>ROUND:</span>
          {[0,1,2,3,4,5].map(r => (
            <button key={r} onClick={() => setRound(r, [0,5400,1800,1200,1500,1800][r])}
              style={{ background: cr === r ? '#00ff41' : 'transparent', color: cr === r ? '#000' : '#3a5a7a', border: `1px solid ${cr === r ? '#00ff41' : 'rgba(0,255,65,.2)'}`, padding: '5px 12px', cursor: 'pointer', fontFamily: '"Share Tech Mono",monospace', fontSize: 11, letterSpacing: 1, transition: 'all .2s' }}>
              {r === 0 ? 'WAIT' : `R${r}`}
            </button>
          ))}
          {roundState.timerEndsAt && <div style={{ marginLeft: 8 }}><Timer endsAt={roundState.timerEndsAt} /></div>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn-r" style={{ padding: '6px 14px', fontSize: 11 }} onClick={() => { const m = prompt('Announcement:'); announce(m); }}><span>ANNOUNCE</span></button>
          <button className="btn-r" style={{ padding: '6px 14px', fontSize: 11 }} onClick={() => { logout(); navigate('/login'); }}><span>LOGOUT</span></button>
        </div>
      </div>

      <Ticker teams={teams} />

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid rgba(0,255,65,.15)', padding: '0 24px', display: 'flex', gap: 0, overflowX: 'auto', background: 'rgba(0,5,0,.7)', position: 'sticky', top: 56, zIndex: 100 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.id ? '#00ff41' : 'transparent'}`, color: tab === t.id ? '#00ff41' : '#3a5a7a', padding: '10px 18px', cursor: 'pointer', fontFamily: '"Share Tech Mono",monospace', fontSize: 11, letterSpacing: 2, transition: 'all .2s', whiteSpace: 'nowrap' }}>
            {t.l}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px 24px', maxWidth: 1200, margin: '0 auto' }}>
        {loadingTeams && tab !== 'overview' ? <Loading /> : (
          <>
            {tab === 'overview' && <JOverview teams={teams} leaderboard={leaderboard} roundState={roundState} onRefresh={fetchTeams} />}
            {tab === 'r1' && <JR1 teams={teams} onRefresh={fetchTeams} />}
            {tab === 'r2' && <JR2 teams={teams} onRefresh={fetchTeams} />}
            {tab === 'r3' && <JR3 teams={teams} onRefresh={fetchTeams} />}
            {tab === 'r4' && <JR4 teams={teams} roundState={roundState} onRefresh={fetchTeams} />}
            {tab === 'r5' && <JR5 teams={teams} onRefresh={fetchTeams} />}
          </>
        )}
      </div>
    </div>
  );
}

function JOverview({ teams, leaderboard, roundState, onRefresh }) {
  const adjustWallet = async (teamId, teamName) => {
    const n = prompt(`Adjust ₢ for ${teamName} (use negative to deduct):`);
    if (!n || isNaN(+n)) return;
    try {
      await api.patch(`/teams/${teamId}/wallet`, { amount: +n, type: 'admin', description: 'Judge manual adjustment' });
      toast.success('Wallet updated');
      onRefresh();
    } catch (err) { toast.error(String(err)); }
  };

  const addLoan = async (teamId, teamName) => {
    const n = prompt(`Loan amount for ${teamName}:`);
    if (!n || isNaN(+n)) return;
    try {
      await api.patch(`/teams/${teamId}/loan`, { amount: +n });
      toast.success('Loan added');
      onRefresh();
    } catch (err) { toast.error(String(err)); }
  };

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12, marginBottom: 24 }}>
        {[
          ['TEAMS', teams.length, '#00f5ff'],
          ['ROUND', roundState.currentRound, '#bf00ff'],
          ['TOP WALLET', leaderboard[0] ? fmt(leaderboard[0].wallet) : '—', '#ffd700'],
          ['TOTAL FLAGS', leaderboard.reduce((a, t) => a + (t.flags_captured || 0), 0), '#00ff41'],
        ].map(([l, v, c]) => (
          <div key={l} className="panel" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#3a5a7a', letterSpacing: 2, marginBottom: 6 }}>{l}</div>
            <div className="wallet-num" style={{ fontSize: 24, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Team list */}
      <div style={{ fontSize: 11, color: '#3a5a7a', letterSpacing: 2, marginBottom: 12 }}>{teams.length} TEAMS REGISTERED</div>
      {leaderboard.length === 0 && <div style={{ color: '#3a5a7a', padding: 40, textAlign: 'center', fontFamily: '"VT323",monospace', fontSize: 24 }}>AWAITING TEAM REGISTRATION…</div>}
      {leaderboard.map((t, i) => (
        <div key={t.id} className={`panel anim-slideIn ${i === 0 ? 'pulse-g' : ''}`}
          style={{ animationDelay: `${i * 0.05}s`, marginBottom: 10, borderColor: i === 0 ? 'rgba(0,255,65,.5)' : i === 1 ? 'rgba(200,200,200,.3)' : i === 2 ? 'rgba(180,120,60,.3)' : 'rgba(0,255,65,.18)', padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ minWidth: 32 }}><Medal rank={i + 1} /></div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div className="head-font" style={{ fontSize: 13, color: i === 0 ? '#00ff41' : '#a0d0a0', marginBottom: 4 }}>{t.name}</div>
              <div style={{ fontSize: 10, color: '#3a5a7a' }}>
                Flags: {t.flags_captured || 0}/5 · Items: {t.items_bought || 0}
                {t.loans > 0 && <span style={{ color: '#ff0030', marginLeft: 8 }}>LOAN: {fmt(t.loans)}</span>}
              </div>
            </div>
            <div style={{ textAlign: 'right', minWidth: 100 }}>
              <div className="wallet-num" style={{ fontSize: 22, color: i === 0 ? '#00ff41' : '#ffd700' }}>{fmt(t.wallet)}</div>
              <div style={{ fontSize: 10, color: '#3a5a7a' }}>net: {fmt(t.net_worth)}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-g" style={{ padding: '6px 12px', fontSize: 11 }} onClick={() => adjustWallet(t.id, t.name)}><span>±₢</span></button>
              <button className="btn-r" style={{ padding: '6px 12px', fontSize: 11 }} onClick={() => addLoan(t.id, t.name)}><span>LOAN</span></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
