import path from 'path';
import fs from 'fs';

const EXPORTS_JSON = './src/exports.json';
const PACKAGE_JSON = './package.json';
const TARGET = './src';

const writeToTarget = (target: string, data: any) => {
  const dir = path.dirname(target);
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(target, data);
};

// Write out empty index.ts, only direct imports supported
const INDEX_TS = `export const Empty = {}; export default Empty;`;
writeToTarget(path.join(TARGET, 'index.ts'), INDEX_TS);

// Update exports in package.json
try {
  const EXPS = JSON.parse(fs.readFileSync(EXPORTS_JSON).toString());
  const PKG = JSON.parse(fs.readFileSync(PACKAGE_JSON).toString());
  PKG.main = 'src/index.ts';
  PKG.exports = {".": "./src/index.ts"};
  for (const k in EXPS) PKG.exports[`./${k}`] = `./${EXPS[k]}`;

  const json = JSON.stringify(PKG, null, 2);
  fs.writeFileSync(PACKAGE_JSON, json);
  // eslint-disable-next-line
} catch (e) {}
