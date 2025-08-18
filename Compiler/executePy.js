const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const executePy = async (filePath, input = "") => {
  // Try different Python commands based on platform
  let pythonCommand = "python3";
  if (os.platform() === "win32") {
    pythonCommand = "python";
  }

  const absPath = path.resolve(filePath);
  
  // Verify file exists
  if (!fs.existsSync(absPath)) {
    throw new Error(`Python file not found: ${absPath}`);
  }

  console.log(`Executing Python: ${pythonCommand} ${absPath}`);
  console.log(`Input provided: ${input ? "Yes" : "No"}`);

  return new Promise((resolve, reject) => {
    const run = spawn(pythonCommand, [absPath], {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: path.dirname(absPath)
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
      console.error("Python execution error:", err);
      reject(new Error(`Python execution failed: ${err.message}`));
    });

    // Set timeout
    const timer = setTimeout(() => {
      run.kill("SIGKILL");
      reject(new Error("Python execution timed out (5 seconds)"));
    }, 5000);

    run.on("close", (code) => {
      clearTimeout(timer);
      
      console.log(`Python execution finished with code: ${code}`);
      console.log(`Stdout: ${stdout}`);
      if (stderr) console.log(`Stderr: ${stderr}`);

      if (code !== 0) {
        reject(new Error(stderr || `Python execution failed with exit code ${code}`));
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
};

module.exports = executePy;
