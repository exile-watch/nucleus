const fs = require("node:fs");
const { toLower, kebabCase, camelCase } = require("lodash");
const yaml = require("js-yaml");

const { colorifyConsole, getDirectories } = require("./utils");
const { tokensPath, extractedDataPath, typesOutputFile } = require("./paths");

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
const replaceTokenWithValue = ({ dir, arr }) => {
  const skills = require(`../src/extracted-data/${dir}/skills.json`);
  return arr.map((about) => {
    // See more at https://github.com/sbsrnt/poe-watch/tree/main/tokens/README.md
    const IS_SKILL_TOKEN = about?.charAt && about.charAt(0) === "$";
    if (IS_SKILL_TOKEN) {
      const [, skill] = about.split("$");
      about = skills[skill];
    }
    return about;
  });
};

const injectAllAbilityDamageTypesToBoss = ({ dir, data }) => {
  const encounters = data.encounters.map(({ name, abilities }) => {
    const damageTypes = [];
    abilities.map((ability) => {
      if (ability.type) {
        damageTypes.push(ability.type);
      }

      if (ability.about) {
        ability.about = replaceTokenWithValue({ dir, arr: ability.about });
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
    encounters,
  };
};

const getNames = ({ dir, subDir, file }) => {
  const convertedDataToJson = yaml.load(
    fs.readFileSync(`${tokensPath}/${dir}/${subDir}/${file}`, "utf8"),
  );
  const data = {
    category: subDir,
    ...injectAllAbilityDamageTypesToBoss({ dir, data: convertedDataToJson }),
  };

  const { name } = data.encounters[0];
  const fileName = data.map
    ? `${toLower(kebabCase(data.map))}.json`
    : `${toLower(kebabCase(name))}.json`;
  const importName = data.map ? camelCase(data.map) : camelCase(name);
  return { data, fileName, importName };
};

const extractData = async () => {
  await console.time(
    colorifyConsole({ label: "time", text: "Extract Encounters" }),
  );

  // clear index.ts so the forEach won't append to the existing content
  await fs.truncateSync(typesOutputFile, 0);

  /**
   * Create imports
   */
  const directories = await getDirectories(tokensPath);

  for (const dir of directories) {
    const subDirectories = await getDirectories(`${tokensPath}/${dir}`);

    // update types file with each dir and subdir
    for (const subDir of subDirectories) {
      await fs.appendFileSync(
        typesOutputFile,
        `import { default as ${camelCase(
          subDir,
        )} } from './extracted-data/${dir}/${subDir}.json'\n`,
      );

      const files = fs.readdirSync(`${tokensPath}/${dir}/${subDir}`);

      for (const file of files) {
        const { fileName, importName, data } = getNames({ dir, subDir, file });

        // create category if it doesn't exist yet
        fs.mkdirSync(`${extractedDataPath}/${dir}/${subDir}`, {
          recursive: true,
        });
        // create json files
        fs.writeFileSync(
          `${extractedDataPath}/${dir}/${subDir}/${fileName}`,
          JSON.stringify(data, null, 2),
        );
        // create json imports in encounter-types.ts
        fs.appendFileSync(
          typesOutputFile,
          `import { default as ${importName} } from './extracted-data/${dir}/${subDir}/${fileName}'\n`,
        );
      }
    }

    const camelCasedDir = camelCase(dir);

    await fs.appendFileSync(
      typesOutputFile,
      `import { default as ${camelCasedDir}IndexedSearch } from './extracted-data/${dir}/indexed-search.json'\n`,
    );
    await fs.appendFileSync(
      typesOutputFile,
      `import { default as ${camelCasedDir}Paths } from './extracted-data/${dir}/paths.json'\n`,
    );
    await fs.appendFileSync(
      typesOutputFile,
      `import { default as ${camelCasedDir}Homepage } from './extracted-data/${dir}/homepage.json'\n`,
    );
    await fs.appendFileSync(
      typesOutputFile,
      `import { default as ${camelCasedDir}Encounters } from './extracted-data/${dir}/encounters.json'\n`,
    );
  }

  /**
   * Create exports
   */
  await fs.appendFileSync(typesOutputFile, "\nexport {\n");
  // append exports for files out of dirs

  for (const dir of directories) {
    const subDirectories = await getDirectories(`${tokensPath}/${dir}`);

    for (const subDir of subDirectories) {
      fs.appendFileSync(typesOutputFile, `  ${camelCase(subDir)},\n`);

      const files = fs.readdirSync(`${tokensPath}/${dir}/${subDir}`);

      for (const file of files) {
        const { importName } = getNames({ dir, subDir, file });
        fs.appendFileSync(typesOutputFile, `  ${importName},\n`);
      }
    }

    await fs.appendFileSync(
      typesOutputFile,
      `  ${camelCase(dir)}IndexedSearch,\n`,
    );
    await fs.appendFileSync(typesOutputFile, `  ${camelCase(dir)}Paths,\n`);
    await fs.appendFileSync(typesOutputFile, `  ${camelCase(dir)}Homepage,\n`);
    await fs.appendFileSync(
      typesOutputFile,
      `  ${camelCase(dir)}Encounters,\n`,
    );
  }

  // close exporting by appending "}"
  await fs.appendFileSync(typesOutputFile, "}\n");

  await console.timeEnd(
    colorifyConsole({ label: "time", text: "Extract Encounters" }),
  );
};

extractData();
