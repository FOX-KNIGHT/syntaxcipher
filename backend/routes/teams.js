const router   = require('express').Router();
const { Team, Transaction, MarketPurchase, Round5Audit } = require('../models');
const { verifyJudge, verifyTeam } = require('../middleware/auth');

// GET /api/teams — all teams with members (judge)
router.get('/', verifyJudge, async (req, res) => {
  try {
    const teams = await Team.aggregate([
      {
        $lookup: {
          from: 'round5audits', // mongoose pluralizes collection names
          localField: '_id',
          foreignField: 'teamId',
          as: 'audit'
        }
      },
      {
        $unwind: { path: '$audit', preserveNullAndEmptyArrays: true }
      },
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
      {
        $sort: { net_worth: -1 }
      }
    ]);
    
    // Convert _id to id for frontend compatibility if needed
    const formattedTeams = teams.map(t => {
      const { _id, ...rest } = t;
      return { id: _id, ...rest };
    });

    res.json(formattedTeams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/teams/me — own team info (team)
router.get('/me', verifyTeam, async (req, res) => {
  try {
    const team = await Team.findById(req.team.id).lean();
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const audit = await Round5Audit.findOne({ teamId: req.team.id }).lean();
    const final_investment = audit?.finalInvestment || 0;
    const net_worth = (team.wallet || 0) + final_investment - (team.loans || 0);

    const purchases = await MarketPurchase.find({ teamId: req.team.id })
      .populate('itemId', 'name icon')
      .lean();

    const formattedPurchases = purchases.map(p => ({
      name: p.itemId?.name,
      icon: p.itemId?.icon,
      purchased_at: p.createdAt
    }));

    res.json({
      id: team._id,
      name: team.name,
      code: team.code,
      wallet: team.wallet,
      loans: team.loans,
      tokens: team.tokens,
      r4_captured: team.r4_captured,
      r4_done: team.r4_done,
      final_investment,
      net_worth,
      members: team.members,
      purchases: formattedPurchases
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/teams/:id/wallet — adjust wallet (judge)
router.patch('/:id/wallet', verifyJudge, async (req, res) => {
  const { amount, description, type } = req.body;
  const parsedAmount = parseInt(amount);
  if (isNaN(parsedAmount)) return res.status(400).json({ error: 'amount required' });
  
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    team.wallet = Math.max(0, team.wallet + parsedAmount);
    await team.save();

    await Transaction.create({
      teamId: team._id,
      amount: parsedAmount,
      type: type || 'admin',
      description: description || 'Judge adjustment'
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('wallet_updated', { teamId: team._id, wallet: team.wallet, loans: team.loans });
      io.emit('leaderboard_updated');
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/teams/:id/loan — add loan (judge)
router.patch('/:id/loan', verifyJudge, async (req, res) => {
  const { amount } = req.body;
  const parsedAmount = parseInt(amount);
  if (isNaN(parsedAmount)) return res.status(400).json({ error: 'amount required' });
  
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { $inc: { loans: parsedAmount } },
      { new: true }
    );
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const io = req.app.get('io');
    if (io) {
      io.emit('wallet_updated', { teamId: team._id });
      io.emit('leaderboard_updated');
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/teams/:id/transactions — history
router.get('/:id/transactions', verifyJudge, async (req, res) => {
  try {
    const transactions = await Transaction.find({ teamId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
