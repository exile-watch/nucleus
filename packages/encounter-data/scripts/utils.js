const {readdirSync} = require("fs");

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

module.exports = {
  colorifyConsole,
  getDirectories
}