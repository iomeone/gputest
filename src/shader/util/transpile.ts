import { Tree } from '@lezer/common';
import { ParsedModule, CompressedNode, SymbolTableT, TranspileOptions, TranspileOutput } from '../types';
import MagicString from 'magic-string';

export const makeTranspile = <T extends SymbolTableT = any>(
  type: string,
  extension: string,
  symbolDictionary: Record<string, string>,
  loadModule: (code: string, name?: string, entry?: string, compressed?: boolean) => ParsedModule,
  compressAST: (code: string, tree: Tree, symbols?: T['symbols'], modules?: T['modules']) => CompressedNode[],
  minifyCode: (code: string) => string,
) => (
  source: string,
  resourcePath: string,
  options?: TranspileOptions,
): TranspileOutput => {
  const {
    esModule = true,
    minify = false,
    types = false,
    typeDef = false,
    sourceMap = false,
    importRoot = null,    
  } = options ?? ({} as TranspileOptions);

  const maybeStringType = types ? '?: string' : '';
  const tableType  = types ? ': SymbolTable' : '';
  const moduleType = types ? ': ParsedModule' : '';
  const bundleType = types ? ': ParsedBundle' : '';

  const langImports = ['decompressAST', 'decompressString', 'symbolDictionary', 'bindEntryPoint'];
  if (types) langImports.push('ParsedModule', 'ParsedBundle', 'SymbolTable');

  const rootRelative = (imported: string) => {
    if (importRoot == null) return imported;
    if (imported.indexOf(importRoot) !== 0) return imported;

    const depth = resourcePath.split('/').length;
    return '../'.repeat(Math.max(0, depth - 1)) + imported.slice(importRoot.length + 1);
  };

  const makeImport = (symbol: string, from: string) => esModule
    ? `import ${symbol} from ${stringify(rootRelative(from))};`
    : `const ${symbol} = require(${stringify(rootRelative(from))});`;

  const preamble = [
    makeImport(`{${langImports.join(', ')}}`, '@use-gpu/shader/' + type.toLowerCase()),
  ].join("\n");

  // Parse module source code
  const name = resourcePath.split('/').slice(-2).join('/');
  const input = trim(minify ? minifyCode(source) : source);
  const module = loadModule(input, name);

  // Emit module data (without declarations, which is repeated in externals/exports)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {code, hash, table: {declarations, ...table}, tree, shake} = module;

  const {value: t, symbols: s} = compressValue(table, symbolDictionary, '_');
  const {value: c, symbols} = compressString(code, symbolDictionary, s, '_');

  const _dict = `const {${Object.keys(symbolDictionary).join(',')}} = symbolDictionary;`;
  const _symbols = `const _ = decompressString(${stringify(symbols.join(' '))}.split(' '));`;
  const _table = `const table${tableType} = ${t};`;

  const _def = `const data${moduleType} = {
  name: ${stringify(name)},
  code: ${c},
  hash: ${hexify(hash)},
  table,
  shake: ${stringify(shake)},
`+
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
`  tree: decompressAST(${stringify(compressAST(code, tree!, table.symbols, table.modules))}, table[S]),
};
`;

  // Emit dependency imports
  let i = 0;
  const imports = [] as string[];
  const markers = [] as string[];
  if (table.modules) for (const {name} of table.modules) {
    imports.push(makeImport(`m${i}`, name + '.' + extension));
    markers.push(`${stringify(name)}: m${i}`);
    ++i;
  }
  const _libs = `const libs = {${markers.join(', ')}};`

  // Export default
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
  const generated = [
    '/* __' + type.toUpperCase() + '_LOADER_GENERATED */',
    preamble,
    ...imports,
    _dict,
    _symbols,
    _table,
    _def,
    _libs,

    `const getSymbol = (entry${maybeStringType})${bundleType} => ({module: bindEntryPoint(data, entry), libs});`,
    exportDefault,
    ''
  ].join("\n");

  const getSymbol = (s: string) => `${esModule ? 'export const ' : 'exports.'}${s} = getSymbol(${stringify(s)});\n`;

  const ret: TranspileOutput = {
    output: '',
    typeDef: null,
    magicString: null,
  };

  const getSymbols = table.visibles.map(getSymbol).join("");

  if (sourceMap) {
    // Generate combined source + map
    const s = new MagicString(source);
    s.prepend(generated);
    s.update(0, source.length, getSymbols);

    ret.output = s.toString();
    ret.magicString = s;
  }
  else {
    // Just concatenate
    ret.output = generated + getSymbols;
  }

  if (typeDef) {
    ret.typeDef = makeTypeDef(table.visibles ?? []);
  }

  return ret;
};

