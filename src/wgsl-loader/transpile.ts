// src/wgsl-loader/transpile.ts
import type { Tree } from '@lezer/common';
import MagicString from 'magic-string';

import type {
  ParsedModule,
  CompressedNode,
  SymbolTableT,
  TranspileOptions,
  TranspileOutput,
} from '../shader/types';

// 这些工具/字典应当由你的“语言运行时”导出
import {
  loadModule,         // 语法/语义解析（编译时使用）
  compressAST,        // AST 压缩（编译时使用）
  symbolDictionary as runtimeSymbolDict, // 运行时用到的字段字典（S 等）
} from '../shader/wgsl';

// ----------------------------------------------------------------------------
// 与作者一致的 makeTranspile（且保持泛型签名）
// ----------------------------------------------------------------------------
export const makeTranspile = <T extends SymbolTableT = any>(
  type: string,
  extension: string,
  symbolDictionary: Record<string, string>,
  loadModuleFn: (code: string, name?: string, entry?: string, compressed?: boolean) => ParsedModule,
  compressASTFn: (
    code: string,
    tree: Tree,
    symbols?: T['symbols'],
    modules?: T['modules']
  ) => CompressedNode[],
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
  const tableType  = types ? ': SymbolTable'   : '';
  const moduleType = types ? ': ParsedModule'  : '';
  const bundleType = types ? ': ParsedBundle'  : '';

  const langImports = ['decompressAST', 'decompressString', 'symbolDictionary', 'bindEntryPoint'];
  if (types) langImports.push('ParsedModule', 'ParsedBundle', 'SymbolTable');

  // 允许可选把 @use-gpu/shader/** 重写为相对路径（与作者一致）
  const rootRelative = (imported: string) => {
    if (importRoot == null) return imported;
    if (imported.indexOf(importRoot) !== 0) return imported;
    const depth = resourcePath.split('/').length;
    return '../'.repeat(Math.max(0, depth - 1)) + imported.slice(importRoot.length + 1);
  };

  const stringify = (s: any) => JSON.stringify(s);
  const hexify = (x: number) => (x < 0 ? '-' : '') + '0x' + Math.abs(x).toString(16);
  const trim = (s: string) => s.replace(/^\s+|\s+$/, '') + '\n';

  const makeImport = (symbol: string, from: string) =>
    esModule
      ? `import ${symbol} from ${stringify(rootRelative(from))};`
      : `const ${symbol} = require(${stringify(rootRelative(from))});`;

  const preamble = [
    makeImport(`{${langImports.join(', ')}}`, '@use-gpu/shader/' + type.toLowerCase()),
  ].join('\n');

  // 解析源码
  const name  = resourcePath.split('/').slice(-2).join('/');       // e.g. "render/pick"
  const input = trim(minify ? minifyCode(source) : source);
  const mod   = loadModuleFn(input, name);

  // 取出表格并压缩（删除重复的 declarations 字段）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { code, hash, table: { declarations, ...table }, tree, shake } = mod;

  const { value: t, symbols: s } = compressValue(table, symbolDictionary, '_');
  const { value: c, symbols }    = compressString(code,  symbolDictionary, s,  '_');

  const _dict    = `const {${Object.keys(symbolDictionary).join(',')}} = symbolDictionary;`;
  const _symbols = `const _ = decompressString(${stringify(symbols.join(' '))}.split(' '));`;
  const _table   = `const table${tableType} = ${t};`;

  const _def = `const data${moduleType} = {
  name: ${stringify(name)},
  code: ${c},
  hash: ${hexify(hash)},
  table,
  shake: ${stringify(shake)},
  tree: decompressAST(${stringify(compressASTFn(code, tree!, table.symbols, table.modules))}, table[S]),
};
`;

  // 依赖：仍保持 “模块名 + .扩展名”，由上层（loader 或离线脚本）决定如何映射
  let i = 0;
  const imports: string[] = [];
  const markers: string[] = [];
  if (table.modules) for (const { name } of table.modules) {
    imports.push(makeImport(`m${i}`, name + '.' + extension));
    markers.push(`${stringify(name)}: m${i}`);
    ++i;
  }
  const _libs = `const libs = {${markers.join(', ')}};`;

  // 默认导出
  let exportDefault: string;
  if (esModule) {
    exportDefault = 'export default getSymbol();';
  } else {
    exportDefault = `
const __default = getSymbol();
Object.defineProperty(exports, '__esModule', { value: true });
Object.assign(exports, __default);
exports.default = __default;
`;
  }

  // 拼接结果
  const generated = [
    `/* __${type.toUpperCase()}_LOADER_GENERATED */`,
    preamble,
    ...imports,
    _dict,
    _symbols,
    _table,
    _def,
    _libs,
    `const getSymbol = (entry${maybeStringType})${bundleType} => ({module: bindEntryPoint(data, entry), libs});`,
    exportDefault,
    '',
  ].join('\n');

  const emitSym = (sym: string) =>
    `${esModule ? 'export const ' : 'exports.'}${sym} = getSymbol(${JSON.stringify(sym)});\n`;

  const ret: TranspileOutput = {
    output: '',
    typeDef: null,
    magicString: null,
  };

  const exportsBlock = (table.visibles ?? []).map(emitSym).join('');

  if (sourceMap) {
    const s = new MagicString(source);
    s.prepend(generated);
    s.update(0, source.length, exportsBlock);
    ret.output = s.toString();
    ret.magicString = s;
  } else {
    ret.output = generated + exportsBlock;
  }

  if (typeDef) {
    ret.typeDef = makeTypeDef(table.visibles ?? []);
  }

  return ret;
};

