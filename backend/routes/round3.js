// backend/routes/round3.js
const express = require("express");
const { submitFlag } = require("../controllers/round3Controller");
const { verifyTeam } = require("../middleware/auth");

const router = express.Router();

router.post("/submit", verifyTeam, submitFlag);

module.exports = router;
