const express = require("express");
const router = express.Router();
const { runCode, getAiReview } = require("../controllers/aiController");

router.post("/api/run-code", runCode);
router.post("/generate-review", getAiReview);

module.exports = router;
