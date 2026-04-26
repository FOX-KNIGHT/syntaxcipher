const express = require("express");
const multer = require("multer");
const path = require("path");
const { CipherConfig } = require("../models");
const { verifyJudge, verifyTeam } = require("../middleware/auth");

const router = express.Router();
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Admin: set Round 2 config & broadcast via socket
router.post("/round2", verifyJudge, async (req, res) => {
  const { assignedTeamName, passwordWord, folderCipher, passwordCipher1, passwordCipher2 } = req.body;
  try {
    const config = await CipherConfig.findOneAndUpdate(
      { round: 2 },
      { assignedTeamName, passwordWord, folderCipher, passwordCipher1, passwordCipher2 },
      { upsert: true, new: true }
    );
    
    // Broadcast to all connected participants via Socket.io
    req.app.get("io").emit("round2:config", {
      assignedTeamName,
      folderCipher: folderCipher.name,
      passwordCipher1: passwordCipher1.name,
      passwordCipher2: passwordCipher2.name,
      passwordWord,
    });
    res.json({ success: true, config });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update config" });
  }
});

// Admin: upload vault ZIP for Round 3
router.post("/round3/vault", verifyJudge, upload.single("vault"), async (req, res) => {
  const { correctFlag, vaultCiphers } = req.body;
  try {
    await CipherConfig.findOneAndUpdate(
      { round: 3 },
      {
        correctFlag,
        vaultCiphers: typeof vaultCiphers === 'string' ? JSON.parse(vaultCiphers) : vaultCiphers,
        vaultFilePath: req.file.path,
      },
      { upsert: true, new: true }
    );
    res.json({ success: true, path: req.file.path });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload vault" });
  }
});

// Participant: get Round 2 config (no cipher params, just names)
router.get("/round2", verifyTeam, async (req, res) => {
  try {
    const config = await CipherConfig.findOne({ round: 2 });
    if (!config) return res.status(404).json({ message: "Config not announced yet" });
    
    res.json({
      assignedTeamName: config.assignedTeamName,
      passwordWord: config.passwordWord,
      folderCipherName: config.folderCipher?.name,
      passwordCipher1Name: config.passwordCipher1?.name,
      passwordCipher2Name: config.passwordCipher2?.name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get config" });
  }
});

// Participant: download vault
router.get("/round3/vault", verifyTeam, async (req, res) => {
  try {
    const config = await CipherConfig.findOne({ round: 3 });
    if (!config || !config.vaultFilePath) {
      return res.status(404).json({ message: "Vault not ready" });
    }
    res.download(path.resolve(config.vaultFilePath), "vault.zip");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to download vault" });
  }
});

module.exports = router;