// ----------------------------------------------------------------------------
// 压缩/类型声明工具（保持与作者一致）
// ----------------------------------------------------------------------------
export const compressValue = (
  s: any,
  dictionary: Record<string, string>,
  ns: string,
) => {
  const stringify = (x: any) => JSON.stringify(x);

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

  const encode = (arg: string) => {
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
    } else if (arg != null && typeof arg === 'object') {
      const out: string[] = [];
      for (const k of Object.keys(arg)) {
        const v = traverse(arg[k]);
        if (v != null) {
          const ks = encode(k);
          out.push((ks[0] !== '"' ? `[${ks}]` : ks) + ':' + v);
        }
      }
      return '{' + out.join(',') + '}';
    } else if (typeof arg === 'string') {
      return encode(arg);
    } else if (s !== undefined) {
      return stringify(arg);
    } else return null;
  };

  return { value: traverse(s)!, symbols };
};

export const compressString = (
  s: string,
  dictionary: Record<string, string>,
  symbols: string[],
  ns: string,
) => {
  const stringify = (x: any) => JSON.stringify(x);

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
      .flatMap((x: string | number) =>
        typeof x === 'number'
          ? x
          : x.indexOf(a) >= 0
          ? x.split(a).flatMap(s => [s, b]).slice(0, -1)
          : x
      )
      .filter(x => typeof x === 'number' || x.length);
  };

  for (const [i, v] of symbols.entries()) if (v.length > 3) replace(v, i);
  for (const [i, v] of dvs.entries())      if (v.length > 3) replace(v, -i - 1);

  const parts = ss.map(x =>
    typeof x === 'string' ? stringify(x) : x >= 0 ? x : dks[-x - 1]
  );

  return { value: `${ns}([${parts.join(',')}]).join('')`, symbols };
};

export const makeTypeDef = (symbols: string[]) => (
`import { ParsedBundle } from "../shader/wgsl";
declare const _default: ParsedBundle;
export default _default;
${symbols.map(s => `export declare const ${s}: ParsedBundle;`).join("\n")}
`);

// ----------------------------------------------------------------------------
// 向后兼容的便捷函数：保持你之前脚本/loader 的调用方式
// ----------------------------------------------------------------------------
const identityMinify = (code: string) => code;

/** 旧签名：返回生成后的代码字符串 */
export function transpileWGSL(
  source: string,
  resourcePath: string,
  esModule: boolean = true,
): string {
  const { output } = makeTranspile(
    'WGSL',
    'wgsl',
    runtimeSymbolDict || { S: 'symbols' }, // 兜底，避免 S 未定义
    loadModule,
    compressAST,
    identityMinify,
  )(source, resourcePath, { esModule });

  return output;
}
