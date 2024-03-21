const { startCase } = require("lodash");
const fs = require("node:fs");

const { extractedDataPath } = require("./paths");
const { colorifyConsole, writeFiles } = require("./utils");

const BREACHLORDS_SHOWCASE_ABILITIES = [
  "Pullback",
  "Barrage",
  "Spike Eruption",
  "Upheaval",
];
const COMMON_MAPS_SHOWCASE_ABILITIES = [
  "Summon Shadow Councillor",
  "Spiral Ball Lightning Beam",
  "Fire Bombs",
  "Horizontal Ice Rain",
];
const CONQUERORS_SHOWCASE_ABILITIES = [
  "Spiral Attack",
  "Rune Detonation",
  "Hand of Justice",
  "Death Whirl",
];
const ENDGAME_ENCOUNTERS_SHOWCASE_ABILITIES = [
  "Beam Gun",
  "Cold Delayed Explosions",
  "Spinning Beams",
  "Empowered Storm Call",
];
const ELDER_GUARDIANS_SHOWCASE_ABILITIES = [
  "Combo Rush",
  "Knife Barrage",
  "Super Lightning Tendrils",
  "Ion Cannon",
];
const SHAPER_GUARDIANS_SHOWCASE_ABILITIES = [
  "Smoke",
  "Doom Arrow",
  "Burrow",
  "Phoenix Firebomb",
];

const SHOWCASE_ABILITIES = [
  ...BREACHLORDS_SHOWCASE_ABILITIES,
  ...COMMON_MAPS_SHOWCASE_ABILITIES,
  ...CONQUERORS_SHOWCASE_ABILITIES,
  ...ENDGAME_ENCOUNTERS_SHOWCASE_ABILITIES,
  ...ELDER_GUARDIANS_SHOWCASE_ABILITIES,
  ...SHAPER_GUARDIANS_SHOWCASE_ABILITIES,
];

const prepareEncountersPageData = (data) =>
  data.reduce((acc, d) => {
    const { abilities } = d.bosses[0];

    const [extractedGif] = abilities
      .map(({ name: abilityName, gif }) => {
        if (SHOWCASE_ABILITIES.includes(abilityName)) {
          if (gif.length > 0) return gif;
          return null;
        }
        return null;
      })
      .filter(Boolean);

    return {
      ...acc,
      [d.category]: {
        ...acc[d.category],
        name: startCase(d.category),
        path: `/${d.dir}/encounters/${d.category}`,
        gif: !acc[d.category]?.gif
          ? [extractedGif].filter(Boolean)
          : acc[d.category]?.gif
              .concat(extractedGif)
              .filter(Boolean)
              .slice(0, 4),
      },
    };
  }, {});

const generateEncountersPage = async () => {
  await console.time(
    colorifyConsole({ label: "time", text: "Generate Encounters Page" }),
  );

  await writeFiles(async ({ data, dir }) => {
    const prepareEncountersPage = await prepareEncountersPageData(data);
    const encountersPage = JSON.stringify(prepareEncountersPage, null, 2);

    await fs.writeFileSync(
      `${extractedDataPath}/${dir}/encounters.json`,
      encountersPage,
    );
  });

  await console.timeEnd(
    colorifyConsole({ label: "time", text: "Generate Encounters Page" }),
  );
};

generateEncountersPage();
