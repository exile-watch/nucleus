const { kebabCase } = require('lodash');
const _ = require('lodash');
const fs = require('fs');

const {tokensPath, extractedDataPath} = require("./paths");
const {getDirectories, colorifyConsole} = require("./utils");

const HOMEPAGE_ENCOUNTERS = ['']
const data = [];

getDirectories(tokensPath).forEach((dir) => {
  fs.readdirSync(`${extractedDataPath}/${dir}`).forEach((file) => {
    data.push(JSON.parse(fs.readFileSync(`${extractedDataPath}/${dir}/${file}`)));
  });
});

const prepareHomepageData = () =>
  data.reduce((acc, map) => {
    if(map.category !== 'endgame-bosses') return acc;
    // console.log(map.bosses[0]);
    const [[encounterName, {abilities}]] = Object.entries(map.bosses[0]);
    const extractedGifs = abilities.map(ability => {
      const [{gif}] = Object.values(ability)
      if (gif.length > 0) return gif;
      return null;
    }).filter(Boolean).slice(0, 3)
    const path = map.map
      ? `/encounters/${map.category}/${kebabCase(map.map)}/${kebabCase(encounterName)}`
      : `/encounters/${map.category}/${kebabCase(encounterName)}`;

    return acc.concat({
      name: encounterName,
      path,
      extractedGifs
    });

    // In case we will want boss names instead of map names in sidebar
    // if(map.bosses) {
    //   map.bosses.map(boss => {
    //     const [bossName] = Object.entries(boss)[0];
    //     const path = map.map
    //       ? `/encounters/${map.category}/${kebabCase(map.map)}`
    //       : `/encounters/${map.category}/${kebabCase(map.category)}/${kebabCase(bossName)}`
    //     paths.push({
    //       [kebabCase(map.category)]: [
    //         {
    //           label: map.category === 'common-maps' ? map.map : bossName,
    //           path
    //         }
    //       ]
    //     })
    //   })
    // }
    // return acc.concat(paths)
  }, []);

const buildHomepage = async () => {
  await console.time(colorifyConsole({ label: 'time', text: 'Generate Homepage tiles' }));
  const preparedHomepage = await prepareHomepageData();
  return JSON.stringify(preparedHomepage);
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
