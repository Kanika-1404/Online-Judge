const express = require("express");
const cors = require("cors");
const app = express();
const { generateFile } = require("./generateFile");
const executeCpp = require("./executeCpp");
const executeC = require("./executeC");
const executePy = require("./executePy");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8000;

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// Execute code endpoint
app.post("/execute", async (req, res) => {
  try {
    const { code, format, input } = req.body;
    
    if (!code || !format) {
      return res.status(400).json({ error: "Code and format are required" });
    }

    const filePath = generateFile(format, code);
    let output;

    switch (format) {
      case "cpp":
        output = await executeCpp(filePath, input || "");
        break;
      case "c":
        output = await executeC(filePath, input || "");
        break;
      case "py":
        output = await executePy(filePath, input || "");
        break;
      default:
        return res.status(400).json({ error: `Language ${format} is not supported yet.` });
    }

    res.json({ output });
  } catch (error) {
    console.error("Execution error:", error);
    res.status(500).json({ 
      error: error.message || "Execution failed",
      details: error.toString()
    });
  }
});

app.listen(PORT, () => {
  console.log(`Compiler service listening on port ${PORT}`);
});
