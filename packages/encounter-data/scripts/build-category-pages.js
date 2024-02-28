const { kebabCase, startCase } = require('lodash');
const _ = require('lodash');
const fs = require('fs');

const {tokensPath, extractedDataPath} = require("./paths");
const {getDirectories, colorifyConsole} = require("./utils");

const data = [];

getDirectories(tokensPath).forEach((dir) => {
  fs.readdirSync(`${extractedDataPath}/${dir}`).forEach((file) => {
    data.push(JSON.parse(fs.readFileSync(`${extractedDataPath}/${dir}/${file}`)));
  });
});

const prepareCategoriesData = () =>
  data.reduce((acc, map) => {
    const [[encounterName, {abilities}]] = Object.entries(map.bosses[0]);
    const [{gif}] = Object.values(abilities.pop())

    const path = map.map
      ? `/encounters/${map.category}/${kebabCase(map.map)}/${kebabCase(encounterName)}`
      : `/encounters/${map.category}/${kebabCase(encounterName)}`;

    return {
      ...acc,
      [map.category]: [...acc[map.category] ?? [], {
        name: map.map ? startCase(map.map) : startCase(encounterName),
        path,
        gif
      }]
    }
  }, {});

const buildHomepage = async () => {
  await console.time(colorifyConsole({ label: 'time', text: 'Generate Homepage tiles' }));
  return await prepareCategoriesData();
};


buildHomepage()
  .then(async (data) => {
    const categories = Object.keys(data);
    for (const category of categories) {
      const categoryEncounters = Object.values(data[category])
      await fs.writeFileSync(`${extractedDataPath}/${category}.json`, JSON.stringify(categoryEncounters, null, 2));
    }
    await console.timeEnd(colorifyConsole({ label: 'time', text: 'Generate Homepage tiles' }));
  })
  .catch(async (err) => {
    await console.log(err);
    await console.timeEnd(colorifyConsole({ label: 'time', text: 'Generate Homepage tiles' }));
  });
