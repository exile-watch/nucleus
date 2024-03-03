const { kebabCase, startCase } = require('lodash');
const _ = require('lodash');
const fs = require('fs');

const {tokensPath, extractedDataPath} = require("./paths");
const {getDirectories, colorifyConsole} = require("./utils");

const BREACHLORDS_SHOWCASE_ABILITIES = ['Pullback', 'Barrage', 'Spike Eruption', 'Upheaval']
const COMMON_MAPS_SHOWCASE_ABILITIES = ['Summon Shadow Councillor', 'Spiral Ball Lightning Beam', 'Fire Bombs', 'Horizontal Ice Rain']
const CONQUERORS_SHOWCASE_ABILITIES = ['Spiral Attack', 'Rune Detonation', 'Hand of Justice', 'Death Whirl']
const ENDGAME_ENCOUNTERS_SHOWCASE_ABILITIES = ['Carpet Mortar', 'Beam Gun', 'Cold Delayed Explosions', 'Spinning Beams', 'Empowered Storm Call', 'Expanding Nova / Ring of Death', 'Bullet Hell']
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

const prepareHomepageData = () =>
  data.reduce((acc, map) => {
    const {name: encounterName, abilities} = map.bosses[0];

    const [extractedGif] = abilities.map(({name: abilityName, gif}) => {

      if(SHOWCASE_ABILITIES.includes(abilityName)) {
        if (gif.length > 0) return gif;
        return null
      }
      return null;
    }).filter(Boolean)

    const path = map.map
      ? `/encounters/${map.category}/${kebabCase(map.map)}/${kebabCase(encounterName)}`
      : `/encounters/${map.category}/${kebabCase(encounterName)}`;

    switch(map.category){
      case 'breachlords':
      case 'common-maps':
      case 'conquerors':
      case 'elder-guardians':
      case 'shaper-guardians': {
        return {
          ...acc,
          [map.category]: {
            ...acc[map.category],
            name: startCase(map.category),
            path: `/encounters/${map.category}`,
            thumbnail:!acc[map.category]?.thumbnail ? [map.thumbnail].filter(Boolean) : acc[map.category]?.thumbnail.concat(map.thumbnail).filter(Boolean).slice(0, 4),
            gif: !acc[map.category]?.gif ? [extractedGif].filter(Boolean) : acc[map.category]?.gif.concat(extractedGif).filter(Boolean).slice(0, 4)
          }
        }
      }

      case 'endgame-bosses': {
        const OMITTED_ENDGAME_ENCOUNTERS = ['The Apex of Sacrifice', 'Simulacrum']
        if(OMITTED_ENDGAME_ENCOUNTERS.includes(map?.map)) return acc;

        return {
          ...acc,
          main: acc.main?.concat({
            name: encounterName === "Fractal Gargantuan" ? "Cortex" : encounterName,
            path,
            thumbnail: map.thumbnail,
            gif: extractedGif
          })
        }
      }
      default: return acc;
    }
  }, {main: []});

const buildHomepage = async () => {
  await console.time(colorifyConsole({ label: 'time', text: 'Generate Homepage tiles' }));
  const preparedHomepage = await prepareHomepageData();
  return JSON.stringify(preparedHomepage, null, 2);
};

buildHomepage()
  .then(async (data) => {
    await fs.writeFileSync(`${extractedDataPath}/homepage.json`, data);
    await console.timeEnd(colorifyConsole({ label: 'time', text: 'Generate Homepage tiles' }));
  })
  .catch(async (err) => {
    await console.log(err);
    await console.timeEnd(colorifyConsole({ label: 'time', text: 'Generate Homepage tiles' }));
  });
