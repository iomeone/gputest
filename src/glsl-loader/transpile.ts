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

            const preamble = makeImport('{decompressAST}', decompressFrom);

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





    // 依赖导入：把 table.modules 里的 name 映射到相对的 gen-glsl/<dep>
    // 预期生成：import m0 from "../../../gen-glsl/use/view";
    let i = 0;
    const imports: string[] = [];
    const markers: string[] = [];
    // 小工具（若你前面没有的话可以解开下面一行）
    // const toPosix = (p: string) => p.replace(/\\/g, '/');
    const rp = toPosix(resourcePath);
    // 取出“以 src 为根”的 glsl 子目录，如：glsl/geometry/strip.glsl → glsl/geometry
    // 支持绝对路径 (.../src/glsl/...) 和相对路径 (glsl/...)
    let relFromSrc = rp;
    const m = rp.match(/\/src\/(glsl\/.+)$/);
    if (m) relFromSrc = m[1];
    const curDirRelSrc = relFromSrc.replace(/\/[^/]+\.glsl$/, ''); // e.g. glsl/geometry
    const curOutDir    = curDirRelSrc.replace(/^glsl\//, 'gen-glsl/'); // e.g. gen-glsl/geometry
    for (const { name } of table.modules) {
      // 1) 规范依赖名为 glsl/<dep>
      let depRelSrc = name.replace(/^@?use-gpu\/glsl\//, '');
      if (!/^glsl\//.test(depRelSrc)) depRelSrc = `glsl/${depRelSrc}`;
      // 2) 转成生成物路径：gen-glsl/<dep>
      const depOut   = depRelSrc.replace(/^glsl\//, 'gen-glsl/'); // e.g. gen-glsl/use/view
      // 3) 计算从当前输出目录到依赖输出文件的相对导入（无扩展名）
      let spec = path.posix.relative(curOutDir, depOut);          // e.g. ../../use/view
      if (!spec.startsWith('.')) spec = './' + spec;              // 保证以 ./ 或 ../ 开头
      // 4) 产出 import 语句与 libs 标记
      imports.push(makeImport(`m${i}`, spec));
      markers.push(`${stringify(name)}: m${i}`);
      // 5) 日志
      console.log('[transpileGLSL:dep]', {
        resourcePath: rp,
        curOutDir,
        depName: name,
        mapped: depOut,
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
