const mongoose = require("mongoose");

// ============================================
// TEAM
// ============================================
const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isLead: { type: Boolean, default: false }
}, { timestamps: true });

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true, length: 6 },
  members: [memberSchema],
  wallet: { type: Number, default: 0 },
  tokens: { type: Number, default: 0 },
  loans: { type: Number, default: 0 },
  r4_captured: { type: [Number], default: [] },
  r4_done: { type: Boolean, default: false },
  r4_hint_cost: { type: Number, default: 0 }
}, { timestamps: true });

const Team = mongoose.model("Team", teamSchema);

// ============================================
// WALLET TRANSACTION
// ============================================
const transactionSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  round: { type: Number },
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  description: { type: String }
}, { timestamps: true });

const Transaction = mongoose.model("Transaction", transactionSchema);

// ============================================
// ROUNDS
// ============================================
const roundSchema = new mongoose.Schema({
  roundId: { type: Number, required: true, unique: true }, // 0 to 5
  name: { type: String, required: true },
  startTime: { type: Date },
  endTime: { type: Date },
  durationS: { type: Number },
  isActive: { type: Boolean, default: false }
});

const Round = mongoose.model("Round", roundSchema);

// ============================================
// JUDGE CONFIG
// ============================================
const judgeConfigSchema = new mongoose.Schema({
  currentRound: { type: Number, default: 0 },
  timerEndsAt: { type: Date },
  announcement: { type: String }
});

const JudgeConfig = mongoose.model("JudgeConfig", judgeConfigSchema);

// ============================================
// OBITUARY (Round 1)
// ============================================
const obituarySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  rootCauseHint: { type: String },
  phoenixElements: [{ type: String }]
});

const Obituary = mongoose.model("Obituary", obituarySchema);

const teamRound1Schema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true, unique: true },
  obituaryId: { type: mongoose.Schema.Types.ObjectId, ref: "Obituary" },
  rootCause: { type: String },
  companyName: { type: String },
  tagline: { type: String },
  pivot: { type: String },
  targetMarket: { type: String },
  marketingHook: { type: String },
  feasibilitySignal: { type: String },
  valuationBet: { type: Number, default: 0 },
  coinsAwarded: { type: Number, default: 0 },
  isLocked: { type: Boolean, default: false },
  submittedAt: { type: Date }
});

const TeamRound1 = mongoose.model("TeamRound1", teamRound1Schema);

// ============================================
// BUYABLE ITEMS & PURCHASES (Round 2 Market)
// ============================================
const buyableItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  price: { type: Number, required: true },
  colorClass: { type: String }
});

const BuyableItem = mongoose.model("BuyableItem", buyableItemSchema);

const marketPurchaseSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "BuyableItem", required: true },
  pricePaid: { type: Number, required: true }
}, { timestamps: true });

// Ensure unique team_id + item_id combination
marketPurchaseSchema.index({ teamId: 1, itemId: 1 }, { unique: true });

const MarketPurchase = mongoose.model("MarketPurchase", marketPurchaseSchema);

// ============================================
// CIPHER CONFIG
// ============================================
const cipherConfigSchema = new mongoose.Schema({
  round: { type: Number, required: true, unique: true }, // 2 or 3
  assignedTeamName: { type: String },
  passwordWord: { type: String },
  folderCipher: { type: mongoose.Schema.Types.Mixed },
  passwordCipher1: { type: mongoose.Schema.Types.Mixed },
  passwordCipher2: { type: mongoose.Schema.Types.Mixed },
  vaultCiphers: { type: mongoose.Schema.Types.Mixed },
  correctFlag: { type: String },
  vaultFilePath: { type: String },
  bonusRankCounter: { type: Number, default: 0 }
}, { timestamps: true });

const CipherConfig = mongoose.model("CipherConfig", cipherConfigSchema);

// ============================================
// SUBMISSIONS
// ============================================
const submissionSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  round: { type: Number, required: true },
  type: { type: String, required: true },
  score: { type: Number, default: 0 },
  breakdown: { type: mongoose.Schema.Types.Mixed },
  errors: { type: mongoose.Schema.Types.Mixed },
  filePath: { type: String },
  correct: { type: Boolean },
  flag: { type: String },
  rank: { type: Number }
}, { timestamps: true });

const Submission = mongoose.model("Submission", submissionSchema);

// ============================================
// CHALLENGE TOKENS (Round 2)
// ============================================
const challengeTokenSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  tier: { type: String, default: "easy" },
  tokensEarned: { type: Number, default: 1 },
  success: { type: Boolean, default: true }
}, { timestamps: true });

const ChallengeToken = mongoose.model("ChallengeToken", challengeTokenSchema);

// ============================================
// ROUND 3 OPERATIONS
// ============================================
const round3OperationSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  operationType: { type: String, required: true },
  amount: { type: Number, required: true },
  isUndone: { type: Boolean, default: false }
}, { timestamps: true });

const Round3Operation = mongoose.model("Round3Operation", round3OperationSchema);

// ============================================
// SYNTAX SHIELDS
// ============================================
const syntaxShieldSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true, unique: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
});

const SyntaxShield = mongoose.model("SyntaxShield", syntaxShieldSchema);

// ============================================
// TALENT SHOW
// ============================================
const talentShowSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true, unique: true },
  selfRating: { type: Number },
  judgeScore: { type: Number },
  isMatch: { type: Boolean },
  cashInjection: { type: Number, default: 0 },
  loanAmount: { type: Number, default: 0 },
  resolved: { type: Boolean, default: false }
}, { timestamps: true });

const TalentShow = mongoose.model("TalentShow", talentShowSchema);

// ============================================
// ROUND 4 LAYERS
// ============================================
const round4LayerSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  layer: { type: Number, required: true, min: 1, max: 5 },
  answerSubmitted: { type: String },
  isCorrect: { type: Boolean, default: false },
  coinsOnHints: { type: Number, default: 0 },
  submittedAt: { type: Date }
});
round4LayerSchema.index({ teamId: 1, layer: 1 }, { unique: true });

const Round4Layer = mongoose.model("Round4Layer", round4LayerSchema);

// ============================================
// ROUND 5 AUDIT
// ============================================
const round5AuditSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true, unique: true },
  finalInvestment: { type: Number, default: 0 },
  netWorth: { type: Number },
  productScore: { type: Number, default: 0 },
  techScore: { type: Number, default: 0 },
  marketScore: { type: Number, default: 0 },
  presentationScore: { type: Number, default: 0 },
  isChampion: { type: Boolean, default: false },
  finalizedAt: { type: Date }
});

// Calculate total score virtually
round5AuditSchema.virtual('totalScore').get(function() {
  return (this.productScore || 0) * 0.3 + 
         (this.techScore || 0) * 0.3 + 
         (this.marketScore || 0) * 0.25 + 
         (this.presentationScore || 0) * 0.15;
});

const Round5Audit = mongoose.model("Round5Audit", round5AuditSchema);

module.exports = {
  Team,
  Transaction,
  Round,
  JudgeConfig,
  Obituary,
  TeamRound1,
  BuyableItem,
  MarketPurchase,
  CipherConfig,
  Submission,
  ChallengeToken,
  Round3Operation,
  SyntaxShield,
  TalentShow,
  Round4Layer,
  Round5Audit
};
