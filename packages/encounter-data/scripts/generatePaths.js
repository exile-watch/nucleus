const { kebabCase } = require('lodash');
const _ = require('lodash');
const fs = require('fs');

const {extractedDataPath} = require("./paths");
const {colorifyConsole, writeFiles} = require("./utils");

const preparePathsData = (data) =>
  data.reduce((acc, d) => {
    const {name: encounterName} = d.bosses[0];
    const path = d.map
      ? `/${d.dir}/encounters/${d.category}/${kebabCase(d.map)}/${kebabCase(encounterName)}`
      : `/${d.dir}/encounters/${d.category}/${kebabCase(encounterName)}`;

    return acc.concat({
      [d.category]: [
        {
          label: d.map ? d.map : encounterName,
          path,
        },
      ],
    });
  }, []);

const mergeSameKeysInArr = (arr) =>
  _(arr)
    .groupBy()
    .map((g) => _.mergeWith({}, ...g, (obj, src) => (_.isArray(obj) ? obj.concat(src) : undefined)))
    .value();

const generatePaths = async () => {
  await console.time(colorifyConsole({label: 'time', text: 'Generate Encounters Paths'}));

  await writeFiles(async ({data, dir}) => {
    const preparedPaths = await preparePathsData(data);
    const [paths] = await mergeSameKeysInArr(preparedPaths);

    const stringifiedPaths = JSON.stringify(paths, null, 2);
    await fs.writeFileSync(`${extractedDataPath}/${dir}/paths.json`, stringifiedPaths);
  })

  await console.timeEnd(colorifyConsole({label: 'time', text: 'Generate Encounters Paths'}));
}

generatePaths()