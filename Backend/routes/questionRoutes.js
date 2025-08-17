const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const {
  getQuestions,
  getQuestion,
  addQuestion,
  editQuestion,
  removeQuestion,
  getQuestionAccuracy,
} = require("../controllers/questionController");

router.get("/questions", getQuestions);
router.get("/questions/:id", getQuestion);
router.get("/api/question/accuracy/:id", getQuestionAccuracy);

router.post("/questions", authenticateToken, addQuestion);
router.put("/questions/:id", authenticateToken, editQuestion);
router.delete("/questions/:id", authenticateToken, removeQuestion);

module.exports = router;