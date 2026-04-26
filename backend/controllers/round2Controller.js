const AdmZip = require("adm-zip");
const { CipherConfig, Submission, Team } = require("../models");
const { applyCipher } = require("../utils/ciphers");

async function submitRound2(req, res) {
  try {
    const config = await CipherConfig.findOne({ round: 2 });
    if (!config) return res.status(400).json({ message: "Round 2 not configured yet" });

    const { assignedTeamName, passwordWord, folderCipher, passwordCipher1, passwordCipher2 } = config;

    // ── Compute expected values server-side ──────────────────────────────────
    const expectedFolderName = applyCipher(folderCipher.name, assignedTeamName, folderCipher.params);
    const afterCipher1 = applyCipher(passwordCipher1.name, passwordWord, passwordCipher1.params);
    const expectedPassword = applyCipher(passwordCipher2.name, afterCipher1, passwordCipher2.params);

    // ── Open uploaded ZIP ────────────────────────────────────────────────────
    const zip = new AdmZip(req.file.path);
    let score = 0;
    const breakdown = { folderName: 0, cipher1: 0, cipher2: 0 };
    const errors = [];

    // ── Check 1: folder name (10 pts) ────────────────────────────────────────
    const entries = zip.getEntries();
    const folderEntry = entries.find(
      (e) => e.isDirectory && e.entryName.replace(/\/$/, "") === expectedFolderName
    );
    if (folderEntry) {
      breakdown.folderName = 10;
      score += 10;
    } else {
      errors.push(`Folder name mismatch. Expected: ${expectedFolderName}`);
    }

    // ── Check 2 & 3: password validation via trying to open ZIP ─────────────
    try {
      const txtEntry = entries.find((e) => e.entryName.endsWith(".txt"));
      if (txtEntry) {
        let content;
        try {
          content = zip.readAsText(txtEntry, expectedPassword);
        } catch (e) {
          throw new Error("Password incorrect");
        }
        
        if (content.trim().toUpperCase() === assignedTeamName.toUpperCase()) {
          breakdown.cipher1 = 10;
          breakdown.cipher2 = 10;
          score += 20;
        } else {
          errors.push("ZIP opened but .txt content doesn't match team name");
        }
      } else {
        errors.push("No .txt file found inside the folder");
      }
    } catch {
      errors.push("ZIP password incorrect — check your cipher application");
    }

    // ── Save submission ──────────────────────────────────────────────────────
    await Submission.create({
      teamId: req.team.id,
      round: 2,
      type: "zip",
      score,
      breakdown,
      errors,
      filePath: req.file.path,
    });

    // Update team score
    await Team.findByIdAndUpdate(req.team.id, { $inc: { wallet: score } });

    res.json({ success: true, score, breakdown, errors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during ZIP validation" });
  }
}

module.exports = { submitRound2 };
