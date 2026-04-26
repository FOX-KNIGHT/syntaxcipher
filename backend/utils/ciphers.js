// backend/utils/ciphers.js
// All 11 ciphers used in SyntaxCipher — encode + decode for each

// ─── 1. CAESAR ────────────────────────────────────────────────────────────────
function caesar(text, shift, decrypt = false) {
  const s = decrypt ? (26 - (shift % 26)) % 26 : shift % 26;
  return text.toUpperCase().replace(/[A-Z]/g, (ch) =>
    String.fromCharCode(((ch.charCodeAt(0) - 65 + s) % 26) + 65)
  );
}

// ─── 2. ATBASH ────────────────────────────────────────────────────────────────
function atbash(text) {
  return text.toUpperCase().replace(/[A-Z]/g, (ch) =>
    String.fromCharCode(90 - (ch.charCodeAt(0) - 65))
  );
}

// ─── 3. VIGENÈRE ──────────────────────────────────────────────────────────────
function vigenere(text, key, decrypt = false) {
  const t = text.toUpperCase().replace(/[^A-Z]/g, "");
  const k = key.toUpperCase().replace(/[^A-Z]/g, "");
  let result = "", ki = 0;
  for (const ch of t) {
    const shift = k[ki % k.length].charCodeAt(0) - 65;
    const enc = decrypt
      ? ((ch.charCodeAt(0) - 65 - shift + 26) % 26) + 65
      : ((ch.charCodeAt(0) - 65 + shift) % 26) + 65;
    result += String.fromCharCode(enc);
    ki++;
  }
  return result;
}

// ─── 4. PLAYFAIR ──────────────────────────────────────────────────────────────
function buildPlayfairMatrix(key) {
  const k = (key + "ABCDEFGHIKLMNOPQRSTUVWXYZ")
    .toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "");
  const seen = new Set(), mat = [];
  for (const ch of k) {
    if (!seen.has(ch)) { seen.add(ch); mat.push(ch); }
    if (mat.length === 25) break;
  }
  return mat;
}

function playfairPos(mat, ch) {
  const i = mat.indexOf(ch);
  return [Math.floor(i / 5), i % 5];
}

function playfair(text, key, decrypt = false) {
  const mat = buildPlayfairMatrix(key);
  const t = text.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "");
  const pairs = [];
  let i = 0;
  while (i < t.length) {
    const a = t[i];
    const b = i + 1 < t.length && t[i + 1] !== a ? t[i + 1] : "X";
    pairs.push([a, b]);
    i += t[i + 1] && t[i + 1] !== a ? 2 : 1;
  }
  return pairs.map(([a, b]) => {
    const [ra, ca] = playfairPos(mat, a);
    const [rb, cb] = playfairPos(mat, b);
    const d = decrypt ? -1 : 1;
    if (ra === rb) {
      return mat[ra * 5 + ((ca + d + 5) % 5)] + mat[rb * 5 + ((cb + d + 5) % 5)];
    } else if (ca === cb) {
      return mat[((ra + d + 5) % 5) * 5 + ca] + mat[((rb + d + 5) % 5) * 5 + cb];
    } else {
      return mat[ra * 5 + cb] + mat[rb * 5 + ca];
    }
  }).join("");
}

// ─── 5. ROW TRANSPOSITION ─────────────────────────────────────────────────────
function rowTransposition(text, key, decrypt = false) {
  const t = text.toUpperCase().replace(/[^A-Z]/g, "");
  const order = key.split("").map(Number);
  const cols = order.length;
  const rows = Math.ceil(t.length / cols);
  const padded = t.padEnd(rows * cols, "X");

  if (!decrypt) {
    const grid = Array.from({ length: rows }, (_, r) =>
      padded.slice(r * cols, r * cols + cols).split("")
    );
    return order
      .map((_, ci) => {
        const colIdx = order.indexOf(ci + 1);
        return grid.map((row) => row[colIdx]).join("");
      })
      .join("");
  } else {
    const colLengths = Array(cols).fill(rows);
    const grid = Array.from({ length: rows }, () => Array(cols).fill(""));
    let idx = 0;
    order.forEach((o, ci) => {
      const col = order.indexOf(ci + 1);
      for (let r = 0; r < colLengths[col]; r++) {
        grid[r][col] = t[idx++];
      }
    });
    return grid.map((row) => row.join("")).join("");
  }
}

// ─── 6. HILL ──────────────────────────────────────────────────────────────────
function matMulMod(A, B, mod) {
  const n = A.length;
  return A.map((row) =>
    B[0].map((_, j) =>
      row.reduce((sum, _, k) => sum + A[row.indexOf(_) < 0 ? 0 : row.indexOf(_)][k] * B[k][j], 0) % mod
    )
  );
}

function hill(text, keyMatrix, decrypt = false) {
  const t = text.toUpperCase().replace(/[^A-Z]/g, "");
  const padded = t.length % 2 !== 0 ? t + "X" : t;
  let mat = keyMatrix; // [[a,b],[c,d]]

  if (decrypt) {
    const [[a, b], [c, d]] = mat;
    const det = ((a * d - b * c) % 26 + 26) % 26;
    const detInv = [...Array(26)].findIndex((_, i) => (det * i) % 26 === 1);
    mat = [
      [(detInv * d % 26 + 26) % 26, (detInv * (-b) % 26 + 26) % 26],
      [(detInv * (-c) % 26 + 26) % 26, (detInv * a % 26 + 26) % 26],
    ];
  }

  let result = "";
  for (let i = 0; i < padded.length; i += 2) {
    const v = [padded.charCodeAt(i) - 65, padded.charCodeAt(i + 1) - 65];
    result +=
      String.fromCharCode(((mat[0][0] * v[0] + mat[0][1] * v[1]) % 26) + 65) +
      String.fromCharCode(((mat[1][0] * v[0] + mat[1][1] * v[1]) % 26) + 65);
  }
  return result;
}

