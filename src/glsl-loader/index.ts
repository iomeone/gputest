import { getOptions } from 'loader-utils';
import { validate } from 'schema-utils';
import { loadModule, compressAST } from '@use-gpu/shader';

const LOADER_NAME = 'GLSL Loader';

const schema = {
  type: 'object',
  properties: {
  },
} as any;

const stringify = (o: any) => JSON.stringify(o).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

function glslLoader(this: any, source: string) {

  // Parse options
  const options = this.getOptions();
  validate(schema, options, {
    name: LOADER_NAME,
    baseDataPath: 'options'
  });

  const esModule = typeof options.esModule !== 'undefined' ? options.esModule : true;
  const makeImport = (symbol: string, from: string) => esModule
    ? `import ${symbol} from ${stringify(from)};`
    : `const ${symbol} = require(${stringify(from)});`;
  const preamble = makeImport('{decompressAST}', '@use-gpu/shader');

  // Parse module source code
  const name = this.resourcePath.split('/').pop().replace(/\.glsl$/, '');
  const module = loadModule(source, name);

  // Emit module data
  const {code, table, tree, shake} = module;
  const def = `const data = {
    "name": ${stringify(name)},
    "code": ${stringify(code)},
    "table": ${stringify(table)},
    "shake": ${stringify(shake)},
    "tree": decompressAST(${stringify(compressAST(tree))}),
  };`

  // Emit dependency imports
  let i = 0;
  const imports = [] as string[];
  const markers = [] as string[];
  for (const {name} of table.modules) {
    imports.push(makeImport(`m${i}`, name + '.glsl'));
    markers.push(`${stringify(name)}: m${i}`);
    ++i;
  }
  const libs = `const libs = {${markers.join(', ')}};`

  // Export visible symbols
  const exportSymbols = table.visibles.map((s: string) => 
    `${esModule ? 'export const ' : 'module.exports.'}${s} = getSymbol(${stringify(s)});`
  );
  const exportDefault = `${esModule ? 'export default' : 'module.exports ='} getSymbol();`;

  // Compose JS body
  const output = [
    preamble,
    ...imports,
    def,
    libs,

    `const getSymbol = (entry) => ({module: data, libs, entry});`,
    exportDefault,
    ...exportSymbols,
  ].join("\n");

  return output;
}

export default glslLoader;