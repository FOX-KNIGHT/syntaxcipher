require('dotenv').config();
const express  = require('express');
const http     = require('http');
const { Server } = require('socket.io');
const cors     = require('cors');
const connectDB = require('./config/db');
const { JudgeConfig, Team } = require('./models');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:5173', methods: ['GET','POST','PATCH'] }
});

// Connect to MongoDB
connectDB();

// ── Middleware ────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.set('io', io);

// ── Routes ────────────────────────────────────────
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/teams',  require('./routes/teams'));
app.use('/api/rounds', require('./routes/rounds'));
app.use('/api/market', require('./routes/market'));
app.use('/api/cipher-config', require('./routes/cipherConfig'));
app.use('/api/round2', require('./routes/round2'));
app.use('/api/round3', require('./routes/round3'));

// ── Health Check ──────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Helper for Leaderboard Data
const getLeaderboardData = async () => {
  return await Team.aggregate([
    { $lookup: { from: 'round5audits', localField: '_id', foreignField: 'teamId', as: 'audit' } },
    { $unwind: { path: '$audit', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'marketpurchases', localField: '_id', foreignField: 'teamId', as: 'purchases' } },
    {
      $addFields: {
        final_investment: { $ifNull: ['$audit.finalInvestment', 0] },
        net_worth: { $subtract: [{ $add: ['$wallet', { $ifNull: ['$audit.finalInvestment', 0] }] }, '$loans'] },
        flags_captured: { $size: { $ifNull: ['$r4_captured', []] } },
        items_bought: { $size: '$purchases' },
        is_champion: { $ifNull: ['$audit.isChampion', false] }
      }
    },
    { $sort: { net_worth: -1 } }
  ]);
};

// ── Socket.IO ─────────────────────────────────────
io.on('connection', async (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Send current state on connect
  try {
    const cfg = await JudgeConfig.findOne();
    const lb = await getLeaderboardData();
    socket.emit('init_state', { config: cfg, leaderboard: lb });
  } catch (err) {
    console.error('[Socket] Init error:', err.message);
  }

  // Client requests current leaderboard
  socket.on('request_leaderboard', async () => {
    try {
      const lb = await getLeaderboardData();
      socket.emit('leaderboard_data', lb);
    } catch {}
  });

  // Client requests round state
  socket.on('request_round_state', async () => {
    try {
      const cfg = await JudgeConfig.findOne();
      socket.emit('round_state', cfg);
    } catch {}
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// ── Timer tick — broadcast every second ──────────
setInterval(async () => {
  try {
    const cfg = await JudgeConfig.findOne();
    if (cfg?.timerEndsAt) {
      const remaining = Math.max(0, Math.floor((new Date(cfg.timerEndsAt) - Date.now()) / 1000));
      io.emit('timer_tick', { remaining, endsAt: cfg.timerEndsAt });
    }
  } catch {}
}, 1000);

// ── Start ─────────────────────────────────────────
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║   ⚡ SYNTAXCIPHER BACKEND — PORT ${PORT}      ║
  ║   Survival of the Most Adaptable     ║
  ╚═══════════════════════════════════════╝
  `);
});
