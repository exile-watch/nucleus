const fs = require('fs');
const { kebabCase } = require('lodash');
const {tokensPath, extractedDataPath} = require("./paths");

const cleanInvalidDataFiles = async () => {
  await fs.readdirSync(tokensPath).forEach((dir) => {
    if(dir === 'README.md') return;
    try {
      const d = kebabCase(dir);
      const supportedFiles = fs.readdirSync(`${tokensPath}/${d}`);
      const currentDataFiles = fs.readdirSync(`${extractedDataPath}/${d}`);
      const supportedFilesInJsonExt = supportedFiles.map(
        (file) => `${file.split('.').shift()}.json`
      ); //.yml by default
      console.log(d);
      currentDataFiles.map((currentFile) => {
        if (!supportedFilesInJsonExt.includes(currentFile)) {
          try {
            fs.unlinkSync(`${extractedDataPath}/${d}/${currentFile}`);
          } catch (err) {
            console.error(`[Error][Clean Invalid Data - Single File]: ${err}`);
          }
        }
      });
    } catch (err) {
      console.error(`[Error][Clean Invalid Data - All Files]: ${err}`);
    }
  });
};

cleanInvalidDataFiles();
