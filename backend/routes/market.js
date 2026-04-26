const router = require('express').Router();
const { BuyableItem, MarketPurchase, Team, Transaction, SyntaxShield } = require('../models');
const { verifyTeam } = require('../middleware/auth');

// GET /api/market/items
router.get('/items', async (req, res) => {
  try {
    const items = await BuyableItem.find().sort({ price: 1 }).lean();
    
    // Map _id to id for frontend
    const formatted = items.map(item => {
      const { _id, ...rest } = item;
      return { id: _id, ...rest };
    });
    
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/market/my-items — what the team already owns
router.get('/my-items', verifyTeam, async (req, res) => {
  try {
    const purchases = await MarketPurchase.find({ teamId: req.team.id })
      .populate('itemId', 'name icon description')
      .lean();
    
    const formatted = purchases.map(p => ({
      item_id: p.itemId?._id,
      name: p.itemId?.name,
      icon: p.itemId?.icon,
      description: p.itemId?.description,
      price_paid: p.pricePaid
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/market/buy
router.post('/buy', verifyTeam, async (req, res) => {
  const { itemId } = req.body;
  if (!itemId) return res.status(400).json({ error: 'itemId required' });

  try {
    const item = await BuyableItem.findById(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const owned = await MarketPurchase.findOne({ teamId: req.team.id, itemId });
    if (owned) return res.status(400).json({ error: 'Already purchased' });

    const team = await Team.findById(req.team.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const hasToken = team.tokens > 0;
    const finalPrice = hasToken ? item.price : item.price * 2;

    if (team.wallet < finalPrice) {
      return res.status(400).json({ error: `Insufficient funds. Need ₢${finalPrice}` });
    }

    // Atomic update for wallet to prevent double spending
    const updatedTeam = await Team.findOneAndUpdate(
      { _id: req.team.id, wallet: { $gte: finalPrice } },
      { $inc: { wallet: -finalPrice } },
      { new: true }
    );

    if (!updatedTeam) {
      return res.status(400).json({ error: 'Insufficient funds or concurrent update' });
    }

    await MarketPurchase.create({
      teamId: req.team.id,
      itemId,
      pricePaid: finalPrice
    });

    await Transaction.create({
      teamId: req.team.id,
      round: 2,
      amount: -finalPrice,
      type: 'marketPurchase',
      description: `Purchased: ${item.name}`
    });

    if (item.name === 'Syntax Shield') {
      const endTime = new Date(Date.now() + 10 * 60 * 1000); // +10 mins
      await SyntaxShield.findOneAndUpdate(
        { teamId: req.team.id },
        { 
          startTime: new Date(), 
          endTime, 
          isActive: true 
        },
        { upsert: true, new: true }
      );
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('wallet_updated', { teamId: req.team.id });
      io.emit('leaderboard_updated');
      io.emit('market_purchase', { teamId: req.team.id, itemName: item.name });
    }

    res.json({ success: true, item: item.name, paid: finalPrice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
