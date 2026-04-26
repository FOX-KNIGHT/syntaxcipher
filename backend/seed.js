const mongoose = require("mongoose");
const connectDB = require("./config/db");
const { Round, Obituary, BuyableItem, JudgeConfig } = require("./models");

const roundsData = [
  { roundId: 0, name: 'Registration', durationS: 0 },
  { roundId: 1, name: 'Dead Startup Resurrection', durationS: 5400 },
  { roundId: 2, name: 'Resource Market', durationS: 1800 },
  { roundId: 3, name: 'Syntax Toll', durationS: 1200 },
  { roundId: 4, name: 'CTF Gauntlet', durationS: 1500 },
  { roundId: 5, name: 'Final Showcase & Audit', durationS: 1800 }
];

const obituariesData = [
  { title: 'CryptoMart', description: 'An NFT marketplace for grocery receipts. Raised $2M, pivoted 4 times, burned out in 6 months.', rootCauseHint: 'No real utility — chased hype over problem-solving', phoenixElements: ['Receipt validation', 'Loyalty program', 'Financial tracking'] },
  { title: 'DroneChef', description: 'A drone food delivery startup that forgot to acquire delivery permits. Grounded after week 1.', rootCauseHint: 'Regulatory blindness — product before compliance', phoenixElements: ['Last-mile logistics', 'Smart routing', 'Restaurant partnerships'] },
  { title: 'SleepAI', description: 'An AI sleep coach app that sent push notifications at 3 AM to maximize "engagement".', rootCauseHint: 'Misaligned incentives — engagement over user wellbeing', phoenixElements: ['Sleep hygiene', 'Circadian data', 'Wellness subscription'] },
  { title: 'MetaGym', description: 'A VR fitness app where you exercised in the metaverse. Users preferred actual gyms.', rootCauseHint: 'Wrong medium — forced digitization of physical habits', phoenixElements: ['Social accountability', 'Progress gamification', 'Trainer marketplace'] },
  { title: 'HyperLocal', description: 'A hyper-local delivery app for a single apartment complex. Scaled to 3 users.', rootCauseHint: 'TAM blindness — solved a micro-problem at macro-scale cost', phoenixElements: ['Community commerce', 'Last-100-meter delivery', 'Building OS'] }
];

const itemsData = [
  { name: 'Time Extend', description: 'Add 8 minutes to your active timer', icon: '⏰', price: 400, colorClass: 'cyan' },
  { name: 'Spy Report', description: 'View any rival team\'s current build status', icon: '🔍', price: 300, colorClass: 'purple' },
  { name: 'Mentor Minute', description: '5 minutes of live judge help — any topic', icon: '🧑‍🏫', price: 500, colorClass: 'yellow' },
  { name: 'Debug Pass', description: 'A volunteer finds and marks one bug in your code', icon: '🐛', price: 350, colorClass: 'green' },
  { name: 'UI Kit', description: 'Pre-made HTML/CSS component pack', icon: '🎨', price: 200, colorClass: 'cyan' },
  { name: 'Code Snippet', description: 'One pre-written utility function of your choice', icon: '📝', price: 200, colorClass: 'green' },
  { name: 'API Key', description: 'External API access (weather/maps/news/currency)', icon: '🔑', price: 300, colorClass: 'yellow' },
  { name: 'Syntax Shield', description: 'Immunity from all Syntax Toll for 10 minutes', icon: '🛡️', price: 450, colorClass: 'cyan' },
  { name: 'Feature Swap', description: 'Replace one required feature with an easier one', icon: '🔄', price: 600, colorClass: 'purple' },
  { name: 'Fatal Flaw Peek', description: 'Read any rival team\'s full startup obituary', icon: '💀', price: 350, colorClass: 'red' },
  { name: 'Judge Nudge', description: '2 minutes of direct judge feedback at your station', icon: '⚖️', price: 400, colorClass: 'yellow' },
  { name: 'Freeze Token', description: 'Pause a rival team\'s build timer for 3 minutes', icon: '❄️', price: 700, colorClass: 'red' }
];

const seedData = async () => {
  await connectDB();
  
  try {
    if (await Round.countDocuments() === 0) {
      await Round.insertMany(roundsData);
      console.log('✅ Seeded Rounds');
    }
    
    if (await Obituary.countDocuments() === 0) {
      await Obituary.insertMany(obituariesData);
      console.log('✅ Seeded Obituaries');
    }
    
    if (await BuyableItem.countDocuments() === 0) {
      await BuyableItem.insertMany(itemsData);
      console.log('✅ Seeded BuyableItems');
    }

    if (await JudgeConfig.countDocuments() === 0) {
      await JudgeConfig.create({ currentRound: 0 });
      console.log('✅ Seeded JudgeConfig');
    }

    console.log('🌱 Database seating completed.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
