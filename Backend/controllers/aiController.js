// controllers/aiController.js
const { generateReview } = require("../Ai-review.js");
const { executeCode } = require("../services/compilerService");

const runCode = async (req, res) => {
  try {
    const { code, format, input } = req.body;

    console.log("=== RUN CODE REQUEST ===");
    console.log("Language:", format);
    console.log("Input provided:", input ? "Yes" : "No");
    console.log("Code length:", code ? code.length : 0);

    if (!code || !format) {
      return res.status(400).json({ error: "Code and format are required" });
    }

    // Ensure COMPILER_URL is configured
    if (!process.env.COMPILER_URL) {
      return res.status(500).json({ error: "COMPILER_URL not configured in environment" });
    }

    const result = await executeCode(code, format, input);

    return res.json({
      success: true,
      output: result.stdout || result.output || "",
      error: result.stderr || result.error || "",
      executionTime: result.executionTime || null,
    });
    
  } catch (error) {
    console.error("=== ERROR IN RUN CODE ===");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    return res.status(500).json({
      success: false,
      error: "Failed to execute code",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

const getAiReview = async (req, res) => {
  try {
    const { question, code } = req.body;

    if (!question || !code) {
      return res.status(400).json({ error: "Question and code are required" });
    }

    console.log("=== AI REVIEW REQUEST ===");
    console.log("Question:", question.substring(0, 50) + "...");
    console.log("Code length:", code.length);

    const review = await generateReview(question, code);

    return res.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("=== ERROR IN AI REVIEW ===");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    return res.status(500).json({
      success: false,
      error: "Error generating AI review",
      details: error.message,
    });
  }
};

module.exports = {
  runCode,
  getAiReview,
};