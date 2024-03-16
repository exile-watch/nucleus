import {
  categories,
  directories,
  domain,
  encounters,
  lastmod,
  maps,
  rootPages,
  subDirectories,
  subDomains
} from "./constants";

const generateXmlUrl = ({ loc, priority, withDomain = true }) => `
    <url>
      <loc>${withDomain ? domain : ''}${loc}</loc>
      <priority>${priority}</priority>
      <lastmod>${lastmod}</lastmod>
      <changefreq>monthly</changefreq>
    </url>
`.trim();

function generateXml() {
  const indent = "\n    ";
  const header = `<?xml version="1.0" encoding="UTF-8"?>`;
  const subDomainsXml = subDomains.map(loc => generateXmlUrl({loc, priority: 1.0, withDomain: false})).join(indent)
  const rootPagesXml = rootPages.map(loc => generateXmlUrl({loc, priority: 1.0})).join(indent)
  const directoriesXml = directories.map(d => generateXmlUrl({loc: `/${d}`, priority: 0.9})).join(indent)
  const subDirectoriesXml = subDirectories.map(d => generateXmlUrl({loc: `/${d}`, priority: 0.8})).join(indent)
  const categoriesXml = categories.map(loc => generateXmlUrl({loc, priority: 0.7})).join(indent)
  const mapsXml = maps.map(m => generateXmlUrl({loc: m.mapPath, priority: 0.6})).join(indent)
  const encountersXml = encounters.map(m => generateXmlUrl({loc: m.encounterPath, priority: 0.5})).join(indent)

  const xml = `
  ${header}
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${subDomainsXml}
    ${rootPagesXml}
    ${directoriesXml}
    ${subDirectoriesXml}
    ${categoriesXml}
    ${mapsXml}
    ${encountersXml}
  </urlset>
  `

  return xml.trim();
}

function titleCase(str) {
  if(!str) return;

  const lowerCaseWords = ['of'];
  return str
    .split('-') // Split the string into an array by dashes.
    .map((word, index) => {
      // Check if the word should remain in lowercase, except if it's the first word.
      if (lowerCaseWords.includes(word) && index !== 0) {
        return word;
      }
      // Capitalize the first letter of the word.
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ') // Join the array back into a string with spaces.
    .replace(/(\d+)/, ' $1'); // Ensure numbers are correctly spaced.
}

export {generateXml, titleCase}