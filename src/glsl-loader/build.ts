import * as fs from 'fs';
import * as path from 'path';
import glob from 'glob';

// 使用仓库内实现（保持相对路径）
import { loadModule as parseGLSL } from '../src/shader/transform/shader';
import { compressAST } from '../src/shader/transform/ast';

const CJS = process.argv.includes('--cjs');
const VERBOSE = true;

// 路径
const ROOT       = process.cwd();
const SRC        = path.join(ROOT, 'src');
const SRC_GLSL   = path.join(SRC, 'glsl');
const OUT_DIR    = path.join(SRC, 'gen-glsl');
const SHADER_AST = path.join(SRC, 'shader', 'transform', 'ast'); // 运行时引入 decompressAST 的目录

// -------- 工具 --------
const toPosix = (p: string) => p.replace(/\\/g, '/');
const relToRoot = (p: string) => toPosix(path.relative(ROOT, p) || '.');
const ensureDir = (d: string) => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); };
const writeFile = (f: string, s: string) => { ensureDir(path.dirname(f)); fs.writeFileSync(f, s); };
const stringify = (s: any) => JSON.stringify(s); // 跟作者保持一致

// 生成 “相对（无扩展名、且以 ./ 或 ../ 开头）” 的导入 specifier
const relNoExt = (fromFile: string, toFile: string) => {
  let rel = toPosix(path.relative(path.dirname(fromFile), toFile));
  rel = rel.replace(/\.ts$/, '');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
};

const banner = (t: string) => {
  const line = '-'.repeat(64);
  console.log(`\n${line}\n[glsl-codegen] ${t}\n${line}`);
};

