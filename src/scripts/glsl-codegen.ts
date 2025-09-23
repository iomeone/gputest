// scripts/glsl-codegen.ts
//
// 用法：
//   npx ts-node scripts/glsl-codegen.ts        # 生成 ESM 模块
//   npx ts-node scripts/glsl-codegen.ts --cjs  # 生成 CommonJS 模块
//
// 说明：
// 1) 复用作者的 transpileGLSL（最新逻辑：压缩 AST、运行时解压、默认导出语义等）
// 2) 但对生成出来的代码做“导入路径重写”，确保：
//    - 不出现 @use-gpu/* 别名
//    - 所有依赖都变为指向 src/gen-glsl/**.ts 的相对导入（不带扩展名）
//    - decompressAST 的导入改为相对指向 src/shader/glsl.ts
// 3) CJS 分支中，若使用 exports.*，在 .ts 里会声明 exports 避免 TS 报错

import * as fs from 'fs';
import * as path from 'path';
import glob from 'glob';

// 复用作者提供的转译器（你贴的 transpile.ts）
import { transpileGLSL } from '../glsl-loader/transpile';

const CJS = process.argv.includes('--cjs');
const VERBOSE = true;

// 路径
const ROOT        = process.cwd();
const SRC         = path.join(ROOT, 'src');
const SRC_GLSL    = path.join(SRC, 'glsl');
const OUT_DIR     = path.join(SRC, 'gen-glsl');
const SHADER_GLSL = path.join(SRC, 'shader', 'glsl.ts'); // 运行时解压的相对目标（导出 decompressAST）

// -------- 工具 --------
const toPosix = (p: string) => p.replace(/\\/g, '/');
const relToRoot = (p: string) => toPosix(path.relative(ROOT, p) || '.');
const ensureDir = (d: string) => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); };
const writeFile = (f: string, s: string) => { ensureDir(path.dirname(f)); fs.writeFileSync(f, s); };

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

/** 把 transpileGLSL 产出的代码里的导入路径全部改成相对路径 */
function rewriteImports(generated: string, outFile: string): string {
  // 1) @use-gpu/shader/glsl → 相对 src/shader/glsl.ts
  let relShader = toPosix(path.relative(path.dirname(outFile), SHADER_GLSL));
  if (!relShader.startsWith('.')) relShader = './' + relShader;

  // ESM：import {decompressAST} from '@use-gpu/shader/glsl'
  generated = generated.replace(
    /from\s+['"]@use-gpu\/shader\/glsl['"]/g,
    `from "${relShader}"`
  );
  // CJS：const {decompressAST} = require('@use-gpu/shader/glsl')
  generated = generated.replace(
    /require\(\s*['"]@use-gpu\/shader\/glsl['"]\s*\)/g,
    `require("${relShader}")`
  );

  // 2) 依赖导入："something.glsl" → 相对指到 src/gen-glsl/**.ts（不带扩展名）
  // ESM：import mX from "NAME.glsl"
  generated = generated.replace(
    /from\s+['"]([^'"]+)\.glsl['"]/g,
    (_m, name) => `from "${mapModuleNameToRelative(name, outFile)}"`
  );
  // CJS：require("NAME.glsl")
  generated = generated.replace(
    /require\(\s*['"]([^'"]+)\.glsl['"]\s*\)/g,
    (_m, name) => `require("${mapModuleNameToRelative(name, outFile)}")`
  );

  return generated;
}

/** 把 table.modules 里的 name（可能是 glsl/... 或 @use-gpu/glsl/...）映射到生成物的相对导入 */
function mapModuleNameToRelative(name: string, outFile: string): string {
  const dep = name.replace(/^@?use-gpu\/glsl\//, '').replace(/^glsl\//, '');
  const depOut = path.join(OUT_DIR, dep + '.ts');
  const spec = relNoExt(outFile, depOut);
  if (VERBOSE) {
    console.log(`    [rewrite] ${name} -> ${spec}`);
  }
  return spec;
}

(function main() {
  banner('环境与路径');
  console.log('[glsl-codegen] node        :', process.version);
  console.log('[glsl-codegen] cwd         :', ROOT);
  console.log('[glsl-codegen] SRC_GLSL    :', relToRoot(SRC_GLSL));
  console.log('[glsl-codegen] OUT_DIR     :', relToRoot(OUT_DIR));
  console.log('[glsl-codegen] SHADER_GLSL :', relToRoot(SHADER_GLSL));
  console.log('[glsl-codegen] Output      :', CJS ? 'CommonJS' : 'ESM');

  banner('扫描 .glsl');
  const relFiles = glob.sync('**/*.glsl', { cwd: SRC_GLSL, nodir: true }).sort();
  if (!relFiles.length) {
    console.log('[glsl-codegen] 未找到任何 glsl，退出。');
    process.exit(0);
  }
  relFiles.forEach(f => VERBOSE && console.log('  [found]', toPosix(path.join('src/glsl', f))));
  console.log(`[glsl-codegen] 共 ${relFiles.length} 个 glsl 文件`);

  let emitted = 0;
  const t0 = Date.now();

  banner('生成模块到 src/gen-glsl');
  for (const rel of relFiles) {
    const abs = path.join(SRC_GLSL, rel);
    const srcCode = fs.readFileSync(abs, 'utf8');

    // 传给 transpileGLSL 的 resourcePath 用 POSIX 分隔，保证 name = basename
    const resourcePath = toPosix(path.join('glsl', rel)); // e.g. glsl/mask/point.glsl

    // 1) 调用作者转译器得到“原始 JS/TS 代码片段”（包含 @use-gpu 路径与 *.glsl 依赖）
    let generated = transpileGLSL(srcCode, resourcePath, !CJS);

    // 2) 重写所有导入为相对路径（并把 *.glsl → 指向 gen-glsl 的 .ts，无扩展）
    const outFile = path.join(OUT_DIR, rel.replace(/\.glsl$/, '.ts'));
    // generated = rewriteImports(generated, outFile);

    // 3) CJS 场景：transpileGLSL 会生成 exports.* 语句；在 .ts 文件里声明 exports 以免 TS 报错
    if (CJS && /exports\./.test(generated)) {
      generated = `declare var exports: any;\n` + generated;
    }

    // 4) 写文件
    ensureDir(path.dirname(outFile));
    fs.writeFileSync(outFile, generated, 'utf8');

    emitted++;
    console.log(`  [emit] ${relToRoot(outFile)}  (bytes:${Buffer.byteLength(generated, 'utf8')})`);
  }

  const ms = Date.now() - t0;
  banner('完成');
  console.log('[glsl-codegen] 输出文件数 :', emitted);
  console.log('[glsl-codegen] 总用时     :', ms, 'ms');
})();