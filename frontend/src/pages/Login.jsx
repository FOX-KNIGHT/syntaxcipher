import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { MatrixRain } from '../components/UI';
import api from '../utils/api';

export default function Login({ mode = 'login' }) {
  const { login, auth } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(mode === 'join' ? 'join' : 'judge');
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  // Fields
  const [judgePass, setJudgePass] = useState('');
  const [teamName,  setTeamName]  = useState('');
  const [leadName,  setLeadName]  = useState('');
  const [joinCode,  setJoinCode]  = useState('');
  const [memberName,setMemberName]= useState('');
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (auth?.role === 'judge') navigate('/judge');
    else if (auth?.role === 'team') navigate('/team');
  }, [auth]);

  const handleJudge = async () => {
    setLoading(true);
    try {
      const data = await api.post('/auth/judge/login', { password: judgePass });
      login({ ...data });
      toast.success('Judge access granted');
      navigate('/judge');
    } catch (err) {
      toast.error(String(err));
    } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const data = await api.post('/auth/team/create', { teamName, leadName });
      login({ ...data });
      toast.success(`Team "${teamName}" created! Code: ${data.code}`);
      navigate('/team');
    } catch (err) {
      toast.error(String(err));
    } finally { setLoading(false); }
  };

  const handleJoin = async () => {
    setLoading(true);
    try {
      const data = await api.post('/auth/team/join', { code: joinCode.trim().toUpperCase(), memberName });
      login({ ...data });
      toast.success(`Joined team "${data.teamName}"!`);
      navigate('/team');
    } catch (err) {
      toast.error(String(err));
    } finally { setLoading(false); }
  };

  const TABS = [
    { id: 'judge',  label: 'JUDGE' },
    { id: 'create', label: 'CREATE TEAM' },
    { id: 'join',   label: 'JOIN TEAM' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#000a00', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>
      <MatrixRain opacity={0.16} count={35} />

      {/* Top bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,255,65,.15)', background: 'rgba(0,5,0,.95)', zIndex: 100, fontFamily: '"Share Tech Mono",monospace' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ color: '#ff0030', fontSize: 8 }}>●</span>
          <span style={{ color: '#ffd700', fontSize: 8 }}>●</span>
          <span style={{ color: '#00ff41', fontSize: 8 }}>●</span>
          <span style={{ fontSize: 11, color: '#3a5a7a', letterSpacing: 2 }}>SYNTAXCIPHER.SYS v5.0</span>
        </div>
        <div style={{ fontFamily: '"VT323",monospace', fontSize: 20, color: '#3a5a7a' }}>{time} IST</div>
        <div style={{ fontSize: 10, color: '#3a5a7a', letterSpacing: 1 }}>GENESIS WALLET ARENA</div>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 460 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="head-font anim-glitch" style={{ fontSize: 'clamp(40px,10vw,68px)', fontWeight: 900, letterSpacing: 10, color: '#00ff41', textShadow: '0 0 20px #00ff41, 0 0 60px rgba(0,255,65,.3)' }}>
            SYNTAXCIPHER
          </div>
          <div className="vt-font" style={{ fontSize: 22, color: '#ffd700', letterSpacing: 6, marginTop: 4 }}>
            "SURVIVAL OF THE MOST ADAPTABLE"
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {['PITCH', 'BUILD', 'HACK', 'SURVIVE'].map(s => <span key={s} className="tag tag-g">{s}</span>)}
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', marginBottom: 0, borderBottom: '1px solid rgba(0,255,65,.2)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: 1, background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.id ? '#00ff41' : 'transparent'}`, color: tab === t.id ? '#00ff41' : '#3a5a7a', padding: '10px 8px', cursor: 'pointer', fontFamily: '"Share Tech Mono",monospace', fontSize: 11, letterSpacing: 2, transition: 'all .2s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Judge login */}
        {tab === 'judge' && (
          <div className="panel p-6 anim-fadeIn">
            <div style={{ fontSize: 11, color: '#3a5a7a', marginBottom: 16, fontFamily: '"Share Tech Mono",monospace' }}>
              <span style={{ color: '#00ff41' }}>root@syntaxcipher:~$</span> authenticate --role judge
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: '#3a5a7a', letterSpacing: 2, marginBottom: 6 }}>JUDGE PASSWORD</div>
              <input className="inp" type="password" placeholder="••••••••" value={judgePass}
                onChange={e => setJudgePass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleJudge()} />
            </div>
            <button className="btn-g" style={{ width: '100%', padding: 14, fontSize: 14, letterSpacing: 4 }} onClick={handleJudge} disabled={loading}>
              <span>{loading ? 'AUTHENTICATING...' : '[ ACCESS JUDGE PANEL ]'}</span>
            </button>
            <div style={{ marginTop: 16, fontSize: 10, color: '#3a5a7a', textAlign: 'center', letterSpacing: 1 }}>
              Projector: <a href="/projector" style={{ color: '#00cc33', textDecoration: 'none', letterSpacing: 2 }}>→ /projector</a>
            </div>
          </div>
        )}

        {/* Create team */}
        {tab === 'create' && (
          <div className="panel-y p-6 anim-fadeIn">
            <div style={{ fontSize: 11, color: '#ffd700', letterSpacing: 2, marginBottom: 16 }}>
              $ REGISTER NEW TEAM
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: '#ffd700', letterSpacing: 2, marginBottom: 6 }}>TEAM NAME</div>
              <input className="inp inp-y" placeholder="e.g. Phoenix Rising" value={teamName} onChange={e => setTeamName(e.target.value)} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: '#ffd700', letterSpacing: 2, marginBottom: 6 }}>YOUR NAME (TEAM LEAD)</div>
              <input className="inp inp-y" placeholder="Full name" value={leadName} onChange={e => setLeadName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()} />
            </div>
            <button className="btn-y" style={{ width: '100%', padding: 14 }} onClick={handleCreate} disabled={loading}>
              <span>{loading ? 'CREATING...' : '[ CREATE TEAM ]'}</span>
            </button>
          </div>
        )}

        {/* Join team */}
        {tab === 'join' && (
          <div className="panel-c p-6 anim-fadeIn">
            <div style={{ fontSize: 11, color: '#00f5ff', letterSpacing: 2, marginBottom: 16 }}>
              $ JOIN EXISTING TEAM
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: '#00f5ff', letterSpacing: 2, marginBottom: 6 }}>TEAM CODE (6 chars)</div>
              <input className="inp" style={{ letterSpacing: 8, fontSize: 20, textTransform: 'uppercase', color: '#00f5ff', borderColor: 'rgba(0,245,255,.4)' }}
                placeholder="XXXXXX" value={joinCode} onChange={e => setJoinCode(e.target.value)} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: '#00f5ff', letterSpacing: 2, marginBottom: 6 }}>YOUR NAME</div>
              <input className="inp" style={{ borderColor: 'rgba(0,245,255,.4)', color: '#00f5ff' }}
                placeholder="Your full name" value={memberName} onChange={e => setMemberName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleJoin()} />
            </div>
            <button className="btn-g" style={{ width: '100%', padding: 14, borderColor: '#00f5ff', color: '#00f5ff' }} onClick={handleJoin} disabled={loading}>
              <span>{loading ? 'JOINING...' : '[ JOIN TEAM ]'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
