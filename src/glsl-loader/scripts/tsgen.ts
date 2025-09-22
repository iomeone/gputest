import * as path from 'path';
import { readFileSync, statSync } from 'fs';
import glob from 'glob';
import { loadModule } from '@use-gpu/shader/glsl';

type Glob = { arg: string, pattern: string };

const args = process.argv.slice(2);
const globs = [] as Glob[];

let base = null as string | null;

const parseArg = (arg: string, val: string) => {
  if (arg === 'b' || arg == '-base-dir') base = path.resolve(val);
};

for (let i = 0; i < args.length; ++i) {
  const arg = args[i];
  if (arg[0] === '-') parseArg(arg.slice(1), args[++i]);
  else {
    const d = statSync(arg).isDirectory();
    if (d) globs.push({arg, pattern: arg + '/**/*.glsl'});
    else globs.push({arg, pattern: arg});
  }
}

if (!globs.length) {
  console.log(`Usage: ./node_modules/.bin/glsl-tsgen [--base-dir dir] [file or *.glsl]\n`);
  process.exit();
}

const out = [] as string[];
for (const {pattern, arg} of globs) {
  const files = glob.sync(pattern);
  for (const file of files) {
    const core = readFileSync(file).toString();
    const module = loadModule(core, file);
    const symbols = (module.table.visibles ?? []).map((s: string) => `export const ${s}: ParsedBundle;`);
    
    let abs = path.resolve(file);
    let prefix = base ?? path.resolve(arg);
    const name = abs.replace(prefix, '').replace(/^\//, '');

    out.push(`declare module '${name}' {
  type ParsedBundle = import('@use-gpu/shader/types').ParsedBundle;
  const __module: ParsedBundle;
  ${symbols.join("\n  ")}
  export default __module;
}`);
  }
}

console.log(out.join("\n\n"));