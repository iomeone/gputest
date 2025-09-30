// src/wgsl-loader/transpile.ts
import { loadModule, compressAST } from '../shader/wgsl';
import path from 'path';

const REWRITE_DEPS_TO_GEN = false; // ← 若需要像你早期那样把依赖重写到 gen-wgsl，改为 true

const stringify = (s: any) => JSON.stringify(s);
const toPosix = (p: string) => p.replace(/\\/g, '/');

// （可选）编译期“字典”，用于更好的压缩效果；项目里若有，可替换为实际的字典。
// 例如：从 ../shader/wgsl 导出 symbolDictionary 并在这里 import 使用。
const DICT: Record<string, string> = {};

// ------- helpers (compile-time only) -------
const hexify = (x: number) => (x < 0 ? '-' : '') + '0x' + Math.abs(x).toString(16);

/** 压缩对象中的字符串键值（运行时配合 symbolDictionary / decompressString 解压） */
function compressValue(
  s: any,
  dictionary: Record<string, string>,
  ns: string
) {
  const symbolMap = new Map<string, number>();
  const symbols: string[] = [];

  const dictionaryMap = new Map<string, string>();
  for (const k in dictionary) dictionaryMap.set(dictionary[k], k);

  const get = (symbol: string) => {
    if (dictionaryMap.has(symbol)) return dictionaryMap.get(symbol)!;
    if (symbol.length < 3 || symbol.indexOf(' ') >= 0) return JSON.stringify(symbol);
    if (symbolMap.has(symbol)) return symbolMap.get(symbol)!;
    const i = symbols.length;
    symbolMap.set(symbol, i);
    symbols.push(symbol);
    return i;
  };

  const encode = (arg: string) => {
    const i = get(arg);
    return typeof i === 'string' ? i : `${ns}(${i})`;
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
    } else if (s !== undefined) return JSON.stringify(arg);
    else return null;
  };

  return { value: traverse(s)!, symbols };
}

/** 压缩源码字符串（把高频标识替换为占位符，运行时再解压还原） */
function compressString(
  s: string,
  dictionary: Record<string, string>,
  symbols: string[],
  ns: string
) {
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
      .flatMap((x: string | number) => (
        typeof x === 'number' ? x :
        x.indexOf(a) >= 0 ? x.split(a).flatMap(y => [y, b]).slice(0, -1) :
        x
      ))
      .filter(x => typeof x === 'number' || (x as string).length);
  };

  for (const [i, k] of symbols.entries()) if (k.length > 3) replace(k, i);
  for (const [i, v] of dvs.entries()) if (v.length > 3) replace(v, -i - 1);

  const parts = ss.map(x => (
    typeof x === 'string' ? JSON.stringify(x) :
    x >= 0 ? x : dks[-x - 1]
  ));

  return { value: `${ns}([${parts.join(',')}]).join('')`, symbols };
}

// ------- main transpiler -------

/**
 * 兼容旧签名 (esModule:boolean) 与新签名 (options:{ esModule?, minify? })
 */
