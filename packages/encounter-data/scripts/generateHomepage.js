const { kebabCase, startCase } = require('lodash');
const fs = require('fs');

const {extractedDataPath} = require("./paths");
const {colorifyConsole, writeFiles} = require("./utils");

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

const prepareHomepageData = (data) =>
  data.reduce((acc, d) => {
    const {name: encounterName, abilities} = d.bosses[0];

    const [extractedGif] = abilities.map(({name: abilityName, gif}) => {

      if(SHOWCASE_ABILITIES.includes(abilityName)) {
        if (gif.length > 0) return gif;
        return null
      }
      return null;
    }).filter(Boolean)

    const path = d.map
      ? `/${d.dir}/encounters/${d.category}/${kebabCase(d.map)}/${kebabCase(encounterName)}`
      : `/${d.dir}/encounters/${d.category}/${kebabCase(encounterName)}`;

    switch(d.category){
      case 'breachlords':
      case 'common-maps':
      case 'conquerors':
      case 'elder-guardians':
      case 'shaper-guardians': {
        return {
          ...acc,
          [d.category]: {
            ...acc[d.category],
            name: startCase(d.category),
            path: `/${d.dir}/encounters/${d.category}`,
            thumbnail:!acc[d.category]?.thumbnail ? [d.thumbnail].filter(Boolean) : acc[d.category]?.thumbnail.concat(d.thumbnail).filter(Boolean).slice(0, 4),
            gif: !acc[d.category]?.gif ? [extractedGif].filter(Boolean) : acc[d.category]?.gif.concat(extractedGif).filter(Boolean).slice(0, 4)
          }
        }
      }

      case 'endgame-bosses': {
        const OMITTED_ENDGAME_ENCOUNTERS = ['The Apex of Sacrifice', 'Simulacrum']
        if(OMITTED_ENDGAME_ENCOUNTERS.includes(d?.map)) return acc;

        return {
          ...acc,
          main: acc.main?.concat({
            name: encounterName === "Fractal Gargantuan" ? "Cortex" : encounterName,
            path,
            thumbnail: d.thumbnail,
            gif: extractedGif
          })
        }
      }
      default: return acc;
    }
  }, {main: []});

const generateHomepage = async () => {
  await console.time(colorifyConsole({label: 'time', text: 'Generate Homepage tiles'}));

  await writeFiles(async ({data, dir}) => {
    const preparedHomepage = await prepareHomepageData(data);
    const homepage = JSON.stringify(preparedHomepage, null, 2);

    await fs.writeFileSync(`${extractedDataPath}/${dir}/homepage.json`, homepage);
  })

  await console.timeEnd(colorifyConsole({ label: 'time', text: 'Generate Homepage tiles' }));
}

generateHomepage()
