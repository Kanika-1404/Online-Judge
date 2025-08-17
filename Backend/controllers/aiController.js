const { generateReview } = require("../Ai-review.js");
const { executeCode } = require("../services/compilerService");

const runCode = async (req, res) => {
  try {
    console.log("=== RUN CODE REQUEST ===");
    console.log("Request body:", req.body);
    console.log("Headers:", req.headers);
    
    const { code, format, input } = req.body;
    
    if (!code || !format) {
      console.log("Missing code or format");
      return res.status(400).json({ error: "Code and format are required" });
    }

    console.log("Attempting to execute code:");
    console.log("Format:", format);
    console.log("Code length:", code.length);
    console.log("Input:", input || "No input provided");
    
    // Check if compiler service is reachable
    const compilerUrl = process.env.COMPILER_URL || "http://localhost:8000";
    console.log("Compiler URL:", compilerUrl);
    
    const result = await executeCode(code, format, input);
    console.log("Execution successful:", result);
    
    res.json(result);
  } catch (error) {
    console.error("=== ERROR IN RUN CODE ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error details:", error);
    
    res.status(500).json({
      error: "Failed to execute code",
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

const getAiReview = async (req, res) => {
  try {
    console.log("=== AI REVIEW REQUEST ===");
    console.log("Request body:", req.body);
    
    const { question, code } = req.body;
    
    if (!question || !code) {
      return res.status(400).json({ error: "Question and code are required" });
    }
    
    console.log("Generating AI review...");
    const review = await generateReview(question, code);
    console.log("AI review generated successfully");
    
    res.json({ review });
  } catch (error) {
    console.error("=== ERROR IN AI REVIEW ===");
    console.error("Error:", error);
    
    res.status(500).json({ error: "Error generating AI review" });
  }
};

module.exports = {
  runCode,
  getAiReview,
};