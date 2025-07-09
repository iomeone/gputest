import { statSync, readFileSync, writeFileSync } from 'fs';
import glob from 'glob';

// Replace single TS entry point with MJS/CJS main+module

const pkg = process.env.NPM_PACKAGE;
if (pkg == null) {
  console.log("Can't build package.json - NPM_PACKAGE not set");
  process.exit(1);
}

const files = glob.sync(`../../build/packages/${pkg}/package.json`);
for (const file of files) {
  let data = readFileSync(file).toString();
  let json = JSON.parse(data);

  if (json.main === 'src/index.ts') {

    const mjs = file.replace(/\/package\.json$/, '/mjs');
    try {
      let stat = statSync(mjs);
      json.main = './cjs/index.cjs';
      json.module = './mjs/index.mjs';

      if (json.exports) {
        const convert = (value: string) => {
          value = value.replace(/(\.d)?\.ts$/, '.js');

          return {
            types: value.replace('./src/', './mjs/').replace(/\.js$/, '.d.mts'),
            import: value.replace('./src/', './mjs/').replace(/\.js$/, '.mjs'),
            require: value.replace('./src/', './cjs/').replace(/\.js$/, '.cjs'),
          };
        }
        for (let k in json.exports) {
          const v = json.exports[k];
          if (typeof v === 'string') {
            json.exports[k] = convert(v);
          }
        }
      }

      const types = glob.sync(file.replace(/\/package\.json$/, '/*.d.ts'));
      for (const dts of types) {
        let ts = readFileSync(dts).toString();
        ts = ts.replace(/\.\/src\//g, './mjs/');
        writeFileSync(dts, ts);
      }

    } catch (e) {};

  }

  data = JSON.stringify(json, null, 2);
  writeFileSync(file, data);
}
