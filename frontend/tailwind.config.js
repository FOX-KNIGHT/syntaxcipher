/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        z: {
          bg:    '#000a00',
          panel: '#020f02',
          card:  '#030d03',
          green: '#00ff41',
          green2:'#00cc33',
          green3:'#003311',
          cyan:  '#00f5ff',
          yellow:'#ffd700',
          orange:'#ff9500',
          red:   '#ff0030',
          purple:'#bf00ff',
          muted: '#2a4a2a',
          text:  '#a0d0a0',
        }
      },
      fontFamily: {
        mono:  ['"Share Tech Mono"', 'monospace'],
        head:  ['Orbitron', 'monospace'],
        vt:    ['VT323', 'monospace'],
      },
      animation: {
        'pulse-g':   'pulseGreen 2s ease-in-out infinite',
        'pulse-y':   'pulseYellow 2s ease-in-out infinite',
        'scanline':  'scanline 8s linear infinite',
        'ticker':    'ticker 30s linear infinite',
        'fadeIn':    'fadeIn 0.4s ease both',
        'slideIn':   'slideIn 0.3s ease both',
        'glitch':    'glitch 6s infinite',
        'blink':     'blink 1s step-end infinite',
        'moneyUp':   'moneyUp 1s ease forwards',
      },
      keyframes: {
        pulseGreen:  { '0%,100%': { boxShadow: '0 0 8px #00ff41, 0 0 20px rgba(0,255,65,.2)' }, '50%': { boxShadow: '0 0 20px #00ff41, 0 0 40px rgba(0,255,65,.4)' } },
        pulseYellow: { '0%,100%': { boxShadow: '0 0 8px #ffd700, 0 0 20px rgba(255,215,0,.2)' }, '50%': { boxShadow: '0 0 20px #ffd700, 0 0 40px rgba(255,215,0,.4)' } },
        scanline:    { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100vh)' } },
        ticker:      { '0%': { transform: 'translateX(100vw)' }, '100%': { transform: 'translateX(-100%)' } },
        fadeIn:      { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideIn:     { from: { opacity: 0, transform: 'translateX(-20px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        glitch:      { '0%,95%,100%': { clipPath: 'none', transform: 'translate(0)' }, '96%': { clipPath: 'polygon(0 20%,100% 20%,100% 40%,0 40%)', transform: 'translate(-3px,0)' }, '97%': { clipPath: 'polygon(0 60%,100% 60%,100% 70%,0 70%)', transform: 'translate(3px,0)' } },
        blink:       { '50%': { opacity: 0 } },
        moneyUp:     { '0%': { transform: 'translateY(0)', opacity: 1 }, '100%': { transform: 'translateY(-60px)', opacity: 0 } },
      },
      boxShadow: {
        'glow-g':  '0 0 12px #00ff41, 0 0 30px rgba(0,255,65,.3)',
        'glow-y':  '0 0 12px #ffd700, 0 0 30px rgba(255,215,0,.3)',
        'glow-r':  '0 0 12px #ff0030, 0 0 30px rgba(255,0,48,.3)',
        'glow-c':  '0 0 12px #00f5ff, 0 0 30px rgba(0,245,255,.3)',
        'panel':   'inset 0 1px 0 rgba(0,255,65,.1), 0 4px 24px rgba(0,0,0,.6)',
      },
      clipPath: {
        'panel':   'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
        'btn':     'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)',
      }
    }
  },
  plugins: []
};
