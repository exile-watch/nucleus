import fs from "node:fs";
import { generateXml } from "../../src/utils";

function generateSitemap() {
  const xml = generateXml();
  fs.writeFileSync("./sitemap.xml", xml);
}

generateSitemap();

export { generateXml };
