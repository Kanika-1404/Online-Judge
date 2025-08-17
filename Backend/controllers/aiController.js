const { generateReview } = require("../Ai-review.js");
const { executeCode } = require("../services/compilerService");

const runCode = async (req, res) => {
  try {
    const { code, format, input } = req.body;
    if (!code || !format) {
      return res.status(400).json({ error: "Code and format are required" });
    }

    const result = await executeCode(code, format, input);
    res.json(result);
  } catch (error) {
    console.error("Compiler service error:", error);
    res.status(500).json({
      error: "Failed to execute code",
      details: error.message,
    });
  }
};

const getAiReview = async (req, res) => {
  try {
    const { question, code } = req.body;
    if (!question || !code) {
      return res.status(400).json({ error: "Question and code are required" });
    }
    const review = await generateReview(question, code);
    res.json({ review });
  } catch (error) {
    res.status(500).json({ error: "Error generating AI review" });
  }
};

module.exports = {
  runCode,
  getAiReview,
};
