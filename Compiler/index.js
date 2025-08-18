const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const { generateFile } = require("./generateFile");
const executeCpp = require("./executeCpp");
const executeC = require("./executeC");
const executePy = require("./executePy");

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const PORT = process.env.PORT || 8000;

// Ensure required directories exist
const ensureDirectories = () => {
  const dirs = ["codes", "outputs"];
  dirs.forEach((dir) => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    }
  });
};

ensureDirectories();

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Debug endpoint to check available compilers
app.get("/debug", (req, res) => {
  const { spawn } = require("child_process");

  const checkCommands = [
    { name: "gcc", args: ["--version"] },
    { name: "g++", args: ["--version"] },
    { name: "python3", args: ["--version"] },
  ];

  const results = {};
  let completed = 0;

  checkCommands.forEach(({ name, args }) => {
    const proc = spawn(name, args, { timeout: 5000 });

    let output = "";
    let error = "";

    proc.stdout.on("data", (data) => {
      output += data.toString();
    });

    proc.stderr.on("data", (data) => {
      error += data.toString();
    });

    proc.on("close", (code) => {
      results[name] = {
        available: code === 0,
        version: output || error,
        exitCode: code,
      };

      completed++;
      if (completed === checkCommands.length) {
        res.json({
          status: "debug_complete",
          compilers: results,
          environment: {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            cwd: process.cwd(),
            directories: {
              codes: fs.existsSync(path.join(__dirname, "codes")),
              outputs: fs.existsSync(path.join(__dirname, "outputs")),
            },
          },
        });
      }
    });

    proc.on("error", (err) => {
      results[name] = {
        available: false,
        error: err.message,
      };

      completed++;
      if (completed === checkCommands.length) {
        res.json({
          status: "debug_complete",
          compilers: results,
          environment: {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            cwd: process.cwd(),
          },
        });
      }
    });
  });
});

// Execute code endpoint
app.post("/execute", async (req, res) => {
  console.log("=== EXECUTE REQUEST ===dd");
  console.log("Headers:", req.headers);
  console.log("Body:", {
    format: req.body.format,
    codeLength: req.body.code?.length,
    hasInput: !!req.body.input,
  });

  try {
    const { code, format, input } = req.body;

    // Validation
    if (!code || !format) {
      return res.status(400).json({
        error: "Code and format are required",
        received: { code: !!code, format: !!format },
      });
    }

    if (!["cpp", "c", "py"].includes(format)) {
      return res.status(400).json({
        error: `Unsupported language: ${format}. Supported: cpp, c, py`,
      });
    }

    console.log(`Executing ${format} code (${code.length} chars)`);
    console.log(`Input: ${input ? input.substring(0, 50) + "..." : "No input"}`);

    // Generate file
    const filePath = generateFile(format, code);
    console.log(`Generated file: ${filePath}`);

    let output;

    // Execute based on language
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
    }

    console.log("Execution successful");
    console.log(`Output (${output.length} chars): ${output.substring(0, 200)}...`);

    // Clean up source file
    try {
      fs.unlinkSync(filePath);
    } catch (cleanupError) {
      console.warn("Could not delete source file:", cleanupError.message);
    }

    res.json({ output });
  } catch (error) {
    console.error("=== EXECUTION ERROR ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);

    res.status(500).json({
      error: "Code execution failed",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    error: "Internal server error",
    message: error.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    availableEndpoints: ["/health", "/debug", "/execute"],
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Compiler service listening on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Debug info: http://localhost:${PORT}/debug`);
});