const stringify = (s: any) => JSON.stringify(s);
const hexify = (x: number) => (x < 0 ? '-' : '') + '0x' + Math.abs(x).toString(16);
const trim = (s: string) => s.replace(/^\s+|\s+$/, '') + "\n";

export const compressValue = (
  s: string,
  dictionary: Record<string, string>,
  ns: string,
) => {
  const symbolMap = new Map<string, number>();
  const symbols: string[] = [];

  const dictionaryMap = new Map<string, string>();
  for (const k in dictionary) dictionaryMap.set(dictionary[k], k);

  const get = (symbol: string) => {
    if (dictionaryMap.has(symbol)) return dictionaryMap.get(symbol)!;
    if (symbol.length < 3 || symbol.indexOf(' ') >= 0) return stringify(symbol);
    if (symbolMap.has(symbol)) return symbolMap.get(symbol)!;

    const i = symbols.length;
    symbolMap.set(symbol, i);
    symbols.push(symbol);
    return i;
  };

  const encode = (arg: string, raw: boolean = false) => {
    const i = get(arg);
    if (typeof i === 'string') return i;
    return `${ns}(${i})`;
  };

  const traverse = (arg: any): string | null => {
    if (Array.isArray(arg)) {
      if (arg.every(s => typeof s === 'string')) {
        return `${ns}([${arg.map(get).join(',')}])`;
      }
      return '[' + arg.map(traverse).join(',') + ']';
    }
    else if (arg != null && typeof arg === 'object') {
      const out: string[] = [];
      for (const k of Object.keys(arg)) {
        const v = traverse(arg[k]);
        if (v != null) {
          const ks = encode(k);
          out.push((ks[0] !== '"' ? `[${ks}]` : ks) + ':' + v);
        }
      }
      return '{' + out.join(',') + '}';
    }
    else if (typeof arg === 'string') {
      return encode(arg);
    }
    else if (s !== undefined) return stringify(arg);
    else return null;
  };

  return {
    value: traverse(s),
    symbols,
  };
};

export const compressString = (
  s: string,
  dictionary: Record<string, string>,
  symbols: string[],
  ns: string,
) => {
  let dks = Object.keys(dictionary);
  let dvs = Object.values(dictionary);

  let ss: (string | number)[] = [s];
  symbols = symbols.slice();

  const histo = new Map<string, number>();
  const exprs = s.matchAll(/\b[A-Za-z_][A-Za-z0-9_]+(<[^>]+>)?\b/g);
  for (const [e] of exprs) histo.set(e, (histo.get(e) || 0) + 1);

  const keys = [...histo.keys()].filter(k => k.length > 5 && histo.get(k)! > 2);
  symbols.push(...keys);

  const replace = (a: string, b: number) => {
    ss = ss
      .flatMap((s: string | number) => (
        typeof s === 'number' ? s :
        s.indexOf(a) >= 0 ? s.split(a).flatMap(s => [s, b]).slice(0, -1) :
        s
      ))
      .filter(s => typeof s === 'number' || s.length);
  };
  
  for (const [i, s] of symbols.entries()) if (s.length > 3) replace(s, i);
  for (const [i, s] of dvs.entries()) if (s.length > 3) replace(s, -i-1);
  
  const parts = ss.map(s => (
    typeof s === 'string' ? stringify(s) :
    s >= 0 ? s : dks[-s-1]
  ));

  return {
    value: `${ns}([${parts.join(',')}]).join('')`,
    symbols,
  };
};

export const makeTypeDef = (symbols: string[]) => (
`import { ParsedBundle } from "@use-gpu/shader/wgsl";
declare const _default: ParsedBundle;
export default _default;
${symbols.map(s => `export declare const ${s}: ParsedBundle;`).join("\n")}
`);
