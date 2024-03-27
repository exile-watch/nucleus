import { writeFileSync } from "node:fs";
import {
  domain,
  categories,
  directories,
  encounters,
  lastmod,
  maps,
  rootPages,
  subDirectories,
  subDomains,
} from "./constants";

const generateXmlUrl = ({ loc, priority, withDomain = true }) =>
  `
    <url>
      <loc>${withDomain ? domain : ""}${loc}</loc>
      <priority>${priority}</priority>
      <lastmod>${lastmod}</lastmod>
      <changefreq>monthly</changefreq>
    </url>
`.trim();

function generateXml() {
  const indent = "\n    ";
  const header = `<?xml version="1.0" encoding="UTF-8"?>`;
  const subDomainsXml = subDomains
    .map((loc) => generateXmlUrl({ loc, priority: 1.0, withDomain: false }))
    .join(indent);
  const rootPagesXml = rootPages
    .map((loc) => generateXmlUrl({ loc, priority: 1.0 }))
    .join(indent);
  const directoriesXml = directories
    .map((d) => generateXmlUrl({ loc: `/${d}`, priority: 0.9 }))
    .join(indent);
  const subDirectoriesXml = subDirectories
    .map((d) => generateXmlUrl({ loc: `/${d}`, priority: 0.8 }))
    .join(indent);
  const categoriesXml = categories
    .map((loc) => generateXmlUrl({ loc, priority: 0.7 }))
    .join(indent);
  const mapsXml = maps
    .map((m) => generateXmlUrl({ loc: m.mapPath, priority: 0.6 }))
    .join(indent);
  const encountersXml = encounters
    .map((m) => generateXmlUrl({ loc: m.encounterPath, priority: 0.5 }))
    .join(indent);

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
  `;

  return xml.trim();
}

function generateSitemap() {
  const xml = generateXml();
  writeFileSync("./sitemap.xml", xml);
}

generateSitemap();

export { generateXml };
