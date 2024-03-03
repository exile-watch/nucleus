const fs = require('fs');
const { toLower, kebabCase, camelCase } = require('lodash');
const yaml = require('js-yaml');

const {colorifyConsole, getDirectories} = require("./utils");
const {tokensPath, extractedDataPath, typesOutputFile} = require("./paths");
const skills = require(`../src/extracted-data/skills.json`);

/**
 * Replaces `/SKILL/` value to matched key/value in `tokens/skills.yml`
 *
 * @example
 * // ...
 * abilities:
 *  - Slam
 *    - about:
 *      - /FIREBALL/
 *      - does something specific to this boss's ability
 *      - and something else
 * // ...
 * @becomes:
 * abilities:
 *  - Slam
 *    - about:
 *      - Unleashes a ball of fire towards a target which explodes, damaging nearby foes
 *      - does something specific to this boss's ability
 *      - and something else
 */
const replaceTokenWithValue = (arr) =>
  arr.map((about) => {
    // See more at https://github.com/sbsrnt/poe-watch/tree/main/tokens/README.md
    const IS_SKILL_TOKEN = about && about.charAt && about.charAt(0) === '/';
    if (IS_SKILL_TOKEN) {
      const [, skill] = about.split('/');
      about = skills[skill];
    }
    return about;
  });

const injectAllAbilityDamageTypesToBoss = (data) => {
  const bosses = data.bosses.map(({name, abilities}) => {
    let damageTypes = [];
    abilities.map((ability) => {
      const [a] = Object.values(ability);
      if (a.type) {
        damageTypes.push(a.type);
      }

      if (a.about) {
        a.about = replaceTokenWithValue(a.about);
      }
    });

    return {
      name,
      damageTypes: [...new Set(damageTypes.flat())],
      abilities,
    };
  });

  return {
    ...data,
    bosses,
  };
};

const getExtractedData = async () => {
  let data = [];
  await getDirectories(tokensPath).forEach((dir) => {
    try {
      fs.readdirSync(`${tokensPath}/${dir}`).forEach((file) => {

        try {
          const convertedDataToJson = yaml.load(
            fs.readFileSync(`${tokensPath}/${dir}/${file}`, 'utf8')
          );
          const dataWithBossDamageTypes = injectAllAbilityDamageTypesToBoss(convertedDataToJson);

          const dataWithDir = { category: dir, ...dataWithBossDamageTypes };
          data.push(dataWithDir);
        } catch (fileErr) {
          console.log(fileErr);
        }
      });
    } catch (dirErr) {
      console.log(dirErr);
    }
  });
  return data;
};

getExtractedData().then(async (extractedData) => {
  await console.time(colorifyConsole({ label: 'time', text: 'Extract Encounters' }));

  // clear index.ts so the forEach won't append to the existing content
  await fs.truncateSync(typesOutputFile, 0);

  // start creating imports
  await getDirectories(tokensPath).forEach((dir) => {
    fs.appendFileSync(typesOutputFile, `import { default as ${camelCase(dir)} } from './extracted-data/${dir}.json'\n`);
  })

  await extractedData.forEach((data) => {
    const {name} = data.bosses[0];
    const fileName = data.map
      ? `${toLower(kebabCase(data.map))}.json`
      : `${toLower(kebabCase(name))}.json`;
    const importName = data.map
      ? camelCase(data.map)
      : camelCase(name);

    // create category if it doesn't exist yet
    fs.mkdirSync(`${extractedDataPath}/${data.category}`, { recursive: true });
    // create json files
    fs.writeFileSync(`${extractedDataPath}/${data.category}/${fileName}`, JSON.stringify(data, null, 2));
    // create json imports in encounter-types.ts
    fs.appendFileSync(typesOutputFile, `import { default as ${importName} } from './extracted-data/${data.category}/${fileName}'\n`);
  });

  // append files out of dirs
  await fs.appendFileSync(typesOutputFile, `import { default as indexedSearch } from './extracted-data/indexed-search.json'\n`);
  await fs.appendFileSync(typesOutputFile, `import { default as paths } from './extracted-data/paths.json'\n`);
  await fs.appendFileSync(typesOutputFile, `import { default as homepage } from './extracted-data/homepage.json'\n`);
  await fs.appendFileSync(typesOutputFile, `import { default as encounters } from './extracted-data/encounters.json'\n`);

  // start exporting by append "export {"
  await fs.appendFileSync(typesOutputFile, `\nexport {\n`);

  // append exports for categories inside `export {...}`
  await getDirectories(tokensPath).forEach((dir) => {
    fs.appendFileSync(typesOutputFile, `  ${camelCase(dir)},\n`);
  })

  // append exports for each category file inside `export {...}`
  await extractedData.forEach((data) => {
    const {name: encounterName} = data.bosses[0];
    const importName = data.map
      ? camelCase(data.map)
      : camelCase(encounterName);

    fs.appendFileSync(typesOutputFile, `  ${importName},\n`);
  });

  // append exports for files out of dirs
  fs.appendFileSync(typesOutputFile, `  indexedSearch,\n`);
  fs.appendFileSync(typesOutputFile, `  paths,\n`);
  fs.appendFileSync(typesOutputFile, `  homepage,\n`);
  fs.appendFileSync(typesOutputFile, `  encounters\n`);
  // close exporting by appending "}"
  await fs.appendFileSync(typesOutputFile, `}\n`);

  await console.timeEnd(colorifyConsole({ label: 'time', text: 'Extract Encounters' }));
});
