const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const { Team } = require('../models');

// ─── Helpers ────────────────────────────────────────
const rndCode = () => Math.random().toString(36).slice(2,8).toUpperCase();
const sign    = (payload) => jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '12h' });

// ─── POST /api/auth/judge/login ──────────────────────
router.post('/judge/login', (req, res) => {
  const { password } = req.body;
  if (!password || password !== (process.env.JUDGE_PASSWORD || 'judge')) {
    return res.status(401).json({ error: 'Invalid judge password' });
  }
  const token = sign({ role: 'judge', id: 'judge' });
  res.json({ token, role: 'judge' });
});

// ─── POST /api/auth/team/create ──────────────────────
router.post('/team/create', async (req, res) => {
  const { teamName, leadName } = req.body;
  if (!teamName?.trim() || !leadName?.trim()) {
    return res.status(400).json({ error: 'teamName and leadName are required' });
  }

  try {
    const existing = await Team.findOne({ name: teamName.trim() });
    if (existing) return res.status(409).json({ error: 'Team name already exists' });

    let code, exists = true;
    while (exists) {
      code = rndCode();
      const existingCode = await Team.findOne({ code });
      exists = !!existingCode;
    }

    const team = new Team({
      name: teamName.trim(),
      code,
      members: [{ name: leadName.trim(), isLead: true }]
    });

    await team.save();

    const token = sign({ role: 'team', id: team._id, teamName: team.name, code: team.code });
    res.status(201).json({ token, teamId: team._id, teamName: team.name, code: team.code, leadName: leadName.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/auth/team/join ────────────────────────
router.post('/team/join', async (req, res) => {
  const { code, memberName } = req.body;
  if (!code?.trim() || !memberName?.trim()) {
    return res.status(400).json({ error: 'code and memberName are required' });
  }

  try {
    const team = await Team.findOne({ code: code.trim().toUpperCase() });
    if (!team) return res.status(404).json({ error: 'Team code not found' });
    
    if (team.members.length >= 5) return res.status(400).json({ error: 'Team is full (max 5)' });

    team.members.push({ name: memberName.trim() });
    await team.save();

    const token = sign({ role: 'team', id: team._id, teamName: team.name, code: team.code });
    res.json({ token, teamId: team._id, teamName: team.name, code: team.code, memberName: memberName.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
