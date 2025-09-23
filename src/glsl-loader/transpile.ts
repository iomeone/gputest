import { loadModule, compressAST } from '@use-gpu/shader/glsl';

const stringify = (s: any) => JSON.stringify(s);

export const transpileGLSL = (source: string, resourcePath: string, esModule: boolean = true) => {

  const makeImport = (symbol: string, from: string) => esModule
    ? `import ${symbol} from ${stringify(from)};`
    : `const ${symbol} = require(${stringify(from)});`;
  const preamble = makeImport('{decompressAST}', '@use-gpu/shader/glsl');

  // Parse module source code
  const name = resourcePath.split('/').pop()!.replace(/\.glsl$/, '');
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
    `${esModule ? 'export const ' : 'exports.'}${s} = getSymbol(${stringify(s)});`
  );
  
  let exportDefault;
  if (esModule) {
    exportDefault = 'export default getSymbol();';
  }
  else {
    exportDefault = `
const __default = getSymbol();
Object.defineProperty(exports, '__esModule', { value: true });
Object.assign(exports, __default);
exports.default = __default;
    `
  }
  
  // Compose JS body
  const output = [
    preamble,
    ...imports,
    def,
    libs,

    `const getSymbol = (entry) => ({module: data, libs, entry});`,
    exportDefault,
    ...exportSymbols,
    '/* __GLSL_LOADER_GENERATED */',
  ].join("\n");

  return output;
}
