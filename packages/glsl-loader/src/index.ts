import { getOptions } from 'loader-utils';
import { validate } from 'schema-utils';
import { loadModule, compressAST } from '@use-gpu/shader';

const LOADER_NAME = 'GLSL Loader';

const schema = {
  type: 'object',
  properties: {
    paths: {
      type: 'array',
    }
  },
} as any;

const stringify = (o: any) => JSON.stringify(o).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

function glslLoader(this: any, source: string) {
  const options = this.getOptions();
  validate(schema, options, {
    name: LOADER_NAME,
    baseDataPath: 'options'
  });

  console.log("glslLoader:", source);
  const esModule = typeof options.esModule !== 'undefined' ? options.esModule : true;
  const makeImport = (symbol: string, from: string) => esModule
    ? `import {${symbol}} from ${stringify(from)};`
    : `const {${symbol}} = require(${stringify(from)});`;

  const name = this.resourcePath.split('/').pop().replace(/\.glsl$/, '');
  const module = loadModule(name, source);

  const {code, table, tree} = module;
  const def = `const module = {
    "name": ${stringify(name)},
    "code": ${stringify(code)},
    "table": ${stringify(table)},
    "tree": decompressAST(${stringify(compressAST(tree))}),
  };`

  const preamble = makeImport('decompressAST', '@use-gpu/shader');

  let i = 0;
  const imports = [] as string[];
  const symbols = [] as string[];
  for (const {name} of table.modules) {
    imports.push(makeImport(`m as m${i}`, name + '.glsl'));
    symbols.push(`m${i}`);
  }
  const libs = `const libs = [${symbols.join(', ')}];`

  const output = [
    preamble,
    ...imports,
    def,
    libs,
    `export const m = {module, libs};`,
    `${esModule ? 'export default' : 'module.exports ='} m;`
  ].join("\n");
  
  console.log(output);

  return output;
}

export default glslLoader;