const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Use /tmp for AWS container environment
const outputPath = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(__dirname, "outputs");
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeC = async (filePath, input = "") => {
  const jobID = path.basename(filePath).split(".")[0];
  let outputFilePath = path.join(outputPath, `${jobID}.out`);
  const isWindows = os.platform() === "win32";

  if (isWindows) {
    outputFilePath += ".exe";
  }

  return new Promise((resolve, reject) => {
    // Compilation command
    const compileCommand = isWindows 
      ? `gcc "${filePath}" -o "${outputFilePath}"`
      : `gcc "${filePath}" -o "${outputFilePath}" -lm -lpthread`;

    const compile = spawn("sh", ["-c", compileCommand], {
      timeout: 30000,
      env: { ...process.env, PATH: process.env.PATH }
    });

    let compileError = "";

    compile.stderr.on("data", (data) => {
      compileError += data.toString();
    });

    compile.on("error", (err) => {
      reject(`Compilation process error: ${err.message}`);
    });

    compile.on("close", (code) => {
      if (code !== 0) {
        reject(`Compilation failed: ${compileError || `Exit code ${code}`}`);
        return;
      }

      if (!isWindows) {
        try {
          fs.chmodSync(outputFilePath, '755');
        } catch (err) {
          console.warn("Could not set executable permissions:", err.message);
        }
      }

      const run = spawn(outputFilePath, [], { 
        shell: false,
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: outputPath,
        timeout: 10000,
        env: { ...process.env }
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
        reject(`Execution error: ${err.message}`);
      });

      run.on("close", (code) => {
        try {
          if (fs.existsSync(outputFilePath)) {
            fs.unlinkSync(outputFilePath);
          }
        } catch (err) {
          console.warn("Could not clean up executable:", err.message);
        }

        if (code !== 0) {
          reject(stderr || `Execution failed with exit code ${code}`);
        } else {
          resolve(stdout);
        }
      });

      if (input && input.trim()) {
        const formattedInput = input.endsWith('\n') ? input : input + '\n';
        try {
          run.stdin.write(formattedInput);
        } catch (err) {
          console.warn("Error writing input:", err.message);
        }
      }
      run.stdin.end();
    });
  });
};

module.exports = executeC;
