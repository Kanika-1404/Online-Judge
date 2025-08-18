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

const PORT = process.env.PORT || 4000;

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

// Execute code endpoint (secured)
app.post("/execute", async (req, res) => {
  console.log("=== EXECUTE REQUEST ===");
  console.log("Headers:", req.headers);

  try {
    const { code, format, input } = req.body;

    // Validation
    if (!code || !format) {
      return res.status(400).json({ error: "Code and format are required" });
    }

    if (!["cpp", "c", "py"].includes(format)) {
      return res.status(400).json({
        error: `Unsupported language: ${format}. Supported: cpp, c, py`,
      });
    }

    // Limit input size to prevent memory abuse
    const safeInput = input ? input.substring(0, 10000) : ""; // max 10k chars

    // Language-specific timeouts (ms)
    const TIMEOUTS = { c: 3000, cpp: 3000, py: 5000 };

    // Generate file
    const filePath = generateFile(format, code);

    let output;

    // Wrapper function to run code with timeout
    const runWithTimeout = async (executeFn) => {
      return Promise.race([
        executeFn(filePath, safeInput),
        new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  `${format.toUpperCase()} execution timed out (${TIMEOUTS[format]}ms)`
                )
              ),
            TIMEOUTS[format]
          )
        ),
      ]);
    };

    switch (format) {
      case "cpp":
        output = await runWithTimeout(executeCpp);
        break;
      case "c":
        output = await runWithTimeout(executeC);
        break;
      case "py":
        output = await runWithTimeout(executePy);
        break;
    }

    // Clean up source file
    try {
      fs.unlinkSync(filePath);
    } catch {}

    res.json({ output });
  } catch (error) {
    console.error("=== EXECUTION ERROR ===", error);
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
