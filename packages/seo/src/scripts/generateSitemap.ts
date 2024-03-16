import {pathOfExile1IndexedSearch, pathOfExile2IndexedSearch, pathOfExile1Paths, pathOfExile2Paths} from "@exile-watch/encounter-data";
import {format} from "date-fns";
import fs from 'fs'
import {trim} from "lodash"

const lastmod = format(new Date(), `yyyy-MM-dd'T'HH:mmxxx`);

const domain = "https://exile.watch"

const generateXmlUrl = ({ loc, priority, withDomain = true }) => trim(`
    <url>
      <loc>${withDomain ? domain : ''}${loc}</loc>
      <priority>${priority}</priority>
      <lastmod>${lastmod}</lastmod>
      <changefreq>monthly</changefreq>
    </url>
`);

const {maps: poe1maps, encounters: poe1encounters } = pathOfExile1IndexedSearch;
const {maps: poe2maps, encounters: poe2encounters } = pathOfExile2IndexedSearch;

const subDomains = ['https://docs.exile.watch', 'https://engineering.exile.watch'];
const rootPages = ['', '/welcome'];
const directories = ['path-of-exile-1', 'path-of-exile-2'];
const subDirectories = ['path-of-exile-1/encounters', 'path-of-exile-2/encounters']
const categories = directories.map(((d, i) => {
  switch(i){
    // poe1
    case 0: {
      return Object.keys(pathOfExile1Paths).map(c => `/${d}/encounters/${c}`)
    }
    // poe2
    case 1: {
      return Object.keys(pathOfExile2Paths).map(c => `/${d}/encounters/${c}`)
    }
  }
})).flat()

const maps = [...poe1maps, ...poe2maps ];
const encounters = [...poe1encounters, ...poe2encounters]

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

  const xml = trim(`
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
  `)

  return xml;
}

async function generateSitemap() {
  const xml = await generateXml()
  await fs.writeFileSync(`./sitemap.xml`, xml);
}

generateSitemap()

export {generateXml}