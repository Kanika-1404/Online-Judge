const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const {
  submitCode,
  getSubmissions,
  getUserAccuracy,
} = require("../controllers/submissionController");

router.post("/submit-code", authenticateToken, submitCode);
router.get("/submissions/:questionId", authenticateToken, getSubmissions);
router.get("/api/user/accuracy/:userId?", authenticateToken, getUserAccuracy);

module.exports = router;
