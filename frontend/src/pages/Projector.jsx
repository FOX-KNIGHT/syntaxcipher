import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { MatrixRain, Ticker, Timer, Medal } from '../components/UI';
import { ROUND_NAMES, ROUND_COLORS, fmt } from '../utils/helpers';

const BANNERS = {
  0: { text: 'REGISTRATION OPEN',         color: '#3a5a7a' },
  1: { text: 'DEAD STARTUP RESURRECTION', color: '#818cf8' },
  2: { text: 'RESOURCE MARKET ACTIVE',    color: '#ffd700' },
  3: { text: 'SYNTAX TOLL ENGAGED',       color: '#ff0030' },
  4: { text: '5-LAYER CTF GAUNTLET',      color: '#00ff41' },
  5: { text: 'FINAL SHOWCASE & AUDIT',    color: '#ffd700' },
};

export default function Projector() {
  const { roundState, leaderboard } = useSocket();
  const { currentRound, timerEndsAt, announcement } = roundState;
  const [now, setNow] = useState(new Date().toLocaleTimeString());
  const [showAnn, setShowAnn] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setNow(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (announcement) { setShowAnn(true); const t = setTimeout(() => setShowAnn(false), 8000); return () => clearTimeout(t); }
  }, [announcement]);

  const banner = BANNERS[currentRound] || BANNERS[0];
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#00ff41', fontFamily: '"Share Tech Mono",monospace', overflow: 'hidden', position: 'relative' }}>
      <MatrixRain opacity={0.07} count={45} />

      {/* Announcement overlay */}
      {showAnn && announcement && (
        <div style={{ position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 500, background: 'rgba(0,0,0,.95)', border: '2px solid #ffd700', padding: '16px 32px', boxShadow: '0 0 40px rgba(255,215,0,.4)', maxWidth: 600, textAlign: 'center', animation: 'fadeIn .3s ease' }}>
          <div style={{ fontSize: 10, color: '#ffd700', letterSpacing: 3, marginBottom: 6 }}>JUDGE ANNOUNCEMENT</div>
          <div className="vt-font" style={{ fontSize: 22, color: '#ffd700' }}>{announcement}</div>
        </div>
      )}

      {/* Top bar */}
      <div style={{ background: 'rgba(0,5,0,.97)', borderBottom: '2px solid rgba(0,255,65,.3)', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 50 }}>
        <div className="head-font anim-glitch" style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, color: '#00ff41', textShadow: '0 0 20px #00ff41, 0 0 60px rgba(0,255,65,.3)', letterSpacing: 8 }}>
          SYNTAXCIPHER
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="head-font" style={{ fontSize: 'clamp(11px,2vw,16px)', color: banner.color, letterSpacing: 3, textShadow: `0 0 10px ${banner.color}` }}>
            {banner.text}
          </div>
          <div style={{ fontSize: 10, color: '#3a5a7a', marginTop: 4, letterSpacing: 2 }}>
            ROUND {currentRound} OF 5
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="vt-font" style={{ fontSize: 28, color: '#3a5a7a' }}>{now}</div>
          {timerEndsAt && <Timer endsAt={timerEndsAt} large />}
        </div>
      </div>

      <Ticker teams={leaderboard} />

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'rgba(0,255,65,.1)', margin: 0 }}>
        {[
          ['TEAMS', leaderboard.length, '#00f5ff'],
          ['ROUND', currentRound === 0 ? '—' : currentRound, '#bf00ff'],
          ['TOP WALLET', leaderboard[0] ? fmt(leaderboard[0].wallet) : '—', '#ffd700'],
        ].map(([l, v, c]) => (
          <div key={l} style={{ background: 'rgba(0,5,0,.95)', padding: '14px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#3a5a7a', letterSpacing: 2, marginBottom: 6 }}>{l}</div>
            <div className="wallet-num" style={{ fontSize: 'clamp(22px,3.5vw,36px)', color: c, textShadow: `0 0 12px ${c}` }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div style={{ padding: '20px 24px', position: 'relative', zIndex: 10 }}>
        <div style={{ fontSize: 10, color: '#3a5a7a', letterSpacing: 3, marginBottom: 16 }}>◈ LIVE LEADERBOARD — GENESIS WALLET RANKINGS</div>

        {/* Top 3 */}
        {top3.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12, marginBottom: 12 }}>
            {top3.map((t, i) => {
              const val = parseInt(t.net_worth || 0);
              const borderC = i === 0 ? 'rgba(0,255,65,.7)' : i === 1 ? 'rgba(200,200,200,.5)' : 'rgba(180,120,60,.5)';
              return (
                <div key={t.id} className={`panel anim-slideIn ${i === 0 ? 'pulse-g' : ''}`}
                  style={{ animationDelay: `${i * 0.06}s`, borderColor: borderC, background: i === 0 ? 'rgba(0,20,0,.95)' : 'rgba(0,5,0,.95)', padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: 4 }}><Medal rank={i + 1} /></div>
                      <div className="head-font" style={{ fontSize: 'clamp(13px,2vw,16px)', color: i === 0 ? '#00ff41' : '#a0d0a0', marginBottom: 4 }}>{t.name}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                        {t.loans > 0 && <span className="tag tag-r">LOAN {fmt(t.loans)}</span>}
                        {t.flags_captured > 0 && <span className="tag tag-g">{t.flags_captured}/5 FLAGS</span>}
                        {t.is_champion && <span className="tag tag-y">CHAMPION</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="wallet-num" style={{ fontSize: 'clamp(20px,3vw,28px)', color: i === 0 ? '#00ff41' : '#ffd700', textShadow: `0 0 12px ${i === 0 ? '#00ff41' : '#ffd700'}` }}>
                        {fmt(t.wallet)}
                      </div>
                      <div style={{ fontSize: 11, color: '#3a5a7a', marginTop: 2 }}>net: {fmt(val)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rest */}
        {rest.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 8 }}>
            {rest.map((t, i) => (
              <div key={t.id} className="panel anim-slideIn" style={{ animationDelay: `${(i + 3) * 0.04}s`, padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <Medal rank={i + 4} />
                      <span className="head-font" style={{ fontSize: 12, color: '#a0d0a0' }}>{t.name}</span>
                    </div>
                  </div>
                  <div className="wallet-num" style={{ fontSize: 18, color: '#ffd700' }}>{fmt(t.wallet)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {leaderboard.length === 0 && (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div className="vt-font anim-blink" style={{ fontSize: 48, color: '#3a5a7a', letterSpacing: 4 }}>AWAITING PARTICIPANTS…</div>
          </div>
        )}
      </div>
    </div>
  );
}
