// 文件：src/glsl-loader/build.ts
//
// 运行：
//   npx ts-node src/glsl-loader/build.ts
//
// 功能：
//   1) 扫描 src/glsl/**/*.glsl
//   2) 复制 .glsl 到 build/packages/glsl/ 同路径
//   3) 解析每个 .glsl，收集 table.visibles（使用本地 src/shader）
//   4) 生成 src/index.ts（GLSLModules 静态映射）
//   5) 生成 src/glsl.d.ts（为每个 .glsl 写出具名导出的声明）
//   6) 更新 package.json.exports（逐文件映射）
//
// 日志：详细打印每一步与关键路径，方便排查。

import * as path from 'path';
import * as fs from 'fs';
import glob from 'glob';

// ✔ 用本地 shader 工程（不依赖外部包）
// import { makeShaderLanguages } from '../shader';

import { loadModule  as parseGLSL} from '../shader/transform/shader';

// ------------------------- 配置 & 日志 -------------------------
const VERBOSE = true; // 如需安静模式可改为 false

function log(...args: any[]) {
  if (VERBOSE) console.log(...args);
}
function banner(title: string) {
  const line = '-'.repeat(64);
  console.log(`\n${line}\n[build] ${title}\n${line}`);
}
function relTo(p: string, base: string) {
  return path.relative(base, p) || '.';
}


function errMsg(e: unknown): string {
  return (e as any)?.message || String(e);
}
const t0 = Date.now();

// ------------------------- 路径基准 -------------------------
const ROOT     = path.resolve(__dirname, '..', '..');   // 项目根（src/ 的上一级）
const SRC_DIR  = path.join(ROOT, 'src');
const GLSL_DIR = path.join(SRC_DIR, 'glsl');

const PACKAGE_JSON = path.join(ROOT, 'package.json');
const INDEX_TS     = path.join(SRC_DIR, 'index.ts');
const TYPEDEF_TS   = path.join(SRC_DIR, 'glsl.d.ts');
const TARGET       = path.join(ROOT, 'build', 'packages', 'glsl');

banner('环境与路径');
console.log('[build] node version :', process.version);
console.log('[build] process.cwd  :', process.cwd());
console.log('[build] __dirname    :', __dirname);
console.log('[build] ROOT         :', ROOT);
console.log('[build] SRC_DIR      :', SRC_DIR);
console.log('[build] GLSL_DIR     :', GLSL_DIR);
console.log('[build] PACKAGE_JSON :', PACKAGE_JSON);
console.log('[build] INDEX_TS     :', INDEX_TS);
console.log('[build] TYPEDEF_TS   :', TYPEDEF_TS);
console.log('[build] TARGET       :', TARGET);

// ------------------------- 小工具 -------------------------
const toPosix = (p: string) => p.replace(/\\/g, '/');
const serialize = (v: any) => JSON.stringify(v, null, 2);

function ensureDirSync(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function copyToTarget(absFile: string) {
  const relFromSrc = path.relative(SRC_DIR, absFile); // e.g. glsl/instance/vertex/line.glsl
  const dest = path.join(TARGET, relFromSrc);
  ensureDirSync(path.dirname(dest));
  fs.copyFileSync(absFile, dest);
  log(`  [copy] ${relTo(absFile, ROOT)}  →  ${relTo(dest, ROOT)}`);
}

// ------------------------- 扫描 GLSL -------------------------
banner('扫描 GLSL 文件');
const fileRels = glob.sync('glsl/**/*.glsl', { cwd: SRC_DIR, nodir: true }); // 相对 src
if (!fileRels.length) {
  console.warn('[build] 未在 src/glsl 下找到任何 .glsl 文件，退出。');
  process.exit(0);
}
const filesAbs = fileRels.map(rel => path.join(SRC_DIR, rel));
filesAbs.forEach(f => log('  [found]', relTo(f, ROOT)));
console.log(`[build] 共计 ${filesAbs.length} 个 .glsl 文件。`);

// ------------------------- 解析器（本地 shader） -------------------------
// banner('初始化本地 shader 解析器');
// const languages: any = makeShaderLanguages();
// const loadModule: any = languages?.loadModule;
// if (typeof loadModule !== 'function') {
//   console.error('[build] 错误：makeShaderLanguages() 未提供 loadModule。请检查 src/shader 导出。');
//   process.exit(1);
// }
// console.log('[build] 解析器就绪：loadModule(function)');



banner('加载本地 shader 解析器');
if (typeof parseGLSL  !== 'function') {
  console.error('[build] 错误：未找到 loadModule（../shader/transform/shader）。');
  process.exit(1);
}
console.log('[build] 解析器就绪：loadModule(function) 来自 ../shader/transform/shader');



// ------------------------- 复制 + 解析 -------------------------
banner('复制到 build/ 并解析可见符号');
const names: string[] = [];   // 形如 "glsl/…/line"
const modules: any[] = [];    // loadModule 的返回（含 table.visibles）
let totalVisibles = 0;

for (const abs of filesAbs) {
  copyToTarget(abs);

  const relFromSrc = toPosix(path.relative(SRC_DIR, abs)); // glsl/.../x.glsl
  const name = relFromSrc.replace(/\.glsl$/, '');          // glsl/.../x
  names.push(name);

  const code = fs.readFileSync(abs, 'utf8');
  try {
    const mod = parseGLSL(code, 'code');
    const visibles: string[] = mod?.table?.visibles ?? [];
    modules.push(mod);
    totalVisibles += visibles.length;
    log(`  [parse] ${relFromSrc}  (visibles: ${visibles.length})`);
  } catch (e) {
    console.warn(`  [parse:ERR] ${relFromSrc}  -> ${errMsg(e)}`);
    modules.push({ table: { visibles: [] } });
  }
}
console.log(`[build] 解析完成：${filesAbs.length} 文件，总计 ${totalVisibles} 个可见符号。`);

// ------------------------- 更新 package.json exports -------------------------
banner('更新 package.json exports');
try {
  const pkgRaw = fs.readFileSync(PACKAGE_JSON, 'utf8');
  const pkg = JSON.parse(pkgRaw);

  pkg.exports = { '.': './src/index.ts' };

  let added = 0;
  for (const rel of fileRels) {
    const key = './' + toPosix(rel);       // "./glsl/.../x.glsl"
    const val = './src/' + toPosix(rel);   // "./src/glsl/.../x.glsl"
    pkg.exports[key] = val;
    added++;
    log(`  [export] ${key} -> ${val}`);
  }
  fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2));
  console.log(`[build] exports 更新完成：新增 ${added} 条项；"." -> "./src/index.ts"。`);
} catch (e) {
  console.warn('[build] 写入 package.json 失败：', errMsg(e));
}

