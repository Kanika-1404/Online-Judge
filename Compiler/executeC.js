const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const os = require("os");

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

    compile.on("close", (code) => {
      if (code !== 0) {
        reject(`Compilation failed with exit code ${code}`);
        return;
      }

      const run = spawn(isWindows ? outputFilePath : `./${outputFilePath}`, [], { shell: true });

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

    compile.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    compile.on("error", (err) => {
      reject(err);
    });
  });
};

module.exports = executeC;
