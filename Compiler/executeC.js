const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const outputPath = path.join(__dirname, "outputs");

// Ensure outputs directory exists
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

  const absFilePath = path.resolve(filePath);
  const absOutputPath = path.resolve(outputFilePath);

  // Verify source file exists
  if (!fs.existsSync(absFilePath)) {
    throw new Error(`C file not found: ${absFilePath}`);
  }

  console.log(`Compiling C: gcc "${absFilePath}" -o "${absOutputPath}"`);
  console.log(`Input provided: ${input ? "Yes" : "No"}`);

  return new Promise((resolve, reject) => {
    const compileArgs = [absFilePath, "-o", absOutputPath];
    const compile = spawn("gcc", compileArgs, { stdio: ["ignore", "pipe", "pipe"] });

    let compileError = "";

    compile.stdout.on("data", (data) => {
      console.log("Compile stdout:", data.toString());
    });

    compile.stderr.on("data", (data) => {
      compileError += data.toString();
    });

    compile.on("error", (err) => {
      console.error("Compilation spawn error:", err);
      reject(new Error(`gcc command failed: ${err.message}`));
    });

    compile.on("close", (code) => {
      console.log(`C compilation finished with code: ${code}`);
      if (compileError) console.log(`Compile errors: ${compileError}`);

      if (code !== 0) {
        reject(new Error(`C compilation failed: ${compileError || `Exit code ${code}`}`));
        return;
      }

      // Verify compiled file exists
      if (!fs.existsSync(absOutputPath)) {
        reject(new Error(`Compiled C executable not found: ${absOutputPath}`));
        return;
      }

      // Set executable permission (Linux/Mac only)
      if (!isWindows) {
        try {
          fs.chmodSync(absOutputPath, 0o755);
        } catch (err) {
          console.warn("Could not set executable permissions:", err.message);
        }
      }

      // Execute the compiled binary
      const run = spawn(absOutputPath, [], {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: path.dirname(absOutputPath),
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
        console.error("C execution error:", err);
        reject(new Error(`C execution error: ${err.message}`));
      });

      // Set execution timeout
      const timer = setTimeout(() => {
        run.kill("SIGKILL");
        reject(new Error("C execution timed out (5 seconds)"));
      }, 5000);

      run.on("close", (code) => {
        clearTimeout(timer);

        console.log(`C execution finished with code: ${code}`);
        console.log(`Stdout: ${stdout}`);
        if (stderr) console.log(`Stderr: ${stderr}`);

        // Clean up executable file
        try {
          fs.unlinkSync(absOutputPath);
        } catch (err) {
          console.warn("Could not delete C executable:", err.message);
        }

        if (code !== 0) {
          reject(new Error(stderr || `C execution failed with exit code ${code}`));
        } else {
          resolve(stdout.trim());
        }
      });

      // Handle input properly
      if (input && input.trim()) {
        const formattedInput = input.endsWith("\n") ? input : input + "\n";
        run.stdin.write(formattedInput);
      }

      // Always end stdin
      run.stdin.end();
    });
  });
};

module.exports = executeC;
