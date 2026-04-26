const { CipherConfig, Submission, Team } = require("../models");

const BONUS_POINTS = [50, 45, 40, 30]; // index 0=first, 1=second, 2=third, 3+=rest

async function submitFlag(req, res) {
  const { flag } = req.body;

  try {
    // Atomic findOneAndUpdate increment — prevents race conditions
    // Only increments if flag is correct
    const config = await CipherConfig.findOneAndUpdate(
      { round: 3, correctFlag: flag },
      { $inc: { bonusRankCounter: 1 } },
      { new: true }
    );

    if (!config) {
      await Submission.create({
        teamId: req.team.id, 
        round: 3,
        type: "flag", 
        correct: false, 
        flag
      });
      return res.json({ correct: false, message: "Incorrect flag. Try again." });
    }

    // bonusRankCounter was incremented, so -1 gives their rank (0-indexed)
    const rank = config.bonusRankCounter - 1;
    const bonus = BONUS_POINTS[Math.min(rank, 3)];
    const taskPoints = 20; // always awarded for correct password decode
    const total = taskPoints + bonus;

    await Submission.create({
      teamId: req.team.id, 
      round: 3,
      type: "flag", 
      correct: true, 
      flag,
      score: total, 
      rank: rank + 1
    });

    await Team.findByIdAndUpdate(req.team.id, { $inc: { wallet: total } });

    // Emit leaderboard refresh
    req.app.get("io").emit("leaderboard:update");

    res.json({
      correct: true,
      rank: rank + 1,
      taskPoints,
      bonusPoints: bonus,
      total,
      message: rank === 0 ? "🏆 First blood!" : rank === 1 ? "⚡ Second!" : rank === 2 ? "🔥 Third!" : "✅ Flag captured!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during flag submission" });
  }
}

module.exports = { submitFlag };
