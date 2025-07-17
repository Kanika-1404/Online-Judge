const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const os = require("os");

const executeC = async (filePath) => {
  const jobID = path.basename(filePath).split(".")[0];
  let outputFilePath = path.join(outputPath, `${jobID}.out`);
  const isWindows = os.platform() === "win32";

  if (isWindows) {
    outputFilePath += ".exe";
  }

  return new Promise((resolve, reject) => {
    const compileCommand = `gcc "${filePath}" -o "${outputFilePath}"`;
    const runCommand = isWindows ? `"${outputFilePath}"` : `./"${outputFilePath}"`;
    const command = `${compileCommand} && ${runCommand}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stderr });
      } else if (stderr) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
};


module.exports = executeC;
