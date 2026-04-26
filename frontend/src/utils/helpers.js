export const fmt = (n) => `₢${Number(n || 0).toLocaleString()}`;

export const fmtTime = (secs) => {
  const s = Math.max(0, Math.floor(secs));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

export const secondsLeft = (endsAt) => {
  if (!endsAt) return null;
  return Math.max(0, Math.floor((new Date(endsAt) - Date.now()) / 1000));
};

export const ROUND_NAMES = {
  0: 'Registration',
  1: 'Dead Startup Resurrection',
  2: 'Resource Market',
  3: 'Syntax Toll',
  4: 'CTF Gauntlet',
  5: 'Final Showcase & Audit',
};

export const ROUND_COLORS = {
  0: '#3a5a7a',
  1: '#818cf8',
  2: '#ffd700',
  3: '#ff0030',
  4: '#00ff41',
  5: '#ffd700',
};

export const CTF_NODES = [
  {
    id: 1, codename: 'NODE-α', domain: 'CSE', color: '#00ff41',
    challenge: 'ARRAY INFILTRATION',
    brief: 'Array: [3,1,4,1,5,9,2,6]\n\nFind the second largest UNIQUE element WITHOUT sorting.\nState your traversal algorithm clearly.',
    answer: '6',
    hints: [
      { text: 'Track two variables: max_val and second_max. Traverse once O(n).', cost: 100 },
      { text: 'if elem > max_val → second_max = max_val, max_val = elem\nelse if elem > second_max AND elem ≠ max_val → second_max = elem', cost: 200 },
      { text: 'ANSWER: 6\nAfter full traversal: max_val=9, second_max=6', cost: 400 },
    ],
  },
  {
    id: 2, codename: 'NODE-β', domain: 'CYBER-SEC', color: '#ff0030',
    challenge: 'SQL INJECTION VECTOR',
    brief: 'Identify the vulnerability:\n\nquery = "SELECT * FROM users WHERE name=\'" + user_input + "\'"\ndb.execute(query)\n\nName the attack. Write the correct patch.',
    answer: 'sql injection',
    hints: [
      { text: "What happens when user_input = ' OR '1'='1 ?", cost: 100 },
      { text: 'User input escapes the string with a quote and injects raw SQL commands directly.', cost: 200 },
      { text: 'ANSWER: SQL Injection\nPatch: Use parameterized queries / prepared statements.', cost: 400 },
    ],
  },
  {
    id: 3, codename: 'NODE-γ', domain: 'IT/NET', color: '#ffd700',
    challenge: 'SUBNET BREACH',
    brief: 'Server A: IP 192.168.1.10 / Mask 255.255.255.0\nServer B: IP 192.168.2.5\n\nA cannot reach B.\nDiagnose root cause and state the fix.',
    answer: 'different subnet',
    hints: [
      { text: '/24 mask → network ID = first 3 octets.', cost: 100 },
      { text: '192.168.1.0 and 192.168.2.0 are two DIFFERENT network segments.', cost: 200 },
      { text: 'ANSWER: Different subnets\nFix: Add a router / configure default gateway.', cost: 400 },
    ],
  },
  {
    id: 4, codename: 'NODE-δ', domain: 'DATA-SCI', color: '#00f5ff',
    challenge: 'MODEL EXPLOIT',
    brief: 'A ML model: 97% accuracy on training data, only 58% on test data.\n\nIdentify the phenomenon.\nProvide 2 concrete countermeasures.',
    answer: 'overfitting',
    hints: [
      { text: 'Model memorized training data, fails on unseen inputs.', cost: 100 },
      { text: 'It learned the noise in training data instead of true patterns.', cost: 200 },
      { text: 'ANSWER: Overfitting\nFix: L2 Regularization, Dropout, Cross-validation.', cost: 400 },
    ],
  },
  {
    id: 5, codename: 'NODE-Ω', domain: 'MASTER-KEY', color: '#bf00ff',
    challenge: 'ZERO-DAY SYNTHESIS',
    brief: 'Combine your captures:\n  α  Second largest element = ?\n  β  Attack type = ?\n  γ  Network root cause = ?\n  δ  ML phenomenon = ?\n\nOne CS concept UNIFIES all four failures.\nIdentify the master key.',
    answer: 'boundary',
    hints: [
      { text: 'Array edges, input validation edges, network edges, decision edges...', cost: 150 },
      { text: 'α=array boundary | β=input boundary failure | γ=network boundary | δ=decision boundary', cost: 300 },
      { text: 'MASTER KEY: BOUNDARY\nAll 4 fail when boundaries are incorrectly handled.', cost: 500 },
    ],
  },
];
