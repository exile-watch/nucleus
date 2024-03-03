const { startCase } = require('lodash');
const fs = require('fs');

const {tokensPath, extractedDataPath} = require("./paths");
const {getDirectories, colorifyConsole} = require("./utils");

const BREACHLORDS_SHOWCASE_ABILITIES = ['Pullback', 'Barrage', 'Spike Eruption', 'Upheaval']
const COMMON_MAPS_SHOWCASE_ABILITIES = ['Summon Shadow Councillor', 'Spiral Ball Lightning Beam', 'Fire Bombs', 'Horizontal Ice Rain']
const CONQUERORS_SHOWCASE_ABILITIES = ['Spiral Attack', 'Rune Detonation', 'Hand of Justice', 'Death Whirl']
const ENDGAME_ENCOUNTERS_SHOWCASE_ABILITIES = ['Beam Gun', 'Cold Delayed Explosions', 'Spinning Beams', 'Empowered Storm Call']
const ELDER_GUARDIANS_SHOWCASE_ABILITIES = ['Combo Rush', 'Knife Barrage', 'Super Lightning Tendrils', 'Ion Cannon']
const SHAPER_GUARDIANS_SHOWCASE_ABILITIES = ['Smoke', 'Doom Arrow', 'Burrow', 'Phoenix Firebomb']

const SHOWCASE_ABILITIES = [
  ...BREACHLORDS_SHOWCASE_ABILITIES,
  ...COMMON_MAPS_SHOWCASE_ABILITIES,
  ...CONQUERORS_SHOWCASE_ABILITIES,
  ...ENDGAME_ENCOUNTERS_SHOWCASE_ABILITIES,
  ...ELDER_GUARDIANS_SHOWCASE_ABILITIES,
  ...SHAPER_GUARDIANS_SHOWCASE_ABILITIES
]
const data = [];

getDirectories(tokensPath).forEach((dir) => {
  fs.readdirSync(`${extractedDataPath}/${dir}`).forEach((file) => {
    data.push(JSON.parse(fs.readFileSync(`${extractedDataPath}/${dir}/${file}`)));
  });
});

const prepareEncountersPageData = () =>
  data.reduce((acc, map) => {
    const {abilities} = map.bosses[0]

    const [extractedGif] = abilities.map(({name: abilityName, gif}) => {
      if (SHOWCASE_ABILITIES.includes(abilityName)) {
        if (gif.length > 0) return gif;
        return null
      }
      return null;
    }).filter(Boolean)

    return {
      ...acc,
      [map.category]: {
        ...acc[map.category],
        name: startCase(map.category),
        path: `/encounters/${map.category}`,
        gif: !acc[map.category]?.gif ? [extractedGif].filter(Boolean) : acc[map.category]?.gif.concat(extractedGif).filter(Boolean).slice(0, 4)
      }
    }
  }, {});

const buildEncountersPage = async () => {
  await console.time(colorifyConsole({ label: 'time', text: 'Generate Encounters Page' }));
  const preparedHomepage = await prepareEncountersPageData();
  return JSON.stringify(preparedHomepage, null, 2);
};

buildEncountersPage()
  .then(async (data) => {
    await fs.writeFileSync(`${extractedDataPath}/encounters.json`, data);
    await console.timeEnd(colorifyConsole({ label: 'time', text: 'Generate Encounters Page' }));
  })
  .catch(async (err) => {
    await console.log(err);
    await console.timeEnd(colorifyConsole({ label: 'time', text: 'Generate Encounters Page' }));
  });
