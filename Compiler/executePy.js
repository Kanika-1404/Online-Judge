const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const executePy = async (filePath, input = "") => {
  const isWindows = os.platform() === "win32";
  // Use python3 explicitly for AWS Linux environment
  const pythonCommand = isWindows ? "python" : "python3";

  return new Promise((resolve, reject) => {
    const run = spawn(pythonCommand, [filePath], { 
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000, // 10 second timeout for execution
      env: { 
        ...process.env,
        PYTHONPATH: process.env.PYTHONPATH || '',
        PYTHONIOENCODING: 'utf-8'
      }
    });

    let stdout = "";
    let stderr = "";

    run.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    run.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    run.on("error", (err) => {
      reject(`Python execution error: ${err.message}`);
    });

    run.on("close", (code) => {
      if (code !== 0) {
        reject(stderr || `Python execution failed with exit code ${code}`);
      } else {
        resolve(stdout);
      }
    });

    // Handle input
    if (input && input.trim()) {
      const formattedInput = input.endsWith('\n') ? input : input + '\n';
      try {
        run.stdin.write(formattedInput);
      } catch (err) {
        console.warn("Error writing input to Python process:", err.message);
      }
    }
    run.stdin.end();
  });
};

module.exports = executePy;



// const { spawn } = require("child_process");
// const fs = require("fs");
// const path = require("path");
// const os = require("os");

// const executePy = async (filePath, input = "") => {
//   const isWindows = os.platform() === "win32";
//   const pythonCommand = isWindows ? "py" : "python3";

//   return new Promise((resolve, reject) => {
//     const run = spawn(pythonCommand, [filePath], { 
//       shell: false,
//       stdio: ['pipe', 'pipe', 'pipe']
//     });

//     let stdout = "";
//     let stderr = "";

//     // Set up event handlers before writing input
//     run.stdout.on("data", (data) => {
//       stdout += data.toString();
//     });

//     run.stderr.on("data", (data) => {
//       stderr += data.toString();
//     });

//     run.on("error", (err) => {
//       reject(err);
//     });

//     run.on("close", (code) => {
//       if (code !== 0) {
//         reject(stderr || `Execution failed with exit code ${code}`);
//       } else {
//         resolve(stdout);
//       }
//     });

//     // Write input immediately after process starts
//     if (input && input.trim()) {
//       const formattedInput = input.endsWith('\n') ? input : input + '\n';
//       run.stdin.write(formattedInput);
//     }
//     run.stdin.end();
//   });
// };

// module.exports = executePy;
