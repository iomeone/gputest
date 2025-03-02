#!/usr/bin/env node
import path from 'path';
import fs from 'fs';
import glob from 'glob';
import commandLineArgs from 'command-line-args';

import { transpileWGSL } from '@use-gpu/shader/wgsl';
import { transpileGLSL } from '@use-gpu/shader/glsl';

const optionDefinitions = [
  { name: 'esm', alias: 'e', type: Boolean, description: 'Emit ES Module (default)' },
  { name: 'cjs', alias: 'c', type: Boolean, description: 'Emit CommonJS Module' },
  { name: 'noEmit', alias: 'n', type: Boolean, description: "Don't emit JS/TS code" },

  { name: 'minify', alias: 'm', type: Boolean, description: 'Minify shader code' },
  { name: 'types', alias: 't', type: Boolean, description: 'Emit TypeScript' },
  { name: 'typeDef', alias: 'd', type: Boolean, description: 'Emit .d.ts' },
  { name: 'sourceMap', alias: 's', type: Boolean, description: 'Emit source map' },
  { name: 'exports', alias: 'x', type: Boolean, description: 'Emit exports.json' },

  { name: 'language', alias: 'l', type: String, defaultValue: 'wgsl', description: 'Language (WGSL or GLSL)' },
  { name: 'basePath', alias: 'b', type: String, defaultValue: '', description: 'Base path (stripped off)' },
  { name: 'importRoot', alias: 'r', type: String, defaultValue: '.', description: 'Import root (replaced with relative path)' },

  { name: 'input', type: String, multiple: true, defaultOption: true, description: 'Input path/glob' },
  { name: 'output', alias: 'o', type: String, defaultValue: '.', description: 'Output path' },

  { name: 'help', alias: 'h', type: Boolean, description: 'Show this screen' },
  { name: 'verbose', alias: 'v', type: Boolean, description: 'Log verbose output' },
];

const typeName = (t: any) => t.toString().split(/[ (]+/g)[1];

const showUsage = () => {
  const out: string[] = [];

  out.push('shader2ts');
  out.push('Transpile shader modules to pre-parsed JS/TS');

  const rows: (string | null)[][] = [];
  for (const opt of optionDefinitions) if (opt.name !== 'input') {
    const name = '--' + opt.name;
    const alias = opt.alias ? '-' + opt.alias : null;
    const value = opt.defaultValue != null ? JSON.stringify(opt.defaultValue) : typeName(opt.type);

    const row = [name, alias, value, opt.description];
    rows.push(row);
  };

  const padTo = (s: string | null, n: number) => (
    s == null ? ' '.repeat(n) :
    s == '-' ? '-'.repeat(n) :
    s.length < n ? s + ' '.repeat(n - s.length) :
    s
  );

  const header = ['Option', 'Alias', 'Default', 'Description'];

  const widths = rows.reduce((a, b) => a.map((_, i) => Math.max(a[i], b[i]?.length || 0)), header.map(_ => _.length));

  const printRow = (row: (string | null)[]) => console.log(row.map((r, i) => padTo(r, widths[i] + 2)).join(''));

  console.log('shader2ts');
  printRow(header);
  printRow(['-', '-', '-', '-']);
  for (const r of rows) printRow(r);
};

const options = commandLineArgs(optionDefinitions);
const lang = options.language.toLowerCase();

const TRANSPILERS: Record<string, typeof transpileWGSL> = {
  glsl: transpileGLSL,
  wgsl: transpileWGSL,
};

const TRANSPILE = TRANSPILERS[lang];
const OUTPUT = options.output;
const INPUT = options.input ?? [];
const BASE = options.basePath;

const globs = [];

for (let i = 0; i < INPUT.length; ++i) {
  const arg = INPUT[i];
  const d = fs.statSync(arg).isDirectory();
  if (d) globs.push(arg + '/**/*.wgsl');
  else globs.push(arg);
}

if (options.help) {
  showUsage();
  process.exit();
}

if (!TRANSPILE) {
  console.log(`Only WGSL and GLSL supported.\n`);
  showUsage();
  process.exit();
}

if (!globs.length) {
  console.log(`No input path(s) specified.\n`);
  showUsage();
  process.exit();
}

const writeToTarget = (target: string, data: string) => {
  const dir = path.dirname(target);
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(target, data);
};

const exps: Record<string, any> = {};
const base = BASE.length ? BASE.split('/').length : 0;

options.verbose && console.log('Glob', globs);

for (const pattern of globs) {
  const files = glob.sync(pattern);
  for (const src of files) {
    const keys = src.split('/');

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = keys.pop()!.replace(/\.(wgsl|glsl)$/, '');
    const tokens = [...keys.slice(base), id];
    const name = tokens.join('/');

    const code = fs.readFileSync(src).toString();
    // eslint-disable-next-line prefer-const
    let {output, typeDef, magicString} = TRANSPILE(code, name, {
      esModule: !options.cjs,
      minify: options.minify,
      types: options.types,
      typeDef: options.typeDef,
      sourceMap: options.sourceMap,
      importRoot: options.importRoot,
    });

    const shaderFile = `${name}.${lang}`;
    const jsFile = `${shaderFile}.${options.types ? 'ts' : 'js'}`;
    const dtsFile = `${shaderFile}.d.ts`;
    const mapFile = `${jsFile}.map`;

    if (options.sourceMap && magicString != null) {
      output += `//# sourceMappingURL=${path.basename(mapFile)}\n`;
    }

    const dst = path.join(OUTPUT, jsFile);
    if (!options.noEmit) {
      options.verbose && console.log('Output', dst);
      writeToTarget(dst, output);
    }

    if (options.typeDef && typeDef != null) {
      const dst = path.join(OUTPUT, dtsFile);
      options.verbose && console.log('TypeDef', dst);
      writeToTarget(dst, typeDef);
    }

    if (options.sourceMap && magicString != null) {
      const sourceMap = magicString.generateMap({
        source: shaderFile,
        file: mapFile,
        includeContent: true
      }).toString();
      const dst = path.join(OUTPUT, mapFile);
      options.verbose && console.log('SourceMap', dst);
      writeToTarget(dst, sourceMap);
    }

    exps[shaderFile] = dst;
  }
}

if (options.exports) writeToTarget(path.join(OUTPUT, 'exports.json'), JSON.stringify(exps, null, 2));