export const transpileWGSL = (
  source: string,
  resourcePath: string,
  esModuleOrOptions: boolean | { esModule?: boolean; minify?: boolean } = true
) => {
  const esModule = typeof esModuleOrOptions === 'boolean'
    ? esModuleOrOptions
    : (esModuleOrOptions.esModule ?? true);
  const minify = typeof esModuleOrOptions === 'boolean'
    ? false
    : !!esModuleOrOptions.minify;

  const makeImport = (symbol: string, from: string) =>
    esModule
      ? `import ${symbol} from ${stringify(from)};`
      : `const ${symbol} = require(${stringify(from)});`;

  // ---------- 计算相对前言导入（与你原先一致，但导入清单升级为作者新版所需） ----------
  let preamble = '';
  {
    const rp = toPosix(resourcePath);

    // 识别“以 src 为根”的 wgsl 子目录
    let dirRelToSrc: string | null = null;
    let m = rp.match(/\/src\/wgsl\/(.+)\/[^/]+\.wgsl$/);
    if (m) {
      dirRelToSrc = `wgsl/${m[1]}`;
    } else {
      m = rp.match(/^wgsl\/(.+)\/[^/]+\.wgsl$/);
      if (m) {
        dirRelToSrc = `wgsl/${m[1]}`;
      } else if (/\/src\/wgsl\/[^/]+\.wgsl$/.test(rp)) {
        dirRelToSrc = 'wgsl';
      } else if (/^wgsl\/[^/]+\.wgsl$/.test(rp)) {
        dirRelToSrc = 'wgsl';
      }
    }

    const TARGET_LANG = 'shader/wgsl'; // decompressAST/decompressString/symbolDictionary/bindEntryPoint 所在

    const relFrom = (from: string, to: string) => {
      let rel = path.posix.relative(from, to);
      if (!rel.startsWith('.')) rel = './' + rel;
      return rel;
    };

    let decompressFrom: string;
    if (dirRelToSrc) {
      decompressFrom = relFrom(dirRelToSrc, TARGET_LANG);
    } else {
      const dir = rp.includes('/') ? rp.slice(0, rp.lastIndexOf('/')) : '.';
      decompressFrom = relFrom(dir, TARGET_LANG);
    }

    // 新版需要的四个导入
    preamble = makeImport(
      '{decompressAST, decompressString, symbolDictionary, bindEntryPoint}',
      decompressFrom
    );
  }

  // ---------- 解析 ----------
  // 作者新版 name 取倒数两段，避免冲突
  const name = resourcePath
    .split('/')
    .slice(-2)
    .join('/')
    .replace(/\.wgsl$/, '');

  const input = (minify ? source : source).trim();
  const module = loadModule(input, name);

  // ---------- 生成 data（升级为“表与源码压缩 + 运行时解压”） ----------
  const { code, hash, table: { declarations, ...table }, tree, shake } = module;

  const { value: tableExpr, symbols: tableSyms } = compressValue(table, DICT, '_');
  const { value: codeExpr,  symbols: codeSyms  } = compressString(code, DICT, tableSyms, '_');

  const _dict    = `const {${Object.keys(DICT).join(',')}} = symbolDictionary;`;
  const _symbols = `const _ = decompressString(${stringify(codeSyms.join(' '))}.split(' '));`;

  const def = [
    `const t = ${tableExpr};`,
    `const data = {`,
    `  "name": ${stringify(name)},`,
    `  "code": ${codeExpr},`,
    `  "hash": ${stringify(hash)},`,
    `  "table": t,`,
    `  "shake": ${stringify(shake)},`,
    // compressAST 也按新版：多传 symbols 与 modules
    `  "tree": decompressAST(${stringify(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      compressAST(code, tree!, (table as any).symbols, (table as any).modules)
    )}, t[S]),`,
    `};`
  ].join('\n');

  // ---------- 依赖导入 ----------
  let i = 0;
  const imports: string[] = [];
  const markers: string[] = [];

  // 按你早期的“重写到 gen-wgsl”逻辑保留一个开关（默认 false -> 不重写）
  if ((table as any).modules && Array.isArray((table as any).modules)) {
    const rp = toPosix(resourcePath);

    // 当前 wgsl 所在（以 src 为根）
    let relFromSrc = rp;
    const mAbs = rp.match(/\/src\/(wgsl\/.*)$/);
    if (mAbs) relFromSrc = mAbs[1];

    const curDirRelSrc = relFromSrc.replace(/\/[^/]+\.wgsl$/, '');   // wgsl/instance/vertex
    const curOutDir    = curDirRelSrc.replace(/^wgsl\//, 'gen-wgsl/'); // gen-wgsl/instance/vertex
    const depthSegs    = curOutDir.split('/').filter(Boolean).length;
    const rootPrefix   = depthSegs ? '../'.repeat(depthSegs) : './';

    for (const { name: depName } of (table as any).modules as Array<{ name: string }>) {
      let spec: string;

      if (REWRITE_DEPS_TO_GEN) {
        // 把依赖映射到 gen-wgsl（老流程）
        let depNorm: string;
        if (depName.startsWith('@use-gpu/wgsl/')) {
          depNorm = 'wgsl/' + depName.slice('@use-gpu/wgsl/'.length);
        } else if (depName.startsWith('wgsl/')) {
          depNorm = depName;
        } else {
          // 相对路径 -> 归一为以当前 wgsl 所在目录为起点
          depNorm = path.posix.normalize(path.posix.join(curDirRelSrc, depName));
        }
        const depUnder = depNorm.replace(/^wgsl\//, '');
        spec = `${rootPrefix}gen-wgsl/${depUnder}`;
      } else {
        // 不重写：延续作者“依赖名 + .wgsl”的做法
        spec = depName + '.wgsl';
      }

      imports.push(makeImport(`m${i}`, spec));
      markers.push(`${stringify(depName)}: m${i}`);
      ++i;
    }
  }

  const libs = `const libs = {${markers.join(', ')}};`;

  // ---------- 导出 ----------
  const exportSymbols = ((table as any).visibles ?? []).map((s: string) =>
    `${esModule ? 'export const ' : 'exports.'}${s} = getSymbol(${stringify(s)});`
  );

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

  // ---------- 拼接 ----------
  const output = [
    '/* __WGSL_LOADER_GENERATED */',
    preamble,
    ...imports,
    _dict,
    _symbols,
    def,
    libs,
    `const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });`,
    exportDefault,
    ...exportSymbols,
    ''
  ].join('\n');

  return output;
};
