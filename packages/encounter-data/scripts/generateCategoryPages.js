const { kebabCase, startCase } = require("lodash");
const fs = require("node:fs");

const { extractedDataPath } = require("./paths");
const { colorifyConsole, writeFiles } = require("./utils");

const prepareCategoriesData = (data) =>
  data.reduce((acc, d) => {
    const { name: encounterName, abilities } = d.encounters[0];
    const { gif } = abilities.pop();

    const path = d.map
      ? `/${d.dir}/encounters/${d.category}/${kebabCase(d.map)}/${kebabCase(
          encounterName,
        )}`
      : `/${d.dir}/encounters/${d.category}/${kebabCase(encounterName)}`;

    return {
      ...acc,
      [d.category]: [
        ...(acc[d.category] ?? []),
        {
          name: d.map ? startCase(d.map) : startCase(encounterName),
          path,
          gif,
        },
      ],
    };
  }, {});

const buildCategoryPage = async () => {
  await console.time(
    colorifyConsole({ label: "time", text: "Generate Homepage tiles" }),
  );

  await writeFiles(async ({ data, dir, subDirectories }) => {
    const preparedCategoriesData = await prepareCategoriesData(data);

    for (const subDir of subDirectories) {
      const categoryEncounters = Object.values(preparedCategoriesData[subDir]);

      await fs.writeFileSync(
        `${extractedDataPath}/${dir}/${subDir}.json`,
        JSON.stringify(categoryEncounters, null, 2),
      );
    }
  });

  await console.timeEnd(
    colorifyConsole({ label: "time", text: "Generate Homepage tiles" }),
  );
};

buildCategoryPage();
