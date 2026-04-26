import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Panel, PanelY, PanelR, PanelC, Timer, Tag, Loading, Ticker, WalletBig } from '../components/UI';
import { ROUND_NAMES, fmt } from '../utils/helpers';
import api from '../utils/api';
import PR1 from '../components/player/PR1';
import PR2 from '../components/player/PR2';
import PR3 from '../components/player/PR3';
import PR4 from '../components/player/PR4';
import PR5 from '../components/player/PR5';

export default function PlayerDash() {
  const { token, role, teamId, teamName, teamCode, logout } = useAuth();
  const { roundState, walletEvents } = useSocket();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || role !== 'team') { navigate('/login'); return; }
    fetchTeam();
  }, [token]);

  // Re-fetch team on wallet events relevant to us
  useEffect(() => {
    const ev = walletEvents[walletEvents.length - 1];
    if (ev?.teamId === teamId) fetchTeam();
  }, [walletEvents]);

  const fetchTeam = useCallback(async () => {
    try { setTeam(await api.get('/teams/me')); }
    catch (err) { toast.error(String(err)); }
    finally { setLoading(false); }
  }, []);

  if (loading) return <Loading label="CONNECTING TO ARENA…" />;

  const cr = roundState.currentRound;
  const ROUND_COLOR = { 0: '#3a5a7a', 1: '#818cf8', 2: '#ffd700', 3: '#ff0030', 4: '#00ff41', 5: '#ffd700' };

  return (
    <div style={{ minHeight: '100vh', background: '#000a00', color: '#00ff41', fontFamily: '"Share Tech Mono",monospace' }}>
      {/* Sticky HUD */}
      <div style={{ position: 'sticky', top: 0, background: 'rgba(0,5,0,.97)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(0,255,65,.25)', zIndex: 200, padding: '12px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div className="head-font" style={{ fontSize: 15, color: '#00ff41' }}>{teamName || team?.name}</div>
            <div style={{ fontSize: 10, color: '#3a5a7a', marginTop: 2 }}>
              CODE: <span style={{ color: '#ffd700', letterSpacing: 3 }}>{teamCode || team?.code}</span>
              {' · '}<span className="tag tag-g">{ROUND_NAMES[cr] || 'STANDBY'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            {roundState.timerEndsAt && <Timer endsAt={roundState.timerEndsAt} />}
            {team?.loans > 0 && <div style={{ fontSize: 11, color: '#ff0030' }}>LOAN: {fmt(team.loans)}</div>}
            {team?.shield_active && <span className="tag tag-c">🛡️ SHIELD</span>}
            <WalletBig amount={team?.wallet || 0} />
            <button className="btn-r" style={{ padding: '6px 12px', fontSize: 10 }} onClick={() => { logout(); navigate('/login'); }}><span>EXIT</span></button>
          </div>
        </div>

        {/* Members */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {(team?.members || []).map(m => (
            <span key={m.name} className={`tag ${m.is_lead ? 'tag-y' : 'tag-g'}`}>{m.is_lead ? '★ ' : ''}{m.name}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px', maxWidth: 900, margin: '0 auto' }}>
        {cr === 0 && <WaitScreen announcement={roundState.announcement} />}
        {cr === 1 && <PR1 team={team} onRefresh={fetchTeam} />}
        {cr === 2 && <PR2 team={team} onRefresh={fetchTeam} />}
        {cr === 3 && <PR3 team={team} onRefresh={fetchTeam} />}
        {cr === 4 && <PR4 team={team} roundState={roundState} onRefresh={fetchTeam} />}
        {cr === 5 && <PR5 team={team} />}
      </div>
    </div>
  );
}

function WaitScreen({ announcement }) {
  return (
    <div className="panel" style={{ textAlign: 'center', padding: 60 }}>
      <div className="vt-font anim-blink" style={{ fontSize: 60, color: '#00ff41', marginBottom: 8 }}>⌛</div>
      <div className="head-font" style={{ fontSize: 18, color: '#00ff41', letterSpacing: 4, marginBottom: 8 }}>STANDBY</div>
      <div style={{ color: '#3a5a7a', letterSpacing: 2 }}>Event organizer will launch the first round shortly.</div>
      {announcement && (
        <div style={{ marginTop: 20, background: 'rgba(255,215,0,.05)', border: '1px solid rgba(255,215,0,.3)', padding: 14, color: '#ffd700' }}>
          📢 {announcement}
        </div>
      )}
    </div>
  );
}
