// test.js

const path = require("path");
const executePy = require("./executePy");

const filePath = path.join(__dirname, "codes", "1d0798a4-c9e3-486b-ace5-892037f93041.py");

executePy(filePath)
  .then((output) => {
    console.log("Program output:", output);
  })
  .catch((err) => {
    console.error("Error:", err);
  });
