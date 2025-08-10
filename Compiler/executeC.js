const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const outputPath = path.join(__dirname, "outputs");
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
    const compileCommand = `gcc "${filePath}" -o "${outputFilePath}"`;
    const compile = spawn(compileCommand, { shell: true });

    let compileError = "";

    compile.stderr.on("data", (data) => {
      compileError += data.toString();
    });

    compile.on("error", (err) => {
      reject(err);
    });

    compile.on("close", (code) => {
      if (code !== 0) {
        reject(`Compilation failed: ${compileError || `Exit code ${code}`}`);
        return;
      }

      // Make the file executable on Unix systems
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
        cwd: outputPath
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
        reject(`Execution error: ${err.message}`);
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
  });
};

module.exports = executeC;