// ------------------------- 生成 src/index.ts -------------------------
banner('生成 src/index.ts (GLSLModules)');
const staticMap: Record<string, string> = {};
filesAbs.forEach((abs, i) => {
  const code = fs.readFileSync(abs, 'utf8');
  staticMap[names[i]] = code;
  staticMap['@use-gpu/glsl/' + names[i]] = code; // 兼容旧键
});
const indexTs = `// File generated by build.ts (local). Do not edit directly.
// This file provides all the shader code in a statically importable form, used for testing.
export const GLSLModules = ${serialize(staticMap)};
export default GLSLModules;
`;
fs.writeFileSync(INDEX_TS, indexTs);
console.log('[build] 写入：', relTo(INDEX_TS, ROOT), `（${Buffer.byteLength(indexTs, 'utf8')} bytes）`);

// ------------------------- 生成 src/glsl.d.ts -------------------------
banner('生成 src/glsl.d.ts（具名导出声明）');
/**
 * 注意：d.ts 内的类型导入路径以生成文件（src/glsl.d.ts）为基准。
 * 因此使用 "./shader/types"（指向 src/shader/types.ts 的声明）。
 */
const makeTSModule = (relFromSrc: string, symbols: string[]) => {
  // "./src/glsl/…/x.glsl" 在我们的收集里是 "glsl/…/x.glsl"
  const pattern = '@use-gpu/' + toPosix(relFromSrc); // "@use-gpu/glsl/.../x.glsl"
  return `declare module ${JSON.stringify(pattern)} {
  type ParsedBundle = import('./shader/types').ParsedBundle;
  const __module: ParsedBundle;
  ${symbols.map(s => `export const ${s}: ParsedBundle;`).join('\n  ')}
  export default __module;
}
`;
};

const typedefHeader = `// File generated by build.ts (local). Do not edit directly.
declare module '@use-gpu/glsl' {
  export const GLSLModules: Record<string, string>;
  export default GLSLModules;
}
`;

let typedefBody = '';
for (let i = 0; i < filesAbs.length; i++) {
  const relFromSrc = toPosix(path.relative(SRC_DIR, filesAbs[i])); // "glsl/.../x.glsl"
  const visibles: string[] = modules[i]?.table?.visibles ?? [];
  typedefBody += makeTSModule(relFromSrc, visibles);
  log(`  [typedef] ${relFromSrc} (exports: ${visibles.length})`);
}

const typedefFull = typedefHeader + typedefBody;
fs.writeFileSync(TYPEDEF_TS, typedefFull);
console.log('[build] 写入：', relTo(TYPEDEF_TS, ROOT), `（${Buffer.byteLength(typedefFull, 'utf8')} bytes）`);

// 同步一份 d.ts 到 build/packages/glsl
copyToTarget(TYPEDEF_TS);

// ------------------------- 汇总 -------------------------
const ms = Date.now() - t0;
banner('完成');
console.log(`[build] 文件总数     : ${filesAbs.length}`);
console.log(`[build] 可见符号总数 : ${totalVisibles}`);
console.log(`[build] 写入 index.ts: ${relTo(INDEX_TS, ROOT)}`);
console.log(`[build] 写入 glsl.d.ts: ${relTo(TYPEDEF_TS, ROOT)}（并已复制到 ${relTo(TARGET, ROOT)}）`);
console.log(`[build] 总用时        : ${ms} ms\n`);
