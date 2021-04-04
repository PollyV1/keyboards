import stringify from 'json-stringify-pretty-compact';
import glob from 'glob';
import fs from 'fs';
import {copySync} from 'fs-extra';
import rimraf from 'rimraf';
import {promisify} from 'bluebird';
import {
  generateVIADefinitionV3LookupMap,
  getTheme,
  KeyboardDefinitionIndex,
} from 'via-reader';

const viaAPIVersionV3 = '3.0.0-beta';
const outputPath = 'dist/v3';

async function buildV3() {
  try {
    await promisify(rimraf)('dist/*');

    const paths = glob.sync('v3/**/*.json', {absolute: true});

    const [v3Definitions] = [paths].map((paths) =>
      paths.map((f) => require(f))
    );

    const definitions = generateVIADefinitionV3LookupMap(v3Definitions);

    const definitionIndex: KeyboardDefinitionIndex = {
      generatedAt: Date.now(),
      version: viaAPIVersionV3,
      theme: getTheme(),
      vendorProductIds: Object.keys(definitions),
    };

    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath);
    }

    fs.writeFileSync(`${outputPath}/index.json`, stringify(definitionIndex));
    Object.values(definitions).forEach((definition) => {
      fs.writeFileSync(
        `${outputPath}/${definition.vendorProductId}.json`,
        stringify(definition)
      );
    });
    copySync('common-menus', `${outputPath}/common-menus`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

buildV3();
