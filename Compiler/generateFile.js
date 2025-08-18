const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const dirCodes = path.join(__dirname, "codes");

// Ensure codes directory exists
if (!fs.existsSync(dirCodes)) {
  fs.mkdirSync(dirCodes, { recursive: true });
}

const generateFile = (format, content) => {
  const fileID = uuid();
  const filename = `${fileID}.${format}`;
  const filePath = path.join(dirCodes, filename);
  
  try {
    fs.writeFileSync(filePath, content);
    console.log(`Generated file: ${filename}`);
    return filePath;
  } catch (error) {
    console.error("Error generating file:", error);
    throw new Error(`Failed to generate file: ${error.message}`);
  }
};

module.exports = { generateFile };
