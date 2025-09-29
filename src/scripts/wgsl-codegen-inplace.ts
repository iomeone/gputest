// scripts/wgsl-codegen-inplace.ts
//
// 用法：npx ts-node scripts/wgsl-codegen-inplace.ts
//
// 作用：
// 1) 扫描 src 下所有 *.wgsl，调用你的 transpileWGSL，**就地**生成 *.wgsl 对应的
//    <basename>wgsl.ts（例如 scroll.wgsl -> scrollwgsl.ts）。
// 2) 重写整个项目中的导入：'xxx/scroll.wgsl' -> 'xxx/scrollwgsl'（不带 .ts 扩展名）。
// 3) 若转译产物里仍含有 'gen-wgsl/...' 依赖，映射为 src/wgsl/.../<basename>wgsl（不带扩展名）。

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

// —— 约定：foo/bar/scroll.wgsl -> foo/bar/scrollwgsl.ts
const outPathForWgsl = (absWgsl: string) => {
  const dir  = path.dirname(absWgsl);
  const base = path.basename(absWgsl, '.wgsl');     // 'scroll'
  const out  = path.join(dir, `${base}wgsl.ts`);    // 'scrollwgsl.ts'
  return out;
};

// 生成代码里若还有 'gen-wgsl/under'，改成相对到 src/wgsl/under + 'wgsl'（无扩展名）
function rewriteGeneratedImportsToInplace(generated: string, outFile: string): string {
  const RE = /(['"])([^'"]*?)gen-wgsl\/([^'"]+)\1/g;
  const dir = path.dirname(outFile);

  return generated.replace(RE, (_m, q: string, _left: string, under: string) => {
    // 目标：src/wgsl/<under><basename>wgsl.ts
    // <under> 是类似 'layout/scroll'；需要变为 'layout/scrollwgsl.ts'
    const underDir  = path.dirname(under);                     // 'layout'
    const underBase = path.basename(under);                    // 'scroll'
    const targetAbs = path.join(SRC, 'wgsl', underDir, `${underBase}wgsl.ts`);
    let rel = toPosix(path.relative(dir, targetAbs));
    if (!rel.startsWith('.')) rel = './' + rel;
    // 导入希望不带扩展名
    rel = rel.replace(/\.ts$/i, '');
    return `${q}${rel}${q}`;
  });
}

// 把项目源码中的 *.wgsl 导入改写成 <basename>wgsl（不带扩展名）
function rewriteProjectImportsToWgslNoExt(projectRoot: string) {
  const files = glob.sync('**/*.{ts,tsx,js,jsx,mts,mjs,cts,cjs,d.ts}', {
    cwd: projectRoot,
    nodir: true,
    ignore: IGNORE_GLOBS,
  });

  const shouldTouch = (spec: string) =>
    (/^(?:\.{1,2}\/)/.test(spec) || /^@?use-gpu\/wgsl\//.test(spec) || /^wgsl\//.test(spec))
    && /\.wgsl$/i.test(spec);

  const RE_IMPORT_FROM  = /^[ \t]*import\b[\s\S]*?\bfrom\s*(['"])([^'"]+)\1/gm;
  const RE_IMPORT_ONLY  = /^[ \t]*import\s*(['"])([^'"]+)\1/gm;
  const RE_REQ_IMP      = /\b(?:require|import)\s*\(\s*(['"])([^'"]+)\1\s*\)/g;

  const mapSpec = (spec: string) => {
    // '.../scroll.wgsl' -> '.../scrollwgsl'
    return spec.replace(/\.wgsl$/i, 'wgsl');
  };

  const mutate = (raw: string) => {
    let count = 0;
    const rep = (m: string, q: string, spec: string) => {
      if (!shouldTouch(spec)) return m;
      count++;
      return m.replace(`${q}${spec}${q}`, `${q}${mapSpec(spec)}${q}`);
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

  banner('就地生成 <name>wgsl.ts');
  for (const rel of relFiles) {
    const abs = path.join(SRC, rel);
    const srcCode = fs.readFileSync(abs, 'utf8');

    // 给 transpileWGSL 的 resourcePath：相对 src 的 POSIX 路径
    const resourcePath = toPosix(path.relative(SRC, abs));   // 例如 app/pages/rtt/cfd-compute/advect.wgsl

    let generated = transpileWGSL(srcCode, resourcePath, /*esModule*/ true);

    const outFile = outPathForWgsl(abs);                     // 同目录/scrollwgsl.ts
    generated = rewriteGeneratedImportsToInplace(generated, outFile);

    ensureDir(path.dirname(outFile));
    fs.writeFileSync(outFile, generated, 'utf8');

    emitted++;
    console.log(`  [emit] ${relToRoot(outFile)}  (bytes:${Buffer.byteLength(generated, 'utf8')})`);
  }

  banner('重写源码中的 .wgsl 导入 => <name>wgsl');
  rewriteProjectImportsToWgslNoExt(SRC);

  const ms = Date.now() - t0;
  banner('完成');
  console.log('[wgsl-codegen-inplace] 输出文件数 :', emitted);
  console.log('[wgsl-codegen-inplace] 总用时     :', ms, 'ms');
})();
