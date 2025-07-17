const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const executePy = async (filePath) => {
  const isWindows = os.platform() === "win32";
  const pythonCommand = isWindows ? "py" : "python3";

  return new Promise((resolve, reject) => {
    exec(`${pythonCommand} "${filePath}"`, (error, stdout, stderr) => {
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

module.exports = executePy;
