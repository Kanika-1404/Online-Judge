const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const executePy = async (filePath, input = "") => {
  const isWindows = os.platform() === "win32";
  const pythonCommand = isWindows ? "py" : "python3";

  return new Promise((resolve, reject) => {
    const run = spawn(pythonCommand, [filePath], { 
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = "";
    let stderr = "";

    // Set up event handlers before writing input
    run.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    run.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    run.on("error", (err) => {
      reject(err);
    });

    run.on("close", (code) => {
      if (code !== 0) {
        reject(stderr || `Execution failed with exit code ${code}`);
      } else {
        resolve(stdout);
      }
    });

    // Write input immediately after process starts
    if (input && input.trim()) {
      const formattedInput = input.endsWith('\n') ? input : input + '\n';
      run.stdin.write(formattedInput);
    }
    run.stdin.end();
  });
};

module.exports = executePy;
