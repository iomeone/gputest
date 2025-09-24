import { loadModule, compressAST } from '../shader/wgsl';
import path from 'path';
const stringify = (s: any) => JSON.stringify(s);

const toPosix = (p: string) => p.replace(/\\/g, '/');

export const transpileWGSL = (source: string, resourcePath: string, esModule: boolean = true) => {

  const makeImport = (symbol: string, from: string) => esModule
    ? `import ${symbol} from ${stringify(from)};`
    : `const ${symbol} = require(${stringify(from)});`;
  // const preamble = [
  //   makeImport('{parseBundle}', '@use-gpu/shader'),
  //   makeImport('{decompressAST}', '@use-gpu/shader/wgsl'),
  // ].join("\n");








  
      var preamble: string = '';
  
  
  
  
  
  
      {
        const log = (...args: any[]) => console.log('[transpileGLSL:preamble]', ...args);
        const rp  = toPosix(resourcePath); // e.g. "glsl/instance/vertex/quad.glsl"
  
        // 识别“以 src 为根”的 glsl 子目录
        let dirRelToSrc: string | null = null;
        let mode = '';
        let m = rp.match(/\/src\/wgsl\/(.+)\/[^/]+\.wgsl$/);
        if (m) {
          dirRelToSrc = `wgsl/${m[1]}`;       // e.g. "glsl/instance/vertex"
          mode = 'abs->src/wgsl/subdir';
        } else {
          m = rp.match(/^wgsl\/(.+)\/[^/]+\.wgsl$/);
          if (m) {
            dirRelToSrc = `wgsl/${m[1]}`;
            mode = 'rel wgsl/subdir';
          } else if (/\/src\/wgsl\/[^/]+\.wgsl$/.test(rp)) {
            dirRelToSrc = 'wgsl';
            mode = 'abs->src/wgsl/root';
          } else if (/^wgsl\/[^/]+\.wgsl$/.test(rp)) {
            dirRelToSrc = 'wgsl';
            mode = 'rel wgsl/root';
          }
        }
  
        const TARGET_PARSE = 'shader';       // parseBundle 所在（src/shader/index.ts）
        const TARGET_GLSL  = 'shader/wgsl';  // decompressAST 所在（src/shader/glsl.ts）
  
        const relFrom = (from: string, to: string) => {
          let rel = path.posix.relative(from, to);
          if (!rel.startsWith('.')) rel = './' + rel;
          return rel;
        };
  
        let parseFrom: string, decompressFrom: string;
  
        if (dirRelToSrc) {
          parseFrom      = relFrom(dirRelToSrc, TARGET_PARSE);
          decompressFrom = relFrom(dirRelToSrc, TARGET_GLSL);
          log({ mode, resourcePath: rp, dirRelToSrc, parseFrom, decompressFrom });
        } else {
          const dir = rp.includes('/') ? rp.slice(0, rp.lastIndexOf('/')) : '.';
          parseFrom      = relFrom(dir, TARGET_PARSE);
          decompressFrom = relFrom(dir, TARGET_GLSL);
          log({ mode: 'fallback', resourcePath: rp, dir, parseFrom, decompressFrom });
        }
  
        preamble = [
          makeImport('{parseBundle}', parseFrom),
          makeImport('{decompressAST}', decompressFrom),
        ].join('\n');
      }
  





  // Parse module source code
  const name = resourcePath.split('/').pop()!.replace(/\.wgsl$/, '');
  const module = loadModule(source, name);

  // Emit module data
  const {code, table, tree, shake} = module;
  const def = `const data = {
    "name": ${stringify(name)},
    "code": ${stringify(code)},
    "table": ${stringify(table)},
    "shake": ${stringify(shake)},
    "tree": decompressAST(${stringify(compressAST(code, tree!))}),
  };`










  // Emit dependency imports
  // let i = 0;
  // const imports = [] as string[];
  // const markers = [] as string[];
  // if (table.modules) for (const {name} of table.modules) {
  //   imports.push(makeImport(`m${i}`, name + '.wgsl'));
  //   markers.push(`${stringify(name)}: m${i}`);
  //   ++i;
  // }






// —— 改成下面这一段（离线生成到 gen-glsl，强制相对路径、无 .glsl 后缀）——
let i = 0;
const imports: string[] = [];
const markers: string[] = [];


const rp = toPosix(resourcePath);

// 计算“当前 .glsl 的目录（以 src 为根的相对路径）”，例如：
//   resourcePath = "glsl/instance/vertex/quad.glsl"
//   -> curDirRelSrc = "glsl/instance/vertex"
let relFromSrc = rp;
const mAbs = rp.match(/\/src\/(wgsl\/.*)$/);
if (mAbs) relFromSrc = mAbs[1];

const curDirRelSrc = relFromSrc.replace(/\/[^/]+\.wgsl$/, '');   // glsl/instance/vertex
const curOutDir    = curDirRelSrc.replace(/^wgsl\//, 'gen-wgsl/'); // gen-glsl/instance/vertex

// 为了生成你期望的 "../../../gen-glsl/..." 这种写法，
// 我们构造“从当前生成目录退回到 src 根”的前缀，然后再下到 gen-glsl/目标。
// depthSegs = "gen-glsl/instance/vertex" 的段数 = 3 -> "../../../"
const depthSegs  = curOutDir.split('/').filter(Boolean).length;
const rootPrefix = depthSegs ? '../'.repeat(depthSegs) : './';


if (table.modules && Array.isArray(table.modules)) {

  for (const { name } of table.modules as Array<{ name: string }>) {
    // 1) 规范为以 glsl/ 为根的路径
    let depNorm: string;
    if (name.startsWith('@use-gpu/wgsl/')) {
      depNorm = 'glsl/' + name.slice('@use-gpu/wgsl/'.length);
    } else if (name.startsWith('wgsl/')) {
      depNorm = name;
    } else {
      // 可能是相对路径（如 "../geometry/quad" 或 "../../../glsl/geometry/quad"）
      depNorm = path.posix.normalize(path.posix.join(curDirRelSrc, name));
    }

    // 2) 取出 glsl/ 下的相对部分，例如 "glsl/geometry/quad" -> "geometry/quad"
    const depUnderGlsl = depNorm.replace(/^wgsl\//, '');

    // 3) 构造 import spec：退回到 src 根，再进入 gen-glsl/<dep>
    //    例如：curOutDir="gen-glsl/instance/vertex" -> "../../../gen-glsl/geometry/quad"
    const spec = `${rootPrefix}gen-wgsl/${depUnderGlsl}`;

    imports.push(makeImport(`m${i}`, spec));
    markers.push(`${stringify(name)}: m${i}`);

    console.log('[transpileWGSL:dep]', {
      resourcePath: rp,
      curOutDir,
      depthSegs,
      depName: name,
      depNorm,
      depUnderGlsl,
      importSpec: spec,
      slot: `m${i}`,
    });

    ++i;
  }
}


















  const libs = `const libs = {${markers.join(', ')}};`

  // Export visible symbols
  const exportSymbols = (table.visibles ?? []).map((s: string) => 
    `${esModule ? 'export const ' : 'exports.'}${s} = getSymbol(${stringify(s)});`
  );
  
  let exportDefault;
  if (esModule) {
    exportDefault = 'export default getSymbol();';
  }
  else {
    exportDefault = `
const __default = getSymbol();
Object.defineProperty(exports, '__esModule', { value: true });
Object.assign(exports, __default);
exports.default = __default;
    `
  }
  
  // Compose JS body
  const output = [
    preamble,
    ...imports,
    def,
    libs,

    `const getSymbol = (entry) => ({module: data, libs, entry});`,
    exportDefault,
    ...exportSymbols,
    '/* __WGSL_LOADER_GENERATED */',
  ].join("\n");

  return output;
}
