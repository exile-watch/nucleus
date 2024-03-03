const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { program } = require('commander');

program
  .option('-i, --input <type>', 'Input directory')
  .option('-o, --output <type>', 'Output directory');

program.parse(process.argv);
const options = program.opts();

if (!options.input || !options.output) {
  console.error('Both input and output directories must be specified');
  process.exit(1);
}


function pascalCaseFileName(fileName) {
  const baseName = path.basename(fileName, '.json');
  return 'I' + _.startCase(_.camelCase(baseName)).replace(/ /g, '');
}

function generateTypeScriptInterfaces(json, rootInterfaceName, parentKey = '', root) {
  let output = '';
  let generatedInterfaces = new Map();
  let nameToInterfaceMap = new Map();

  function sanitizeName(name) {
    return name.replace(/[^a-zA-Z0-9]/g, '').replace(/^[0-9]/, '_$&');
  }

  function getInterfaceNameFromNameProperty(name, key) {
    const sanitizedBaseName = name ? sanitizeName(_.startCase(name)) : _.startCase(key);
    if (nameToInterfaceMap.has(sanitizedBaseName)) {
      return nameToInterfaceMap.get(sanitizedBaseName);
    }
    let uniqueName = `I${sanitizedBaseName}`;
    nameToInterfaceMap.set(sanitizedBaseName, uniqueName);
    return uniqueName;
  }

  function getType(value, key) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return 'any[]';
      }
      const itemTypes = new Set(value.map(item => getType(item, key)));
      const uniqueTypes = [...itemTypes];
      if (uniqueTypes.length === 1) {
        return `${uniqueTypes[0]}[]`;
      }
      return `(${uniqueTypes.join(' | ')})[]`;
    } else if (typeof value === 'object' && value !== null) {
      const name = value.name;
      const interfaceName = name ? getInterfaceNameFromNameProperty(name, key) : `I${_.startCase(key)}Rootz`;
      if (!generatedInterfaces.has(interfaceName)) {
        generateInterfaceForObject(value, interfaceName, key);
      }
      return interfaceName;
    }
    return typeof value;
  }

  function generateInterfaceForObject(obj, interfaceName, key) {
    generatedInterfaces.set(interfaceName, true);
    let properties = Object.entries(obj).map(([propKey, value]) => {
      let typeName = getType(value, propKey);
      return `  ${propKey}: ${typeName};`;
    });
    let interfaceContent = `interface ${interfaceName} {\n${properties.join('\n')}\n}\n\n`;
    output += interfaceContent;
  }

  generateInterfaceForObject(json, rootInterfaceName, parentKey);
  return output;
}


function convertJsonToTs(filePath, outputDir) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Failed to read file: ${filePath}`, err);
      return;
    }

    const jsonObject = JSON.parse(data);
    const interfaceName = pascalCaseFileName(filePath);
    const tsContent = generateTypeScriptInterfaces(jsonObject, interfaceName);

    const outputFilePath = path.join(outputDir, `${interfaceName}.d.ts`);
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFile(outputFilePath, tsContent, (err) => {
      if (err) {
        console.error(`Failed to write TypeScript file: ${outputFilePath}`, err);
        return;
      }
      console.log(`TypeScript interface generated successfully for ${filePath}`);
    });
  });
}

function processDirectory(inputDir, outputDir) {
  fs.readdir(inputDir, { withFileTypes: true }, (err, entries) => {
    if (err) {
      console.error('Error reading input directory:', err);
      return;
    }
    entries.forEach(entry => {
      const relativePath = path.join(inputDir, entry.name);
      const outputPath = entry.isDirectory() ? path.join(outputDir, entry.name) : outputDir;

      if (entry.isDirectory()) {
        fs.mkdirSync(outputPath, { recursive: true }); // Ensure output directory structure mirrors input
        processDirectory(relativePath, outputPath);
      } else if (path.extname(entry.name) === '.json') {
        convertJsonToTs(relativePath, outputPath);
      }
    });
  });
}

processDirectory(options.input, options.output);
