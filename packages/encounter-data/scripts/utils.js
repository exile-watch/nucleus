const {readdirSync} = require("fs");
const { format } = require('date-fns');
const {tokensPath, extractedDataPath} = require("./paths");
const fs = require("fs");
const lastmod = format(new Date(), `yyyy-MM-dd'T'HH:mmxxx`);
const getDirectories = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

const colorifyConsole = ({ label, text }) => {
  switch (label) {
    case 'time':
      return `\u001b[1;34mtime\u001b[37m  - ${text}`;
    case 'info':
      return `\u001b[1;36minfo\u001b[37m  - ${text}`;
    default:
      return text || '';
  }
};

async function writeFiles(cb) {
  const directories = getDirectories(tokensPath);

  for (const dir of directories) {
    const data = []
    const subDirectories = getDirectories(`${tokensPath}/${dir}`);

    for (const subDir of subDirectories) {
      const files = fs.readdirSync(`${extractedDataPath}/${dir}/${subDir}`);

      for (const file of files) {
        data.push({dir, ...JSON.parse(fs.readFileSync(`${extractedDataPath}/${dir}/${subDir}/${file}`))});
      }
    }

    cb({data, dir, subDirectories})
  }
}

const generateXmlUrl = ({ loc, priority }) => `
  <url>
    <loc>${loc}</loc>
    <priority>${priority}</priority>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
  </url>
  `;

module.exports = {
  colorifyConsole,
  getDirectories,
  writeFiles,
  generateXmlUrl
}