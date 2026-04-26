# ⚡ SYNTAXCIPHER CHAMPION — Genesis Wallet Arena

> "Survival of the Most Adaptable"

A real-time, full-stack gamified hackathon management platform with three synchronized interfaces: **Projector**, **Judge Panel**, and **Player Dashboard**.

---

## 🧱 TECH STACK

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Real-time | Socket.IO |
| Auth | JWT (Judge) + Code-based (Teams) |

---

## ⚙️ PREREQUISITES

- Node.js 18+
- PostgreSQL 14+
- npm 9+

---

## 🚀 SETUP INSTRUCTIONS

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure PostgreSQL

Create a database:
```sql
CREATE DATABASE syntaxcipher_db;
```

Run the schema:
```bash
cd backend
psql -U postgres -d syntaxcipher_db -f schema.sql
```

### 3. Environment Variables

**backend/.env**
```env
PORT=4000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/syntaxcipher_db
JWT_SECRET=syntaxcipher_super_secret_key_change_this
JUDGE_PASSWORD=judge2024
CORS_ORIGIN=http://localhost:5173
```

**frontend/.env**
```env
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
```

### 4. Run the Application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🔐 ACCESS CREDENTIALS

| Role | URL | Credentials |
|------|-----|-------------|
| Judge | `/judge` | Password set in `.env` as `JUDGE_PASSWORD` |
| Projector | `/projector` | No auth required |
| Player | `/team` | 6-char team code after registration |

---

## 📡 ROUTES

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/judge/login | Judge login |
| POST | /api/auth/team/create | Create new team |
| POST | /api/auth/team/join | Join team by code |
| GET | /api/teams | All teams (judge) |
| PATCH | /api/teams/:id/wallet | Adjust wallet (judge) |
| GET | /api/rounds/current | Get current round state |
| POST | /api/rounds/control | Start/stop/timer (judge) |
| POST | /api/round1/submit | Team submits pitch |
| POST | /api/round1/award | Judge awards coins |
| GET | /api/market/items | Get market items |
| POST | /api/market/buy | Purchase item |
| POST | /api/round3/action | Syntax toll deduction |
| POST | /api/round3/undo | Refund last action |
| GET | /api/round4/layers | Get gauntlet layers |
| POST | /api/round4/hint | Buy hint |
| POST | /api/round4/submit | Submit layer answer |
| POST | /api/round5/invest | Judge final investment |
| GET | /api/round5/results | Final leaderboard |

---

## 📡 SOCKET EVENTS

| Event | Direction | Description |
|-------|-----------|-------------|
| `wallet_updated` | server→client | Wallet balance changed |
| `leaderboard_updated` | server→client | Rankings changed |
| `round_changed` | server→client | New round started |
| `timer_updated` | server→client | Timer tick |
| `announcement` | server→client | Judge broadcast |
| `market_purchase` | server→client | Team bought item |
| `syntax_toll` | server→client | Code deduction |

---

## 🗂️ PROJECT STRUCTURE

```
syntaxcipher/
├── backend/
│   ├── config/db.js          # PostgreSQL pool
│   ├── middleware/auth.js    # JWT middleware
│   ├── routes/               # All API routes
│   ├── socket/events.js      # Socket.IO handlers
│   ├── schema.sql            # DB schema
│   └── server.js             # Main entry point
├── frontend/
│   └── src/
│       ├── context/          # Auth + Socket context
│       ├── pages/            # 3 main views
│       ├── components/       # Reusable UI components
│       └── utils/            # Helpers
└── README.md
```

---

## 🎮 GAME FLOW

1. **Round 0** — Teams register, judge preps
2. **Round 1** — Dead Startup Resurrection (pitch)
3. **Round 2** — Resource Market (buy items)
4. **Round 3** — Syntax Toll (coding challenge)
5. **Round 4** — 5-Layer CTF Gauntlet (25 min)
6. **Round 5** — Final Showcase & Audit

**