(function main() {
  banner('环境与路径');
  console.log('[glsl-codegen] node     :', process.version);
  console.log('[glsl-codegen] cwd      :', ROOT);
  console.log('[glsl-codegen] SRC_GLSL :', relToRoot(SRC_GLSL));
  console.log('[glsl-codegen] OUT_DIR  :', relToRoot(OUT_DIR));
  console.log('[glsl-codegen] SHADER_AST (runtime import):', relToRoot(SHADER_AST));
  console.log('[glsl-codegen] Output   :', CJS ? 'CommonJS' : 'ESM');

  banner('扫描 .glsl');
  const relFiles = glob.sync('**/*.glsl', { cwd: SRC_GLSL, nodir: true }).sort();
  if (!relFiles.length) {
    console.log('[glsl-codegen] 未找到任何 glsl，退出。');
    process.exit(0);
  }
  relFiles.forEach(f => VERBOSE && console.log('  [found]', toPosix(path.join('src/glsl', f))));
  console.log(`[glsl-codegen] 共 ${relFiles.length} 个 glsl 文件`);

  let totalVisibles = 0;
  let totalDeps = 0;
  let emitted = 0;
  const t0 = Date.now();

  banner('生成模块到 src/gen-glsl');
  for (const rel of relFiles) {
    const abs = path.join(SRC_GLSL, rel);
    const srcCode = fs.readFileSync(abs, 'utf8');

    // 解析
    const mod = parseGLSL(srcCode, 'code');
    const { code, table, tree, shake } = mod;

    // 名称：使用源文件名（与作者一致）
    const fileBase = path.basename(rel).replace(/\.glsl$/, ''); // e.g. "point"
    const logical       = toPosix(path.join('glsl', rel)).replace(/\.glsl$/, '');
    const withoutPrefix = logical.replace(/^glsl\//, ''); // 输出相对 OUT_DIR 的路径
    const outFile       = path.join(OUT_DIR, withoutPrefix + '.ts');

    // 依赖：全部改成相对导入，指向生成物 src/gen-glsl/**.ts
    const imports: string[] = [];
    const markerEntries: string[] = [];
    let depCount = 0;

    for (const m of (table.modules as Array<{ name: string }>)) {
      const depName = m.name.replace(/^@?use-gpu\/glsl\//, '').replace(/^glsl\//, '');
      const depOutFile = path.join(OUT_DIR, depName + '.ts');
      const spec = relNoExt(outFile, depOutFile);
      const ident = `m${depCount++}`;

      if (CJS) {
        imports.push(`const ${ident} = require(${stringify(spec)});`);
      } else {
        imports.push(`import * as ${ident} from ${stringify(spec)};`);
      }
      markerEntries.push(`${stringify(m.name)}: ${ident}`);

      if (VERBOSE) {
        console.log(`  [dep] ${toPosix(rel)} -> ${relToRoot(outFile)} imports ${depName}.ts as ${spec}`);
      }
    }

    // 运行时引入 decompressAST（相对路径；确保以 ./ 或 ../ 开头）
    let relToAst = toPosix(path.relative(path.dirname(outFile), SHADER_AST)) || '.';
    if (!relToAst.startsWith('.')) relToAst = './' + relToAst;
    const preamble = CJS
      ? `const { decompressAST } = require(${stringify(relToAst)});`
      : `import { decompressAST } from ${stringify(relToAst)};`;

    // data 块（严格对齐作者：tree = decompressAST(compressAST(tree))）
    const def = `const data = {
  "name": ${stringify(fileBase)},
  "code": ${stringify(code)},
  "table": ${stringify(table)},
  "shake": ${stringify(shake)},
  "tree": decompressAST(${stringify(compressAST(tree))}),
};`;

    const libs = `const libs = {${markerEntries.join(', ')}};`;
    const getSymbol = `const getSymbol = (entry?: string) => ({module: data, libs, entry});`;

    // 导出（严格对齐作者逻辑）
    let exportDefault: string;
    let exportSymbols: string[];

    if (!CJS) {
      exportDefault = 'export default getSymbol();';
      exportSymbols = (table.visibles as string[]).map(
        (s) => `export const ${s} = getSymbol(${stringify(s)});`
      );
    } else {
      // 为了让 TS 编译阶段不抱怨 CJS 符号，这里先声明 exports（生成物是 .ts）
      const declareExports = `declare var exports: any;`;
      const lines: string[] = [];
      lines.push(declareExports);
      exportSymbols = (table.visibles as string[]).map(
        (s) => `exports.${s} = getSymbol(${stringify(s)});`
      );
      exportDefault = [
        `const __default = getSymbol();`,
        `Object.defineProperty(exports, '__esModule', { value: true });`,
        `Object.assign(exports, __default);`,
        `exports.default = __default;`,
      ].join('\n');
      // 把声明插到 preamble 最前（见下面 body 组装）
      // 我们会在最终 body 写入时把 declare 注入
      // 为简单起见，直接把它与 preamble拼在一起：
      // 但保持清晰，这里先合并：
      const preWithDeclare = declareExports + '\n' + preamble;
      // 覆盖 preamble
      preamble = preWithDeclare;
    }

    // 组装输出（与作者保持顺序，并追加标记）
    const body = [
      preamble,
      ...imports,
      def,
      libs,
      getSymbol,
      exportDefault,
      ...exportSymbols,
      '/* __GLSL_LOADER_GENERATED */',
      ''
    ].join('\n');

    writeFile(outFile, body);

    const visibles = (table.visibles as string[]).length;
    totalVisibles += visibles;
    totalDeps += depCount;
    emitted++;

    console.log(`  [emit] ${relToRoot(outFile)}  (visibles:${visibles}, deps:${depCount}, bytes:${Buffer.byteLength(body, 'utf8')})`);
  }

  const ms = Date.now() - t0;
  banner('完成');
  console.log('[glsl-codegen] 输出文件数 :', emitted);
  console.log('[glsl-codegen] 具名导出数 :', totalVisibles);
  console.log('[glsl-codegen] 依赖总数   :', totalDeps);
  console.log('[glsl-codegen] 总用时     :', ms, 'ms');
})();