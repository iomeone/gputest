// scripts/wgsl-codegen.ts
//
// 用法：
//   npx ts-node scripts/wgsl-codegen.ts        # 生成 ESM 模块
//   npx ts-node scripts/wgsl-codegen.ts --cjs  # 生成 CommonJS 模块
//
// 说明：
// 1) 复用你项目里的 transpileWGSL（src/wgsl-loader/transpile.ts）
// 2) 生成文件到 src/gen-wgsl/**.ts
// 3) 预留 rewriteImports（默认注释掉），如需把生成代码里的 @use-gpu/shader(/wgsl)
//    替换为相对路径或把 *.wgsl 依赖改成 gen-wgsl，可手动开启

import * as fs from 'fs';
import * as path from 'path';
import glob from 'glob';

// 复用你实现的转译器
import { transpileWGSL } from '../wgsl-loader/transpile';

const CJS = process.argv.includes('--cjs');
const VERBOSE = true;

// 路径
const ROOT         = process.cwd();
const SRC          = path.join(ROOT, 'src');
const SRC_WGSL     = path.join(SRC, 'wgsl');
const OUT_DIR      = path.join(SRC, 'gen-wgsl');
// 如需 rewriteImports，可用到下列两个目标：
//   - parseBundle: src/shader/index.ts
//   - decompressAST(wgsl): src/shader/wgsl.ts
const SHADER_INDEX = path.join(SRC, 'shader', 'index.ts');
const SHADER_WGSL  = path.join(SRC, 'shader', 'wgsl.ts');

// -------- 工具 --------
const toPosix   = (p: string) => p.replace(/\\/g, '/');
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
  console.log(`\n${line}\n[wgsl-codegen] ${t}\n${line}`);
};

/** （可选）把生成代码里的导入改成相对路径；默认关闭，与 glsl-codegen 保持一致 */
function rewriteImports(generated: string, outFile: string): string {
  // 1) @use-gpu/shader/wgsl → 相对 src/shader/wgsl.ts
  let relShaderWgsl = toPosix(path.relative(path.dirname(outFile), SHADER_WGSL));
  if (!relShaderWgsl.startsWith('.')) relShaderWgsl = './' + relShaderWgsl;

  generated = generated.replace(
    /from\s+['"]@use-gpu\/shader\/wgsl['"]/g,
    `from "${relShaderWgsl}"`
  );
  generated = generated.replace(
    /require\(\s*['"]@use-gpu\/shader\/wgsl['"]\s*\)/g,
    `require("${relShaderWgsl}")`
  );

  // 2) @use-gpu/shader（parseBundle） → 相对 src/shader/index.ts
  let relShaderIdx = toPosix(path.relative(path.dirname(outFile), SHADER_INDEX));
  if (!relShaderIdx.startsWith('.')) relShaderIdx = './' + relShaderIdx;

  generated = generated.replace(
    /from\s+['"]@use-gpu\/shader['"]/g,
    `from "${relShaderIdx}"`
  );
  generated = generated.replace(
    /require\(\s*['"]@use-gpu\/shader['"]\s*\)/g,
    `require("${relShaderIdx}")`
  );

  // 3) 依赖："something.wgsl" → 指向 src/gen-wgsl/**（不带扩展名）
  generated = generated.replace(
    /from\s+['"]([^'"]+)\.wgsl['"]/g,
    (_m, name) => `from "${mapModuleNameToRelative(name, outFile)}"`
  );
  generated = generated.replace(
    /require\(\s*['"]([^'"]+)\.wgsl['"]\s*\)/g,
    (_m, name) => `require("${mapModuleNameToRelative(name, outFile)}")`
  );

  return generated;
}

/** 把表中的依赖名（可能是 wgsl/... 或 @use-gpu/wgsl/...）映射到生成物的相对导入 */
function mapModuleNameToRelative(name: string, outFile: string): string {
  const dep = name.replace(/^@?use-gpu\/wgsl\//, '').replace(/^wgsl\//, '');
  const depOut = path.join(OUT_DIR, dep + '.ts');
  const spec   = relNoExt(outFile, depOut);
  if (VERBOSE) console.log(`    [rewrite] ${name} -> ${spec}`);
  return spec;
}

(function main() {
  banner('环境与路径');
  console.log('[wgsl-codegen] node         :', process.version);
  console.log('[wgsl-codegen] cwd          :', ROOT);
  console.log('[wgsl-codegen] SRC_WGSL     :', relToRoot(SRC_WGSL));
  console.log('[wgsl-codegen] OUT_DIR      :', relToRoot(OUT_DIR));
  console.log('[wgsl-codegen] SHADER_INDEX :', relToRoot(SHADER_INDEX));
  console.log('[wgsl-codegen] SHADER_WGSL  :', relToRoot(SHADER_WGSL));
  console.log('[wgsl-codegen] Output       :', CJS ? 'CommonJS' : 'ESM');

  banner('扫描 .wgsl');
  const relFiles = glob.sync('**/*.wgsl', { cwd: SRC_WGSL, nodir: true }).sort();
  if (!relFiles.length) {
    console.log('[wgsl-codegen] 未找到任何 wgsl，退出。');
    process.exit(0);
  }
  relFiles.forEach(f => VERBOSE && console.log('  [found]', toPosix(path.join('src/wgsl', f))));
  console.log(`[wgsl-codegen] 共 ${relFiles.length} 个 wgsl 文件`);

  let emitted = 0;
  const t0 = Date.now();

  banner('生成模块到 src/gen-wgsl');
  for (const rel of relFiles) {
    const abs = path.join(SRC_WGSL, rel);
    const srcCode = fs.readFileSync(abs, 'utf8');

    // 传给 transpileWGSL 的 resourcePath 用 POSIX 分隔，保证 name = basename
    const resourcePath = toPosix(path.join('wgsl', rel)); // e.g. wgsl/use/view.wgsl

    // 1) 调用 transpileWGSL 得到代码片段（你的 transpile 已经生成相对 preamble / gen-wgsl 依赖）
    let generated = transpileWGSL(srcCode, resourcePath, !CJS);

    // 2) 如需兜底替换 @use-gpu/* 或 *.wgsl 依赖，可打开下一行：
    // generated = rewriteImports(generated, outFile);

    // 3) CJS 场景：可能包含 exports.*，在 TS 文件里声明 exports 以免 TS 提示
    if (CJS && /exports\./.test(generated)) {
      generated = `declare var exports: any;\n` + generated;
    }

    // 4) 写文件
    const outFile = path.join(OUT_DIR, rel.replace(/\.wgsl$/, '.ts'));
    ensureDir(path.dirname(outFile));
    fs.writeFileSync(outFile, generated, 'utf8');

    emitted++;
    console.log(`  [emit] ${relToRoot(outFile)}  (bytes:${Buffer.byteLength(generated, 'utf8')})`);
  }

  const ms = Date.now() - t0;
  banner('完成');
  console.log('[wgsl-codegen] 输出文件数 :', emitted);
  console.log('[wgsl-codegen] 总用时     :', ms, 'ms');
})();
