// scripts/wgsl-codegen-inplace.ts
//
// 用法：
//   npx ts-node scripts/wgsl-codegen-inplace.ts
//
// 功能：
// 1) 扫描 src/**/*.wgsl（排除 node_modules、dist、build、out、gen-wgsl 等）
// 2) 调用你的 transpileWGSL，在“同目录”生成 *.wgsl.ts
// 3) 把生成代码里任何 ".../gen-wgsl/<under>" 的依赖改写为
//    相对到 src/wgsl/<under>.wgsl.ts 的路径（避免旧 transpile 的 gen-wgsl 习惯）
// 4) 把项目源码里所有指向 .wgsl 的导入改为 .wgsl.ts：
//    - 相对路径（./、../）
//    - 以 "wgsl/" 或 "@use-gpu/wgsl/" 起始的别名路径
//
// 说明：无需再使用 gen-wgsl 目录。

import * as fs from 'fs';
import * as path from 'path';
import glob from 'glob';
import { transpileWGSL } from '../wgsl-loader/transpile';

const ROOT = process.cwd();
const SRC  = path.join(ROOT, 'src');

const IGNORE_GLOBS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/out/**',
  '**/gen-wgsl/**',
];

const VERBOSE = true;

const toPosix   = (p: string) => p.replace(/\\/g, '/');
const relToRoot = (p: string) => toPosix(path.relative(ROOT, p) || '.');
const ensureDir = (d: string) => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); };

const banner = (t: string) => {
  const line = '-'.repeat(64);
  console.log(`\n${line}\n[wgsl-codegen-inplace] ${t}\n${line}`);
};

/** 把生成代码里的 ".../gen-wgsl/<under>" → 指向 src/wgsl/<under>.wgsl.ts 的相对路径 */
function rewriteGeneratedImportsToInplace(generated: string, outFile: string): string {
  // 统一匹配 import/require 里的字符串常量，只要中间包含 gen-wgsl/<under>
  const RE = /(['"])([^'"]*?)gen-wgsl\/([^'"]+)\1/g;
  const dir = path.dirname(outFile);

  return generated.replace(RE, (_m, q: string, _left: string, under: string) => {
    const targetAbs = path.join(SRC, 'wgsl', under + '.wgsl.ts');
    let rel = toPosix(path.relative(dir, targetAbs));
    if (!rel.startsWith('.')) rel = './' + rel;
    return `${q}${rel}${q}`;
  });
}

/** 把工程源码中所有“.wgsl”导入改成“.wgsl.ts” */
function rewriteProjectImportsToWgslTs(projectRoot: string) {
  const files = glob.sync('**/*.{ts,tsx,js,jsx,mts,mjs,cts,cjs,d.ts}', {
    cwd: projectRoot,
    nodir: true,
    ignore: IGNORE_GLOBS,
  });

  // 条件：相对路径，或以 wgsl/、@use-gpu/wgsl/ 起始；并且以 .wgsl 结尾
  const shouldTouch = (spec: string) =>
    (/^(?:\.{1,2}\/)/.test(spec) || /^@?use-gpu\/wgsl\//.test(spec) || /^wgsl\//.test(spec))
    && /\.wgsl$/.test(spec);

  // import ... from '...'
  const RE_IMPORT_FROM  = /^[ \t]*import\b[\s\S]*?\bfrom\s*(['"])([^'"]+)\1/gm;
  // import '...'
  const RE_IMPORT_ONLY  = /^[ \t]*import\s*(['"])([^'"]+)\1/gm;
  // require('...') / import('...')
  const RE_REQ_IMP      = /\b(?:require|import)\s*\(\s*(['"])([^'"]+)\1\s*\)/g;

  const mutate = (raw: string) => {
    let count = 0;
    const rep = (m: string, q: string, spec: string) => {
      if (!shouldTouch(spec)) return m;
      count++;
      return m.replace(`${q}${spec}${q}`, `${q}${spec}.ts${q}`);
    };
    let out = raw.replace(RE_IMPORT_FROM, rep);
    out = out.replace(RE_IMPORT_ONLY, rep);
    out = out.replace(RE_REQ_IMP, rep);
    return { out, count };
  };

  let total = 0;
  for (const rel of files) {
    const abs = path.join(projectRoot, rel);
    const raw = fs.readFileSync(abs, 'utf8');
    const { out, count } = mutate(raw);
    if (count > 0 && out !== raw) {
      fs.writeFileSync(abs, out, 'utf8');
      total += count;
      if (VERBOSE) console.log(`[rewrite-imports] ${toPosix(rel)}  (+${count})`);
    }
  }
  if (VERBOSE) console.log(`[rewrite-imports] total replacements: ${total}`);
}

(function main() {
  banner('环境与路径');
  console.log('[wgsl-codegen-inplace] node :', process.version);
  console.log('[wgsl-codegen-inplace] cwd  :', ROOT);
  console.log('[wgsl-codegen-inplace] SRC  :', relToRoot(SRC));

  banner('扫描 .wgsl');
  const relFiles = glob.sync('**/*.wgsl', { cwd: SRC, nodir: true, ignore: IGNORE_GLOBS }).sort();
  if (!relFiles.length) {
    console.log('[wgsl-codegen-inplace] 未找到任何 wgsl，退出。');
    process.exit(0);
  }
  relFiles.forEach(f => VERBOSE && console.log('  [found]', toPosix(path.join('src', f))));
  console.log(`[wgsl-codegen-inplace] 共 ${relFiles.length} 个 wgsl 文件`);

  let emitted = 0;
  const t0 = Date.now();

  banner('就地生成 *.wgsl.ts');
  for (const rel of relFiles) {
    const abs = path.join(SRC, rel);
    const srcCode = fs.readFileSync(abs, 'utf8');

    // 给 transpileWGSL 的 resourcePath：以 src 为根的 POSIX 相对路径
    const resourcePath = toPosix(path.relative(SRC, abs));   // 例如：app/pages/rtt/cfd-compute/advect.wgsl

    // 1) 调用你的 transpiler
    let generated = transpileWGSL(srcCode, resourcePath, /*esModule*/ true);

    // 2) 若生成内容里还含有 gen-wgsl 依赖，映射到真实的就地 *.wgsl.ts
    const outFile = path.join(SRC, rel + '.ts');             // 输出: 同目录/xxx.wgsl.ts
    generated = rewriteGeneratedImportsToInplace(generated, outFile);

    // 3) 写入
    ensureDir(path.dirname(outFile));
    fs.writeFileSync(outFile, generated, 'utf8');

    emitted++;
    console.log(`  [emit] ${relToRoot(outFile)}  (bytes:${Buffer.byteLength(generated, 'utf8')})`);
  }

  // 4) 把工程源码里的 .wgsl 导入改成 .wgsl.ts
  banner('重写源码中的 .wgsl 导入 => .wgsl.ts');
  rewriteProjectImportsToWgslTs(SRC);

  const ms = Date.now() - t0;
  banner('完成');
  console.log('[wgsl-codegen-inplace] 输出文件数 :', emitted);
  console.log('[wgsl-codegen-inplace] 总用时     :', ms, 'ms');
})();
