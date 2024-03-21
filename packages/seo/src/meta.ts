import type { DefaultSeoProps } from "next-seo";
import { titleCase } from "../src/utils";

type Description = {
  directory: string | string[];
  category: string | string[];
  map: string | string[];
  encounter: string | string[];
};

type Meta = (
  props: Partial<Description>,
) => Pick<DefaultSeoProps, "title" | "description">;

const meta: DefaultSeoProps = {
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://exile.watch/",
    siteName: "exile.watch",
  },
};

const metaHomepage: Meta = () => ({
  title:
    "exile.watch: Master Path of Exile with Visual Ability Insights - Quick, Informative GIFs",
  description:
    "Master Path of Exile with exile.watch: Streamline your game with our quick visual guides and GIFs.",
});

const metaWelcome: Meta = () => ({
  title: "Welcome",
  description:
    "Welcome to your Path of Exile edge with exile.watch: Dive into swift, visual ability insights and GIFs for smarter gameplay.",
});

const metaDirectory: Meta = ({ directory }) => ({
  title: "Directory",
  description: `Advance your ${titleCase(
    directory,
  )} gameplay with exile.watch: Discover visual ability insights and GIFs designed to conquer new challenges.`,
});

const metaEncounters: Meta = ({ directory }) => ({
  title: `${titleCase(directory)} Encounters`,
  description: `Navigate ${titleCase(
    directory,
  )} encounters with ease on exile.watch: Access a curated list of encounter categories for targeted visual ability insights.`,
});

const metaEncountersCategories: Meta = ({ directory, category }) => ({
  title: `${titleCase(category)} - ${titleCase(directory)} Encounters`,
  description: `Master the ${titleCase(category)} encounters in ${titleCase(
    directory,
  )} with exile.watch: Visual ability insights and GIFs to conquer the Atlas's toughest foes.`,
});

const metaEncountersCategoryMaps: Meta = ({ directory, category, map }) => ({
  title: `${titleCase(map)} - ${titleCase(category)}, ${titleCase(
    directory,
  )} Encounters`,
  description: `Master ${titleCase(map)} encounters in ${titleCase(
    directory,
  )} with exile.watch: Visual ability insights and GIFs for all encounters.`,
});

const metaEncounter: Meta = ({ directory, category, encounter }) => ({
  title: `${titleCase(encounter)} - ${titleCase(category)}, ${titleCase(
    directory,
  )} Encounters`,
  description: `Understand and conquer ${titleCase(encounter)} in ${titleCase(
    directory,
  )} with exile.watch: Discover key abilities and their effects through our concise, informative GIFs.`,
});

export {
  meta,
  metaHomepage,
  metaWelcome,
  metaDirectory,
  metaEncounter,
  metaEncounters,
  metaEncountersCategories,
  metaEncountersCategoryMaps,
};
