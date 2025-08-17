const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const executePy = async (filePath, input = "") => {
  let pythonCommand = "python3";
  if (os.platform() === "win32") {
    pythonCommand = "py"; // fallback for Windows
  }

  const absPath = path.resolve(filePath);

  return new Promise((resolve, reject) => {
    const run = spawn(pythonCommand, [absPath], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    run.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    run.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    run.on("error", (err) => reject(err));

    const timer = setTimeout(() => {
      run.kill("SIGKILL");
      reject(new Error("Execution timed out"));
    }, 5000);

    run.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(stderr || `Execution failed with exit code ${code}`));
      } else {
        resolve(stdout.trim());
      }
    });

    if (input && input.trim()) {
      run.stdin.write(input.endsWith("\n") ? input : input + "\n");
      run.stdin.end();
    }
    // ❌ previously you were always ending stdin
    // ✅ now we only end stdin if input is provided
  });
};

module.exports = executePy;
