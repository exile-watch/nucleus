const fs = require('fs');
const { kebabCase } = require('lodash');
const {getDirectories, colorifyConsole} = require("./utils");
const {tokensPath, extractedDataPath} = require("./paths");

const data = [];

getDirectories(tokensPath).forEach((dir) => {
  fs.readdirSync(`${extractedDataPath}/${dir}`).forEach((file) => {
    data.push(JSON.parse(fs.readFileSync(`${extractedDataPath}/${dir}/${file}`)));
  });
});

const prepareIndexedSearchData = () =>
  data.reduce((acc, map) => {
    const mapPath = map.map && `/encounters/${map.category}/${kebabCase(map.map)}`;
    let searchObj = [];

    /**
     * Add map name as a separate entity and path to redirect for indexed search
     */
    if (map.map) {
      const newMapIndexedSearch = {
        mapPath,
        mapName: map.map,
      };
      searchObj.push(newMapIndexedSearch);
    }

    /**
     * Add boss name as a separate entity and path to redirect for indexed search
     */
    if (map.bosses) {
      map.bosses.map((boss) => {
        const [encounterName, encounterValues] = Object.entries(boss)[0];
        const encounterPath = map.map
          ? `${mapPath}/${kebabCase(encounterName)}`
          : `/encounters/${map.category}/${kebabCase(encounterName)}`;
        const newEncounterIndexedSearch = {
          ...(map.map && {
            mapPath,
            mapName: map.map,
          }),
          encounterPath,
          encounterName,
        };
        searchObj.push(newEncounterIndexedSearch);

        /**
         * Add every boss ability as a separate entity and path to redirect for indexed search
         */
        if (encounterValues.abilities) {
          encounterValues.abilities.map((ability) => {
            const [encounterAbilityName] = Object.entries(ability)[0];
            const newEncounterAbilityIndexedSearch = {
              ...newEncounterIndexedSearch,
              encounterAbilityPath: `${encounterPath}?ability=${kebabCase(encounterAbilityName)}`,
              encounterAbilityName,
            };

            searchObj.push(newEncounterAbilityIndexedSearch);
          });
        }
      });
    }
    return acc.concat(searchObj);
  }, []);

const categorizeIndexedSearch = async () => {
  const preparedIndexedSearchData = await prepareIndexedSearchData();
  return preparedIndexedSearchData.reduce((acc, data) => {
    const isMap = !data.encounterPath && !data.encounterAbilityPath;
    const isEncounter = data.encounterPath && !data.encounterAbilityPath;
    const isAbility = data.encounterAbilityName;

    if(isMap){
      return {
        ...acc,
        maps: [...acc.maps, data]
      }
    }

    if(isEncounter){
      return {
        ...acc,
        encounters: [...acc.encounters, data]
      }
    }

    if(isAbility){
      return {
        ...acc,
        encounterAbilities: [...acc.encounterAbilities, data]
      }
    }

    return acc
  }, {maps: [], encounters: [], encounterAbilities: []})
}

const buildIndexedSearch = async () => {
  await console.time(
    colorifyConsole({ label: 'time', text: 'Generate Encounters Indexed Search' })
  );
  const preparedIndexedSearchData = await categorizeIndexedSearch();
  return JSON.stringify(preparedIndexedSearchData);
};

buildIndexedSearch()
  .then(async (data) => {
    await fs.writeFileSync(`${extractedDataPath}/indexed-search.json`, data);
    await console.timeEnd(
      colorifyConsole({ label: 'time', text: 'Generate Encounters Indexed Search' })
    );
  })
  .catch(async (err) => {
    await console.log(err);
    await console.timeEnd(
      colorifyConsole({ label: 'time', text: 'Generate Encounters Indexed Search' })
    );
  });
