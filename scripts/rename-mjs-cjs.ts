import { statSync, readFileSync, writeFileSync, renameSync } from 'fs';
import path from 'path';
import glob from 'glob';

// Rename .js / .d.ts to .mjs / .d.mts / .cjs / .d.cts

const pkg = process.env.NPM_PACKAGE;
if (pkg == null) {
  console.log("Can't build package.json - NPM_PACKAGE not set");
  process.exit(1);
}

const shouldIgnore = (s: string) => s.match(/\/pkg\//);

const map = (from: string, extFrom: string, extTo: string, callback: (s: string) => string) => {
  const filename = path.basename(from).slice(0, -extFrom.length) + extTo;
  const to = path.join(path.dirname(from), filename);

  renameSync(from, to);

  const data = readFileSync(to, 'utf-8');
  writeFileSync(to, callback(data));
};

const processJSType = (prefix: string) => {

  const mapJs = (s: string) => {
    s = s.replaceAll(/(require|import)\("(\.([^"]|\\.)+?)(?:\.js)?"\)/g, (...s: string[]) => shouldIgnore(s[2]) ? s[0] : `${s[1]}("${s[2]}.${prefix}js")`);
    s = s.replaceAll(/(require|import)\('(\.([^']|\\.)+?)(?:\.js)?'\)/g, (...s: string[]) => shouldIgnore(s[2]) ? s[0] : `${s[1]}('${s[2]}.${prefix}js')`);
    s = s.replaceAll(/((?:export|import)\s+(?:type\s+)?(?:\*(?:\s+as\s+[A-Za-z0-9_]+)?|[A-Za-z0-9_]+|{[^}]+})\s+from\s+)"(\.(?:[^"]|\\.)+?)(?:\.js)?"/g, (...s: string[]) => shouldIgnore(s[2]) ? s[0] : `${s[1]}"${s[2]}.${prefix}js"`);
    s = s.replaceAll(/((?:export|import)\s+(?:type\s+)?(?:\*(?:\s+as\s+[A-Za-z0-9_]+)?|[A-Za-z0-9_]+|{[^}]+})\s+from\s+)'(\.(?:[^']|\\.)+?)(?:\.js)?'/g, (...s: string[]) => shouldIgnore(s[2]) ? s[0] : `${s[1]}'${s[2]}.${prefix}js'`);
    return s;
  };

  const mapDts = (s: string) => {
    s = s.replaceAll(/(require|import)\("(\.([^"]|\\.)+?)(?:\.d\.ts)?"\)/g, (...s: string[]) => shouldIgnore(s[2]) ? s[0] : `${s[1]}("${s[2]}.d.${prefix}ts")`);
    s = s.replaceAll(/(require|import)\('(\.([^']|\\.)+?)(?:\.d\.ts)?'\)/g, (...s: string[]) => shouldIgnore(s[2]) ? s[0] : `${s[1]}('${s[2]}.d.${prefix}ts')`);
    s = s.replaceAll(/((?:export|import)\s+(?:type\s+)?(?:\*(?:\s+as\s+[A-Za-z0-9_]+)?|[A-Za-z0-9_]+|{[^}]+})\s+from\s+)"(\.(?:[^"]|\\.)+?)(?:\.d.ts)?"/g, (...s: string[]) => shouldIgnore(s[2]) ? s[0] : `${s[1]}"${s[2]}.d.${prefix}ts"`);
    s = s.replaceAll(/((?:export|import)\s+(?:type\s+)?(?:\*(?:\s+as\s+[A-Za-z0-9_]+)?|[A-Za-z0-9_]+|{[^}]+})\s+from\s+)'(\.(?:[^']|\\.)+?)(?:\.d.ts)?'/g, (...s: string[]) => shouldIgnore(s[2]) ? s[0] : `${s[1]}'${s[2]}.d.${prefix}ts'`);
    return s;
  };

  const jsFiles = glob.sync(`../../build/packages/${pkg}/${prefix}js/**/*.js`);
  const dtsFiles = glob.sync(`../../build/packages/${pkg}/${prefix}js/**/*.d.ts`);

  for (const file of jsFiles) map(file, '.js', `.${prefix}js`, mapJs);
  for (const file of dtsFiles) map(file, '.d.ts', `.d.${prefix}ts`, mapDts);
};


for (const prefix of ['c', 'm']) processJSType(prefix);
