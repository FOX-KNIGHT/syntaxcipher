const router = require('express').Router();
const { 
  JudgeConfig, Round, Obituary, TeamRound1, Team, Transaction, 
  ChallengeToken, Round3Operation, SyntaxShield, TalentShow, 
  Round4Layer, Round5Audit, MarketPurchase
} = require('../models');
const { verifyJudge, verifyTeam } = require('../middleware/auth');

// GET /api/rounds/state — current round + timer for all clients
router.get('/state', async (req, res) => {
  try {
    const cfg = await JudgeConfig.findOne();
    const round = cfg ? await Round.findOne({ roundId: cfg.currentRound }) : null;
    res.json({
      currentRound: cfg?.currentRound || 0,
      timerEndsAt:  cfg?.timerEndsAt || null,
      announcement: cfg?.announcement || '',
      round:        round || null,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/rounds/control — start/stop round, set timer (judge)
router.post('/control', verifyJudge, async (req, res) => {
  const { action, round, durationSeconds, announcement } = req.body;
  const io = req.app.get('io');
  try {
    let cfg = await JudgeConfig.findOne();
    if (!cfg) cfg = new JudgeConfig();

    if (action === 'set_round') {
      const timerEndsAt = durationSeconds
        ? new Date(Date.now() + durationSeconds * 1000)
        : null;
      cfg.currentRound = round;
      cfg.timerEndsAt = timerEndsAt;
      await cfg.save();
      io?.emit('round_changed', { round, timerEndsAt });
      io?.emit('leaderboard_updated');
    }
    else if (action === 'set_timer') {
      const timerEndsAt = new Date(Date.now() + durationSeconds * 1000);
      cfg.timerEndsAt = timerEndsAt;
      await cfg.save();
      io?.emit('timer_updated', { timerEndsAt });
    }
    else if (action === 'clear_timer') {
      cfg.timerEndsAt = null;
      await cfg.save();
      io?.emit('timer_updated', { timerEndsAt: null });
    }
    else if (action === 'announce') {
      cfg.announcement = announcement;
      await cfg.save();
      io?.emit('announcement', { message: announcement });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── ROUND 1 ────────────────────────────────────────

// GET /api/rounds/1/obituaries — for judge to assign
router.get('/1/obituaries', verifyJudge, async (req, res) => {
  const obituaries = await Obituary.find();
  res.json(obituaries);
});

// POST /api/rounds/1/assign — assign obituary to team (judge)
router.post('/1/assign', verifyJudge, async (req, res) => {
  const { teamId, obituaryId } = req.body;
  await TeamRound1.findOneAndUpdate(
    { teamId },
    { obituaryId },
    { upsert: true }
  );
  res.json({ success: true });
});

// GET /api/rounds/1/my — team gets their obituary
router.get('/1/my', verifyTeam, async (req, res) => {
  const tr = await TeamRound1.findOne({ teamId: req.team.id }).populate('obituaryId').lean();
  if (!tr) return res.json(null);
  
  res.json({
    ...tr,
    title: tr.obituaryId?.title,
    description: tr.obituaryId?.description,
    phoenix_elements: tr.obituaryId?.phoenixElements
  });
});

// POST /api/rounds/1/submit — team submits pitch
router.post('/1/submit', verifyTeam, async (req, res) => {
  const { rootCause, companyName, tagline, pivot, targetMarket, marketingHook, feasibilitySignal, valuationBet } = req.body;
  try {
    await TeamRound1.findOneAndUpdate(
      { teamId: req.team.id },
      {
        rootCause, companyName, tagline, pivot, targetMarket,
        marketingHook, feasibilitySignal, valuationBet: valuationBet || 0,
        submittedAt: new Date()
      },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/rounds/1/submissions — all pitches (judge)
router.get('/1/submissions', verifyJudge, async (req, res) => {
  const submissions = await TeamRound1.find()
    .populate('teamId', 'name')
    .populate('obituaryId', 'title')
    .sort({ submittedAt: -1 })
    .lean();
    
  const formatted = submissions.map(s => ({
    ...s,
    team_name: s.teamId?.name,
    obituary_title: s.obituaryId?.title
  }));
  res.json(formatted);
});

// POST /api/rounds/1/award — judge awards investment
router.post('/1/award', verifyJudge, async (req, res) => {
  const { teamId, coins } = req.body;
  const parsedCoins = parseInt(coins);
  if (!teamId || isNaN(parsedCoins)) return res.status(400).json({ error: 'teamId and coins required' });
  
  const code = Math.random().toString(36).slice(2,8).toUpperCase();
  await TeamRound1.findOneAndUpdate(
    { teamId },
    { coinsAwarded: parsedCoins, isLocked: true }
  );
  res.json({ success: true, code, coins: parsedCoins });
});

// POST /api/rounds/1/claim — team claims investment
router.post('/1/claim', verifyTeam, async (req, res) => {
  const { coins } = req.body;
  const parsedCoins = parseInt(coins);
  if (isNaN(parsedCoins)) return res.status(400).json({ error: 'coins required' });

  try {
    await Team.findByIdAndUpdate(req.team.id, { $inc: { wallet: parsedCoins } });
    await Transaction.create({
      teamId: req.team.id,
      round: 1,
      amount: parsedCoins,
      type: 'init',
      description: 'Round 1 investment award'
    });

    const io = req.app.get('io');
    io?.emit('wallet_updated', { teamId: req.team.id });
    io?.emit('leaderboard_updated');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── ROUND 2 ────────────────────────────────────────

// POST /api/rounds/2/tokens — judge awards challenge tokens
router.post('/2/tokens', verifyJudge, async (req, res) => {
  const { teamId, tokens, tier } = req.body;
  const parsedTokens = parseInt(tokens) || 1;
  
  await ChallengeToken.create({ teamId, tier: tier || 'easy', tokensEarned: parsedTokens });
  await Team.findByIdAndUpdate(teamId, { $inc: { tokens: parsedTokens } });
  
  const io = req.app.get('io');
  io?.emit('wallet_updated', { teamId });
  res.json({ success: true });
});

// ─── ROUND 3 ────────────────────────────────────────

// POST /api/rounds/3/action — syntax toll deduction
router.post('/3/action', verifyTeam, async (req, res) => {
  const COSTS = { forLoop:80, whileLoop:80, ifBlock:50, arith:30, cmp:30, hint:200, solution:500 };
  const { operationType } = req.body;
  const cost = COSTS[operationType];
  if (!cost) return res.status(400).json({ error: 'Invalid operation type' });

  try {
    const shield = await SyntaxShield.findOne({
      teamId: req.team.id,
      isActive: true,
      endTime: { $gt: new Date() }
    });
    
    const hasShield = !!shield;
    
    if (!hasShield) {
      const team = await Team.findById(req.team.id);
      team.wallet = Math.max(0, team.wallet - cost);
      await team.save();
    }
    
    const op = await Round3Operation.create({
      teamId: req.team.id,
      operationType,
      amount: cost
    });
    
    await Transaction.create({
      teamId: req.team.id,
      round: 3,
      amount: -cost,
      type: 'syntax',
      description: operationType
    });

    const io = req.app.get('io');
    io?.emit('syntax_toll', { teamId: req.team.id, operationType, cost, shielded: hasShield });
    io?.emit('wallet_updated', { teamId: req.team.id });
    io?.emit('leaderboard_updated');
    
    res.json({ success: true, cost, shielded: hasShield, operationId: op._id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/rounds/3/undo — refund last operation
router.post('/3/undo', verifyTeam, async (req, res) => {
  try {
    const op = await Round3Operation.findOne({ teamId: req.team.id, isUndone: false })
      .sort({ createdAt: -1 });
      
    if (!op) return res.status(400).json({ error: 'Nothing to undo' });
    
    op.isUndone = true;
    await op.save();
    
    await Team.findByIdAndUpdate(req.team.id, { $inc: { wallet: op.amount } });
    await Transaction.create({
      teamId: req.team.id,
      round: 3,
      amount: op.amount,
      type: 'syntax',
      description: 'Undo refund'
    });

    const io = req.app.get('io');
    io?.emit('wallet_updated', { teamId: req.team.id });
    io?.emit('leaderboard_updated');
    res.json({ success: true, refund: op.amount });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/rounds/3/talent — judge initiates talent show
router.post('/3/talent', verifyJudge, async (req, res) => {
  const { teamId, selfRating, judgeScore } = req.body;
  const isMatch = selfRating === judgeScore;
  const cashInjection = isMatch ? 800 : 0;
  const loanAmount   = isMatch ? 0 : 500;
  
  try {
    await TalentShow.findOneAndUpdate(
      { teamId },
      { selfRating, judgeScore, isMatch, cashInjection, loanAmount, resolved: true },
      { upsert: true }
    );
    
    if (isMatch) {
      await Team.findByIdAndUpdate(teamId, { $inc: { wallet: cashInjection } });
    } else {
      await Team.findByIdAndUpdate(teamId, { $inc: { loans: loanAmount } });
    }

    const io = req.app.get('io');
    io?.emit('wallet_updated', { teamId });
    io?.emit('leaderboard_updated');
    res.json({ success: true, isMatch, cashInjection, loanAmount });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── ROUND 4 ────────────────────────────────────────

const CTF_ANSWERS = { 1:'6', 2:'sql injection', 3:'different subnet', 4:'overfitting', 5:'boundary' };

// GET /api/rounds/4/progress — team's capture progress
router.get('/4/progress', verifyTeam, async (req, res) => {
  const team = await Team.findById(req.team.id).lean();
  const layers = await Round4Layer.find({ teamId: req.team.id }).sort({ layer: 1 }).lean();
  res.json({ ...team, layers });
});

// POST /api/rounds/4/hint — buy hint for a layer
router.post('/4/hint', verifyTeam, async (req, res) => {
  const HINT_COSTS = { 0:100, 1:200, 2:400, '0':100, '1':200, '2':400 };
  const { layer, hintIndex } = req.body;
  const cost = HINT_COSTS[hintIndex] || 100;
  
  try {
    const team = await Team.findById(req.team.id);
    if (team.wallet < cost) return res.status(400).json({ error: 'Insufficient funds' });
    
    team.wallet -= cost;
    team.r4_hint_cost += cost;
    await team.save();
    
    await Round4Layer.findOneAndUpdate(
      { teamId: req.team.id, layer },
      { $inc: { coinsOnHints: cost } },
      { upsert: true }
    );

    const io = req.app.get('io');
    io?.emit('wallet_updated', { teamId: req.team.id });
    res.json({ success: true, cost });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/rounds/4/submit — submit answer for a layer
router.post('/4/submit', verifyTeam, async (req, res) => {
  const { layer, answer } = req.body;
  if (!layer || !answer) return res.status(400).json({ error: 'layer and answer required' });
  const correct = answer.toLowerCase().trim().includes(CTF_ANSWERS[layer]);
  
  try {
    await Round4Layer.findOneAndUpdate(
      { teamId: req.team.id, layer },
      { answerSubmitted: answer, isCorrect: correct, submittedAt: new Date() },
      { upsert: true }
    );
    
    if (correct) {
      const team = await Team.findById(req.team.id);
      if (!team.r4_captured.includes(parseInt(layer))) {
        team.r4_captured.push(parseInt(layer));
        if (team.r4_captured.length >= 5) {
          team.r4_done = true;
        }
        await team.save();
      }
    }
    
    const io = req.app.get('io');
    if (correct) io?.emit('leaderboard_updated');
    res.json({ correct, layer });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/rounds/4/reward — judge grants completion reward
router.post('/4/reward', verifyJudge, async (req, res) => {
  const { teamId } = req.body;
  try {
    const team = await Team.findById(teamId);
    const bonus = 600 + (team.loans || 0);
    
    team.wallet += bonus;
    team.loans = 0;
    await team.save();
    
    await Transaction.create({
      teamId,
      round: 4,
      amount: bonus,
      type: 'task',
      description: 'Gauntlet completion reward'
    });
    
    const io = req.app.get('io');
    io?.emit('wallet_updated', { teamId });
    io?.emit('leaderboard_updated');
    res.json({ success: true, bonus });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── ROUND 5 ────────────────────────────────────────

// POST /api/rounds/5/invest — judge final VC investment
router.post('/5/invest', verifyJudge, async (req, res) => {
  const { teamId, investment, productScore, techScore, marketScore, presentationScore } = req.body;
  try {
    const audit = await Round5Audit.findOneAndUpdate(
      { teamId },
      { 
        finalInvestment: parseInt(investment) || 0,
        productScore: productScore || 0,
        techScore: techScore || 0,
        marketScore: marketScore || 0,
        presentationScore: presentationScore || 0,
        finalizedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    const team = await Team.findById(teamId);
    if (team) {
      audit.netWorth = team.wallet + audit.finalInvestment - team.loans;
      await audit.save();
    }
    
    req.app.get('io')?.emit('leaderboard_updated');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/rounds/5/champion — set champion (judge)
router.post('/5/champion', verifyJudge, async (req, res) => {
  const { teamId } = req.body;
  await Round5Audit.updateMany({}, { isChampion: false });
  await Round5Audit.findOneAndUpdate({ teamId }, { isChampion: true });
  req.app.get('io')?.emit('leaderboard_updated');
  res.json({ success: true });
});

// GET /api/rounds/5/results — final leaderboard
router.get('/5/results', async (req, res) => {
  try {
    const teams = await Team.aggregate([
      {
        $lookup: {
          from: 'round5audits',
          localField: '_id',
          foreignField: 'teamId',
          as: 'audit'
        }
      },
      { $unwind: { path: '$audit', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'marketpurchases',
          localField: '_id',
          foreignField: 'teamId',
          as: 'purchases'
        }
      },
      {
        $addFields: {
          final_investment: { $ifNull: ['$audit.finalInvestment', 0] },
          net_worth: { 
            $subtract: [
              { $add: ['$wallet', { $ifNull: ['$audit.finalInvestment', 0] }] },
              '$loans'
            ]
          },
          flags_captured: { $size: { $ifNull: ['$r4_captured', []] } },
          items_bought: { $size: '$purchases' },
          is_champion: { $ifNull: ['$audit.isChampion', false] }
        }
      },
      { $sort: { net_worth: -1 } }
    ]);
    
    const formattedTeams = teams.map(t => {
      const { _id, ...rest } = t;
      return { id: _id, ...rest };
    });

    res.json(formattedTeams);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
