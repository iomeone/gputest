// 文件：src/fix-imports.mjs
// 用法：node fix-imports.mjs [--dry] [--verbose]
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 脚本放在 src/ 下：以脚本所在目录作为 src 根
const SRC_DIR = __dirname;

const IGNORED_DIRS = new Set([
  'node_modules', 'dist', 'build', 'out', '.git', '.next', 'coverage'
]);

const HANDLED_EXTS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mts', '.mjs', '.cts', '.cjs',
  '.d.ts', '.d.mts', '.d.cts'
]);

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has('--dry');
const VERBOSE = args.has('--verbose');

const POSIX = (p) => p.replace(/\\/g, '/');

// 仅匹配 import/export 语句里的模块字符串：
//   import ... from '...'
//   export ... from '...'
//   import '...'
const RE_IMPORT_EXPORT =
  /\b(?:import|export)\s+(?:[^'"]*?\s+from\s+)?(['"])(@use-gpu(?:\/[^'"]*)?)\1/g;

// 匹配 import('...') / require('...') 动态导入或 CJS：
const RE_REQUIRE_IMPORT_CALL =
  /\b(?:import|require)\s*\(\s*(['"])(@use-gpu(?:\/[^'"]*)?)\1\s*\)/g;

function rewriteSpecifier(filePath, spec) {
  if (!spec.startsWith('@use-gpu')) return spec;

  const fromDir = path.dirname(filePath);

  // 计算从当前文件目录到 SRC_DIR 的相对路径（posix）
  let rel = path.relative(fromDir, SRC_DIR);
  rel = POSIX(rel);
  if (rel === '') rel = '.';
  if (!rel.startsWith('.')) rel = './' + rel;

  const tail = spec.slice('@use-gpu'.length); // 例如 "/core/types"
  const joined = path.posix.join(rel, tail.startsWith('/') ? tail.slice(1) : tail);
  return joined || '.';
}

async function processFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  let content = raw;
  let replacements = 0;

  const replaceImportExport = (m, quote, spec) => {
    const next = rewriteSpecifier(filePath, spec);
    if (next !== spec) {
      replacements++;
      if (VERBOSE) console.log(`  ${spec}  →  ${next}`);
      return `${m.replace(`${quote}${spec}${quote}`, `${quote}${next}${quote}`)}`;
    }
    return m;
  };

  const replaceRequireImport = (m, quote, spec) => {
    const next = rewriteSpecifier(filePath, spec);
    if (next !== spec) {
      replacements++;
      if (VERBOSE) console.log(`  call(${quote}${spec}${quote})  →  call(${quote}${next}${quote})`);
      return m.replace(`${quote}${spec}${quote}`, `${quote}${next}${quote}`);
    }
    return m;
  };

  content = content.replace(RE_IMPORT_EXPORT, replaceImportExport);
  content = content.replace(RE_REQUIRE_IMPORT_CALL, replaceRequireImport);

  const changed = replacements > 0 && content !== raw;
  return { changed, replacements, content };
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
  if (DRY_RUN) console.log('（干跑 --dry：不写回文件）');
  if (VERBOSE) console.log('（详细日志 --verbose）');

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