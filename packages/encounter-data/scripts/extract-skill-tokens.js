const fs = require('fs');
const yaml = require('js-yaml');
const {colorifyConsole, getDirectories} = require("./utils");
const {tokensPath, extractedDataPath} = require("./paths");

const extractSkillTokens = async () => {
  await console.time(colorifyConsole({ label: 'time', text: 'Extract Encounters Spells' }));
  const directories = await getDirectories(tokensPath);

  for await (const dir of directories) {
    const extractedSkills = await yaml.load(fs.readFileSync(`${tokensPath}/${dir}/skills.yml`, 'utf8'));

    await fs.writeFileSync(`${extractedDataPath}/${dir}/skills.json`, JSON.stringify(extractedSkills, null, 2));
  }

  await console.timeEnd(colorifyConsole({label: 'time', text: 'Extract Encounters Spells'}));
}

extractSkillTokens()
