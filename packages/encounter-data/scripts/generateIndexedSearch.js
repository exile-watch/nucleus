const fs = require('fs');
const { kebabCase, camelCase} = require('lodash');
const {getDirectories, colorifyConsole, writeFiles} = require("./utils");
const {tokensPath, extractedDataPath, typesOutputFile} = require("./paths");

const prepareIndexedSearchData = (data) =>
  data.reduce((acc, d) => {
    const mapPath = d.map && `${d.dir}/encounters/${d.category}/${kebabCase(d.map)}`;
    let searchObj = [];

    /**
     * Add map name as a separate entity and path to redirect for indexed search
     */
    if (d.map) {
      const newMapIndexedSearch = {
        mapPath,
        mapName: d.map,
      };
      searchObj.push(newMapIndexedSearch);
    }

    /**
     * Add boss name as a separate entity and path to redirect for indexed search
     */
    if (d.bosses) {
      d.bosses.map(({name: encounterName, abilities}) => {
        const encounterPath = d.map
          ? `${mapPath}/${kebabCase(encounterName)}`
          : `${d.dir}/encounters/${d.category}/${kebabCase(encounterName)}`;
        const newEncounterIndexedSearch = {
          ...(d.map && {
            mapPath,
            mapName: d.map,
          }),
          encounterPath,
          encounterName,
        };
        searchObj.push(newEncounterIndexedSearch);

        /**
         * Add every boss ability as a separate entity and path to redirect for indexed search
         */
        if (abilities) {
          abilities.map(({name: encounterAbilityName}) => {
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

const categorizeIndexedSearch = async (data) => {
  const preparedIndexedSearchData = await prepareIndexedSearchData(data);
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

const generateIndexedSearch = async () => {
  await console.time(colorifyConsole({label: 'time', text: 'Generate encounters indexed-search'}));

  await writeFiles(async ({data, dir}) => {
    const preparedIndexedSearchData = await categorizeIndexedSearch(data);
    const indexedSearch = JSON.stringify(preparedIndexedSearchData, null, 2);
    await fs.writeFileSync(`${extractedDataPath}/${dir}/indexed-search.json`, indexedSearch);
  })

  await console.timeEnd(colorifyConsole({label: 'time', text: 'Generate encounters indexed-search'}));
}

generateIndexedSearch()