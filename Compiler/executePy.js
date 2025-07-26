const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const executePy = async (filePath, input = "") => {
  const isWindows = os.platform() === "win32";
  const pythonCommand = isWindows ? "py" : "python3";

  return new Promise((resolve, reject) => {
    const run = spawn(pythonCommand, [filePath], { shell: true });

    let stdout = "";
    let stderr = "";

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

    if (input) {
      run.stdin.write(input);
    }
    run.stdin.end();
  });
};

module.exports = executePy;
