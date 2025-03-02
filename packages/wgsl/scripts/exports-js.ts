import path from 'path';
import fs from 'fs';

const EXPORTS_JSON = './src/exports.json';
const PACKAGE_JSON = '../../build/packages/wgsl/package.json';

const TARGET_MJS = '../../build/packages/wgsl/mjs';
const TARGET_CJS = '../../build/packages/wgsl/cjs';

const writeToTarget = (target: string, data: any) => {
  const dir = path.dirname(target);
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(target, data);
};

// Write out empty index.ts, only direct imports supported
const INDEX_MJS = `export const Empty = {}; export default Empty;`;
writeToTarget(path.join(TARGET_MJS, 'index.js'), INDEX_MJS);

const INDEX_CJS = `exports.default = {};`;
writeToTarget(path.join(TARGET_CJS, 'index.js'), INDEX_CJS);

const INDEX_D_TS = `export declare const Empty: {}; export default Empty;`;
writeToTarget(path.join(TARGET_CJS, 'index.d.ts'), INDEX_D_TS);
writeToTarget(path.join(TARGET_MJS, 'index.d.ts'), INDEX_D_TS);

// Update exports in package.json
try {
  const EXPS = JSON.parse(fs.readFileSync(EXPORTS_JSON).toString());
  const PKG = JSON.parse(fs.readFileSync(PACKAGE_JSON).toString());

  PKG.main = 'cjs/index.js';
  PKG.module = 'mjs/index.js';
  PKG.exports = {};
  
  const add = (key: string, name: string) => {
    PKG.exports[key] = {
      "types": `./mjs/${name}.d.ts`,
      "import": `./mjs/${name}.js`,
      "require": `./cjs/${name}.js`,
    };
  };

  add('.', 'index');
  for (const k in EXPS) add(`./${k}`, k);

  const json = JSON.stringify(PKG, null, 2);
  fs.writeFileSync(PACKAGE_JSON, json);
} catch (e) {
  console.error(e);
}
