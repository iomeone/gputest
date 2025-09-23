import { loadModule, compressAST } from '../shader/glsl';


import path from 'path';

// + 新增：统一分隔符
const toPosix = (p: string) => p.replace(/\\/g, '/');


const stringify = (s: any) => JSON.stringify(s);

export const transpileGLSL = (source: string, resourcePath: string, esModule: boolean = true) => {

  const makeImport = (symbol: string, from: string) => esModule
    ? `import ${symbol} from ${stringify(from)};`
    : `const ${symbol} = require(${stringify(from)});`;
  // const preamble = makeImport('{decompressAST}', '../shader/glsl');




    var preamble : string = "";






      {
        const toPosix = (p: string) => p.replace(/\\/g, '/');
            const log = (...args: any[]) => console.log('[transpileGLSL:preamble]', ...args);

            const rpRaw = resourcePath;
            const rp = toPosix(rpRaw);

            // 目标始终是以 “src 为根”的 'shader/glsl'
            const TARGET_IN_SRC = 'shader/glsl';

            // 计算：以 “src 为根” 的当前 .glsl 所在目录（dirRelToSrc）
            let dirRelToSrc: string | null = null;
            let mode = '';

            // 情形 A：resourcePath 是绝对路径并且包含 /src/glsl/...
            let m = rp.match(/\/src\/glsl\/(.+)\/[^/]+\.glsl$/);
            if (m) {
              dirRelToSrc = `glsl/${m[1]}`;       // e.g. glsl/geometry
              mode = 'abs->src/glsl/subdir';
            } else {
              // 情形 B：resourcePath 是相对路径 'glsl/xxx/.../file.glsl'
              m = rp.match(/^glsl\/(.+)\/[^/]+\.glsl$/);
              if (m) {
                dirRelToSrc = `glsl/${m[1]}`;
                mode = 'rel glsl/subdir';
              } else {
                // 情形 C：文件直接在 glsl 根目录
                if (/\/src\/glsl\/[^/]+\.glsl$/.test(rp)) {
                  dirRelToSrc = 'glsl';
                  mode = 'abs->src/glsl/root';
                } else if (/^glsl\/[^/]+\.glsl$/.test(rp)) {
                  dirRelToSrc = 'glsl';
                  mode = 'rel glsl/root';
                }
              }
            }

            let decompressFrom: string;
            if (dirRelToSrc) {
              // 用「以 src 为根」的相对目录，计算到 TARGET_IN_SRC 的相对导入
              let rel = path.posix.relative(dirRelToSrc, TARGET_IN_SRC);  // e.g. ../../shader/glsl
              if (!rel.startsWith('.')) rel = './' + rel;
              decompressFrom = rel;
              log({ mode, resourcePath: rp, dirRelToSrc, target: TARGET_IN_SRC, decompressFrom });
            } else {
              // 兜底：直接用当前文件所在目录去算（不依赖 src 结构）
              const dir = rp.includes('/') ? rp.slice(0, rp.lastIndexOf('/')) : '.';
              let rel = path.posix.relative(dir, TARGET_IN_SRC);
              if (!rel.startsWith('.')) rel = './' + rel;
              decompressFrom = rel;
              log({ mode: 'fallback', resourcePath: rp, dir, target: TARGET_IN_SRC, decompressFrom });
            }

             preamble = makeImport('{decompressAST}', decompressFrom);

      }

   























  // Parse module source code
  const name = resourcePath.split('/').pop()!.replace(/\.glsl$/, '');
  const module = loadModule(source, name);

  // Emit module data
  const {code, table, tree, shake} = module;
  const def = `const data = {
    "name": ${stringify(name)},
    "code": ${stringify(code)},
    "table": ${stringify(table)},
    "shake": ${stringify(shake)},
    "tree": decompressAST(${stringify(compressAST(tree))}),
  };`

  // Emit dependency imports
  // let i = 0;
  // const imports = [] as string[];
  // const markers = [] as string[];
  // for (const {name} of table.modules) {
  //   imports.push(makeImport(`m${i}`, name + '.glsl'));
  //   markers.push(`${stringify(name)}: m${i}`);
  //   ++i;
  // }





// —— 改成下面这一段（离线生成到 gen-glsl，强制相对路径、无 .glsl 后缀）——
let i = 0;
const imports: string[] = [];
const markers: string[] = [];

// 如果你上文没有这个工具函数，就解注释用它
const toPosix = (p: string) => p.replace(/\\/g, '/');

const rp = toPosix(resourcePath);

// 计算“当前 .glsl 的目录（以 src 为根的相对路径）”，例如：
//   resourcePath = "glsl/instance/vertex/quad.glsl"
//   -> curDirRelSrc = "glsl/instance/vertex"
let relFromSrc = rp;
const mAbs = rp.match(/\/src\/(glsl\/.*)$/);
if (mAbs) relFromSrc = mAbs[1];

const curDirRelSrc = relFromSrc.replace(/\/[^/]+\.glsl$/, '');   // glsl/instance/vertex
const curOutDir    = curDirRelSrc.replace(/^glsl\//, 'gen-glsl/'); // gen-glsl/instance/vertex

// 为了生成你期望的 "../../../gen-glsl/..." 这种写法，
// 我们构造“从当前生成目录退回到 src 根”的前缀，然后再下到 gen-glsl/目标。
// depthSegs = "gen-glsl/instance/vertex" 的段数 = 3 -> "../../../"
const depthSegs  = curOutDir.split('/').filter(Boolean).length;
const rootPrefix = depthSegs ? '../'.repeat(depthSegs) : './';

for (const { name } of table.modules as Array<{ name: string }>) {
  // 1) 规范为以 glsl/ 为根的路径
  let depNorm: string;
  if (name.startsWith('@use-gpu/glsl/')) {
    depNorm = 'glsl/' + name.slice('@use-gpu/glsl/'.length);
  } else if (name.startsWith('glsl/')) {
    depNorm = name;
  } else {
    // 可能是相对路径（如 "../geometry/quad" 或 "../../../glsl/geometry/quad"）
    depNorm = path.posix.normalize(path.posix.join(curDirRelSrc, name));
  }

  // 2) 取出 glsl/ 下的相对部分，例如 "glsl/geometry/quad" -> "geometry/quad"
  const depUnderGlsl = depNorm.replace(/^glsl\//, '');

  // 3) 构造 import spec：退回到 src 根，再进入 gen-glsl/<dep>
  //    例如：curOutDir="gen-glsl/instance/vertex" -> "../../../gen-glsl/geometry/quad"
  const spec = `${rootPrefix}gen-glsl/${depUnderGlsl}`;

  imports.push(makeImport(`m${i}`, spec));
  markers.push(`${stringify(name)}: m${i}`);

  console.log('[transpileGLSL:dep]', {
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















  const libs = `const libs = {${markers.join(', ')}};`

  // Export visible symbols
  const exportSymbols = table.visibles.map((s: string) => 
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
    '/* __GLSL_LOADER_GENERATED */',
  ].join("\n");

  return output;
}