// ─── 7. BEAUFORT ──────────────────────────────────────────────────────────────
function beaufort(text, key) {
  const t = text.toUpperCase().replace(/[^A-Z]/g, "");
  const k = key.toUpperCase().replace(/[^A-Z]/g, "");
  return t
    .split("")
    .map((ch, i) => {
      const ki = k[i % k.length].charCodeAt(0) - 65;
      const ci = ch.charCodeAt(0) - 65;
      return String.fromCharCode(((ki - ci + 26) % 26) + 65);
    })
    .join("");
}

// ─── 8. DOUBLE TRANSPOSITION ──────────────────────────────────────────────────
function doubleTransposition(text, key1, key2, decrypt = false) {
  if (!decrypt) {
    return rowTransposition(rowTransposition(text, key1, false), key2, false);
  } else {
    return rowTransposition(rowTransposition(text, key2, true), key1, true);
  }
}

// ─── 9. AUTOKEY ───────────────────────────────────────────────────────────────
function autokey(text, key, decrypt = false) {
  const t = text.toUpperCase().replace(/[^A-Z]/g, "");
  const k = key.toUpperCase().replace(/[^A-Z]/g, "");
  let result = "", fullKey = k;

  if (!decrypt) {
    fullKey = k + t;
    for (let i = 0; i < t.length; i++) {
      result += String.fromCharCode(((t.charCodeAt(i) - 65 + fullKey.charCodeAt(i) - 65) % 26) + 65);
    }
  } else {
    let plain = "";
    for (let i = 0; i < t.length; i++) {
      const ki = i < k.length ? k.charCodeAt(i) - 65 : plain.charCodeAt(i - k.length) - 65;
      const p = ((t.charCodeAt(i) - 65 - ki + 26) % 26) + 65;
      plain += String.fromCharCode(p);
    }
    result = plain;
  }
  return result;
}

// ─── 10. AFFINE ───────────────────────────────────────────────────────────────
function affine(text, a, b, decrypt = false) {
  const t = text.toUpperCase().replace(/[^A-Z]/g, "");
  if (!decrypt) {
    return t.replace(/[A-Z]/g, (ch) =>
      String.fromCharCode(((a * (ch.charCodeAt(0) - 65) + b) % 26) + 65)
    );
  } else {
    const aInv = [...Array(26)].findIndex((_, i) => (a * i) % 26 === 1);
    return t.replace(/[A-Z]/g, (ch) =>
      String.fromCharCode(((aInv * ((ch.charCodeAt(0) - 65 - b + 26))) % 26) + 65)
    );
  }
}

// ─── 11. RAIL FENCE ───────────────────────────────────────────────────────────
function railFence(text, rails, decrypt = false) {
  const t = text.toUpperCase().replace(/[^A-Z]/g, "");
  if (!decrypt) {
    const fence = Array.from({ length: rails }, () => []);
    let rail = 0, dir = 1;
    for (const ch of t) {
      fence[rail].push(ch);
      if (rail === 0) dir = 1;
      if (rail === rails - 1) dir = -1;
      rail += dir;
    }
    return fence.flat().join("");
  } else {
    const len = t.length;
    const pattern = Array(len).fill(0);
    let rail = 0, dir = 1;
    for (let i = 0; i < len; i++) {
      pattern[i] = rail;
      if (rail === 0) dir = 1;
      if (rail === rails - 1) dir = -1;
      rail += dir;
    }
    const indices = Array.from({ length: rails }, (_, r) =>
      pattern.map((p, i) => (p === r ? i : -1)).filter((x) => x !== -1)
    );
    const result = Array(len);
    let si = 0;
    for (const group of indices) {
      for (const idx of group) result[idx] = t[si++];
    }
    return result.join("");
  }
}

// ─── DISPATCHER (used server-side for validation) ─────────────────────────────
function applyCipher(cipherName, text, params, decrypt = false) {
  if(!params) params = {};
  switch (cipherName.toLowerCase().replace(/\s/g, "")) {
    case "caesar":       return caesar(text, params.shift, decrypt);
    case "atbash":       return atbash(text); // reciprocal
    case "vigenere":     return vigenere(text, params.key, decrypt);
    case "playfair":     return playfair(text, params.key, decrypt);
    case "rowtransposition": return rowTransposition(text, params.key, decrypt);
    case "hill":         return hill(text, params.matrix, decrypt);
    case "beaufort":     return beaufort(text, params.key); // reciprocal
    case "doubletransposition": return doubleTransposition(text, params.key1, params.key2, decrypt);
    case "autokey":      return autokey(text, params.key, decrypt);
    case "affine":       return affine(text, params.a, params.b, decrypt);
    case "railfence":    return railFence(text, params.rails, decrypt);
    default: throw new Error(`Unknown cipher: ${cipherName}`);
  }
}

module.exports = {
  caesar, atbash, vigenere, playfair, rowTransposition, hill,
  beaufort, doubleTransposition, autokey, affine, railFence,
  applyCipher
};
