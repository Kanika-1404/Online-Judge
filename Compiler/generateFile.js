const fs = require("fs");
const path = require("path");
const {v4: uuid} = require("uuid");

const dirCodes = path.join(__dirname, "codes"); // path to store codes file

if (!fs.existsSync(dirCodes)){  // if folder not exist make it
    fs.mkdirSync(dirCodes, {recursive: true});
}
const generateFile = (Format, content) => {
    const fileID = uuid();
    const filename = `${fileID}.${Format}`;
    const filePath = path.join(dirCodes, filename);
    fs.writeFileSync(filePath, content);
    return filePath;
};

generateFile("py", "print(\"Hello World\")"); // generate a cpp

module.exports = {generateFile};