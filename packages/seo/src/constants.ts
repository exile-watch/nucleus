import {
  pathOfExile1IndexedSearch,
  pathOfExile1Paths,
  pathOfExile2IndexedSearch,
  pathOfExile2Paths,
} from "@exile-watch/encounter-data";
import { format } from "date-fns";

const { maps: poe1maps, encounters: poe1encounters } =
  pathOfExile1IndexedSearch;
const { maps: poe2maps, encounters: poe2encounters } =
  pathOfExile2IndexedSearch;

const domain = "https://exile.watch";
const subDomains = [
  "https://docs.exile.watch",
  "https://engineering.exile.watch",
];
const rootPages = ["", "/welcome"];
const directories = ["path-of-exile-1", "path-of-exile-2"];
const subDirectories = [
  "path-of-exile-1/encounters",
  "path-of-exile-2/encounters",
];
const categories = directories.flatMap((d, i) => {
  switch (i) {
    // poe1
    case 0: {
      return Object.keys(pathOfExile1Paths).map((c) => `/${d}/encounters/${c}`);
    }
    // poe2
    case 1: {
      return Object.keys(pathOfExile2Paths).map((c) => `/${d}/encounters/${c}`);
    }
  }
});

const maps = [...poe1maps, ...poe2maps];
const encounters = [...poe1encounters, ...poe2encounters];

const lastmod = format(new Date(), `yyyy-MM-dd'T'HH:mmxxx`);

export {
  domain,
  subDomains,
  rootPages,
  directories,
  subDirectories,
  categories,
  maps,
  encounters,
  lastmod,
};
