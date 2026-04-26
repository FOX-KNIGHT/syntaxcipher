// backend/routes/round2.js
const express = require("express");
const multer = require("multer");
const { submitRound2 } = require("../controllers/round2Controller");
const { verifyTeam } = require("../middleware/auth");

const router = express.Router();
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.post("/submit", verifyTeam, upload.single("vault"), submitRound2);

module.exports = router;
