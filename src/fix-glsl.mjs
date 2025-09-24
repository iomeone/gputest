// 文件：src/fix-glsl.mjs
// 用法：node fix-glsl.mjs [--dry] [--verbose]
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// 以脚本所在目录作为 src 根
const SRC_DIR = __dirname;

const IGNORED_DIRS = new Set([
  'node_modules', 'dist', 'build', 'out', '.git', '.next', 'coverage'
]);

const HANDLED_EXTS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mts', '.mjs', '.cts', '.cjs', '.d.ts'
]);

const args     = new Set(process.argv.slice(2));
const DRY_RUN  = args.has('--dry');
const VERBOSE  = args.has('--verbose');

const POSIX = (p) => p.replace(/\\/g, '/');

// 仅匹配【一行起始（忽略前导空白）就是 import】的静态导入：
// 1) import ... from '...'
// 2) import '...'
const RE_IMPORT_FROM  = /^[ \t]*import\b[\s\S]*?\bfrom\s*(['"])([^'"]+)\1/gm;
const RE_IMPORT_ONLY  = /^[ \t]*import\s*(['"])([^'"]+)\1/gm;

// 仅处理相对/本地导入（以 ./ ../ 或 glsl/ 起始），且路径中包含 /glsl/ 段，且以 .glsl 结尾
function shouldTransform(spec) {
  if (!/^(?:\.{1,2}\/|glsl\/)/.test(spec)) return false;     // 排除别名/包名（如 @use-gpu/**）
  if (!/(^|\/)glsl\//.test(spec)) return false;              // 必须有 glsl 目录段
  if (!/\.glsl$/.test(spec)) return false;                   // 必须以 .glsl 结尾
  return true;
}

function transformSpecifier(spec) {
  // 目录 glsl -> gen-glsl；去掉 .glsl 后缀
  let next = spec.replace(/(^|\/)glsl\//, '$1gen-glsl/').replace(/\.glsl$/, '');
  return next;
}

function rewriteLineImport(content) {
  let replacements = 0;

  const replacerFrom = (m, quote, spec) => {
    if (!shouldTransform(spec)) return m;
    const next = transformSpecifier(spec);
    if (next !== spec) {
      replacements++;
      if (VERBOSE) console.log(`  import-from: ${spec}  →  ${next}`);
      return m.replace(`${quote}${spec}${quote}`, `${quote}${next}${quote}`);
    }
    return m;
  };

  const replacerOnly = (m, quote, spec) => {
    if (!shouldTransform(spec)) return m;
    const next = transformSpecifier(spec);
    if (next !== spec) {
      replacements++;
      if (VERBOSE) console.log(`  import-only: ${spec}  →  ${next}`);
      return m.replace(`${quote}${spec}${quote}`, `${quote}${next}${quote}`);
    }
    return m;
  };

  let out = content.replace(RE_IMPORT_FROM, replacerFrom);
  out = out.replace(RE_IMPORT_ONLY, replacerOnly);

  return { out, replacements };
}

async function processFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  const { out, replacements } = rewriteLineImport(raw);
  const changed = replacements > 0 && out !== raw;
  return { changed, replacements, content: out };
}

async function walk(dir) {
  const ents = await fs.readdir(dir, { withFileTypes: true });
  let files = 0, changedFiles = 0, totalReplacements = 0;

  for (const ent of ents) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (IGNORED_DIRS.has(ent.name)) continue;
      const sub = await walk(full);
      files += sub.files;
      changedFiles += sub.changedFiles;
      totalReplacements += sub.totalReplacements;
      continue;
    }

    const ext = path.extname(ent.name);
    if (!HANDLED_EXTS.has(ext)) continue;

    files++;
    if (VERBOSE) {
      const rel = POSIX(path.relative(SRC_DIR, full));
      console.log(`\n处理文件：${rel}`);
    }

    const { changed, replacements, content } = await processFile(full);
    totalReplacements += replacements;

    if (changed) {
      changedFiles++;
      if (!DRY_RUN) await fs.writeFile(full, content, 'utf8');
    }
  }

  return { files, changedFiles, totalReplacements };
}

(async () => {
  console.log(`扫描 src 根目录：${SRC_DIR}`);
  if (DRY_RUN)  console.log('（干跑 --dry：不写回文件）');
  if (VERBOSE)  console.log('（详细日志 --verbose）');

  const t0 = Date.now();
  const { files, changedFiles, totalReplacements } = await walk(SRC_DIR);
  const ms = Date.now() - t0;

  console.log('\n—— 完成 ——');
  console.log(`扫描文件：${files}`);
  console.log(`修改文件：${changedFiles}`);
  console.log(`替换总数：${totalReplacements}`);
  console.log(`用时：${ms} ms`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
