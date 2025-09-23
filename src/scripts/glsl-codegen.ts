/* scripts/glsl-codegen.ts
   用法：
     npx ts-node scripts/glsl-codegen.ts           # 生成 ESM 模块（默认）
     npx ts-node scripts/glsl-codegen.ts --cjs     # 生成 CommonJS 模块

   作用：
     把 src/glsl/ * * / * .glsl 解析为 TS 模块，输出到 src/gen-glsl/ * * .ts，
     运行时代码严格遵循你贴的 loader 逻辑：
       - 构造 data = { name, code, table, shake, tree: decompressAST(compressAST(tree)) }
       - 为 table.modules 生成依赖 import，组装 libs 映射
       - default 导出 getSymbol()，并为 table.visibles 生成具名导出
*/

// scripts/glsl-codegen.ts
//
// 用法：
//   npx ts-node scripts/glsl-codegen.ts        # 生成 ESM 模块
//   npx ts-node scripts/glsl-codegen.ts --cjs  # 生成 CommonJS 模块
//
// 说明：把 src/glsl/**/*.glsl 解析为 TS 模块，输出到 src/gen-glsl/**.ts。
//       生成物内部所有 import 均为“相对路径”，不包含 @use-gpu 等别名。
//       运行时代码与原 loader 逻辑一致：default + 具名导出、libs 依赖、压缩 AST 后运行时解压。

import * as fs from 'fs';
import * as path from 'path';
import glob from 'glob';

// 使用仓库内的解析/压缩实现
import { loadModule as parseGLSL } from '../shader/glsl';
import { compressAST } from '../shader/glsl';

const CJS = process.argv.includes('--cjs');
const VERBOSE = true;

// 路径
const ROOT       = process.cwd();
const SRC        = path.join(ROOT, 'src');
const SRC_GLSL   = path.join(SRC, 'glsl');
const OUT_DIR    = path.join(SRC, 'gen-glsl');
const SHADER_AST = path.join(SRC, 'shader', 'transform', 'ast'); // 用于运行时解压：decompressAST

// -------- 工具函数 --------
const toPosix = (p: string) => p.replace(/\\/g, '/');
const relToRoot = (p: string) => toPosix(path.relative(ROOT, p) || '.');
const ensureDir = (d: string) => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); };
const writeFile = (f: string, s: string) => { ensureDir(path.dirname(f)); fs.writeFileSync(f, s); };
const stringify = (o: any) => JSON.stringify(o).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const banner = (t: string) => {
  const line = '-'.repeat(64);
  console.log(`\n${line}\n[glsl-codegen] ${t}\n${line}`);
};

// 生成 “相对路径（无扩展名、且以 ./ 或 ../ 开头）” 的导入 specifier
const relNoExt = (fromFile: string, toFile: string) => {
  let rel = toPosix(path.relative(path.dirname(fromFile), toFile));
  rel = rel.replace(/\\/g, '/');
  rel = rel.replace(/\.ts$/, '');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
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

    const mod = parseGLSL(srcCode, 'code'); // 解析
    const { code, table, tree, shake } = mod;
    console.log("-------------------------------------code\n", code);
    // 逻辑名：glsl/…/name
    const logical       = toPosix(path.join('glsl', rel)).replace(/\.glsl$/, '');
    const withoutPrefix = logical.replace(/^glsl\//, ''); // 相对 OUT_DIR 的输出路径
    const outFile       = path.join(OUT_DIR, withoutPrefix + '.ts');

    // 依赖导入：全部转为相对路径，指向 src/gen-glsl/**.ts
    const imports: string[] = [];
    const markerEntries: string[] = [];
    let depCount = 0;

    for (const m of (table.modules as Array<{ name: string }>)) {
      // 统一出 “生成物”的物理文件路径：src/gen-glsl/<dep>.ts
      const depName = m.name.replace(/^@?use-gpu\/glsl\//, '').replace(/^glsl\//, '');
    //   console.log("depName", depName);
      const depOutFile = path.join(OUT_DIR, depName + '.ts');
      const fromSpec = relNoExt(outFile, depOutFile);
      const ident = `m${depCount++}`;

      if (CJS) {
        imports.push(`const ${ident} = require(${JSON.stringify(fromSpec)});`);
      } else {
        imports.push(`import * as ${ident} from ${JSON.stringify(fromSpec)};`);
      }
      markerEntries.push(`${JSON.stringify(m.name)}: ${ident}`);

      if (VERBOSE) {
        console.log(`  [dep] ${toPosix(rel)} -> ${relToRoot(outFile)} imports ${depName}.ts as ${fromSpec}`);
      }
    }

    // 运行时解压：decompressAST 的相对导入（确保以 ./ 开头）
    let relToAst = toPosix(path.relative(path.dirname(outFile), SHADER_AST)) || '.';
    if (!relToAst.startsWith('.')) relToAst = './' + relToAst;
    const preamble = CJS
      ? `const { decompressAST } = require(${JSON.stringify(relToAst)});`
      : `import { decompressAST } from ${JSON.stringify(relToAst)};`;

    // data 块（与 loader 逻辑一致：tree 为运行时解压后的对象）
    const dataBlock = `const data = {
  "name": ${stringify(path.basename(logical))},
  "code": ${stringify(code)},
  "table": ${stringify(table)},
  "shake": ${stringify(shake)},
  "tree": decompressAST(${stringify(compressAST(tree))})
};`;

    const libsBlock   = `const libs = { ${markerEntries.join(', ')} };`;
    const getSymbol   = `const getSymbol = (entry?: string) => ({ module: data, libs, entry });`;
    const defExport   = CJS ? 'module.exports = getSymbol();' : 'export default getSymbol();';
    const namedExport = (table.visibles as string[]).map(s =>
      CJS ? `module.exports.${s} = getSymbol(${JSON.stringify(s)});`
          : `export const ${s} = getSymbol(${JSON.stringify(s)});`
    );

    const body = [
      preamble,
      ...imports,
      dataBlock,
      libsBlock,
      getSymbol,
      defExport,
      ...namedExport,
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