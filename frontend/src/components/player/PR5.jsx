import { useState, useEffect } from 'react';
import { PanelY, Panel, Medal } from '../UI';
import api from '../../utils/api';
import { fmt } from '../../utils/helpers';

export default function PR5({ team }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    api.get('/rounds/5/results').then(d => setResults(d)).catch(() => {});
  }, []);

  const myRank = results.findIndex(t => t.id === team?.id) + 1;
  const myVal  = parseInt(team?.net_worth || team?.wallet || 0);

  return (
    <div className="anim-fadeIn">
      {/* Personal card */}
      <div className="panel-y pulse-y" style={{ textAlign: 'center', padding: 40, marginBottom: 20 }}>
        <div style={{ fontFamily: '"VT323",monospace', fontSize: 16, color: '#ffd700', letterSpacing: 4, marginBottom: 8 }}>YOUR FINAL NET WORTH</div>
        <div className="wallet-num" style={{ fontSize: 'clamp(40px,10vw,68px)', color: '#ffd700', textShadow: '0 0 30px #ffd700, 0 0 60px rgba(255,215,0,.3)' }}>
          {fmt(myVal)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: 12, color: '#3a5a7a', marginTop: 12, flexWrap: 'wrap' }}>
          <span>WALLET {fmt(team?.wallet)}</span>
          <span>+VC {fmt(team?.final_investment || 0)}</span>
          <span style={{ color: '#ff0030' }}>−LOANS {fmt(team?.loans || 0)}</span>
        </div>
        {myRank > 0 && (
          <div style={{ marginTop: 16 }}>
            <span className="tag tag-y">RANK #{myRank} OF {results.length}</span>
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div style={{ fontSize: 10, color: '#3a5a7a', letterSpacing: 2, marginBottom: 12 }}>FINAL LEADERBOARD</div>
      {results.map((t, i) => {
        const val = parseInt(t.net_worth || t.wallet || 0);
        const isMe = t.id === team?.id;
        return (
          <div key={t.id} className={`panel anim-slideIn`}
            style={{ animationDelay: `${i * 0.07}s`, marginBottom: 8, padding: '12px 16px', borderColor: isMe ? 'rgba(0,255,65,.5)' : i === 0 ? 'rgba(255,215,0,.4)' : 'rgba(0,255,65,.18)', background: isMe ? 'rgba(0,20,0,.9)' : i === 0 ? 'rgba(10,8,0,.9)' : undefined }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Medal rank={i + 1} />
                  <span className="head-font" style={{ fontSize: 13, color: isMe ? '#00ff41' : '#a0d0a0' }}>{t.name}</span>
                  {isMe && <span className="tag tag-g">YOU</span>}
                  {t.is_champion && <span className="tag tag-y">CHAMPION</span>}
                </div>
              </div>
              <div className="wallet-num" style={{ fontSize: 22, color: val >= 0 ? i === 0 ? '#ffd700' : '#00ff41' : '#ff0030' }}>
                {fmt(val)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
