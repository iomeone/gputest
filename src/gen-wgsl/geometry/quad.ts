import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
const data = {
    "name": "quad",
    "code": "let QUAD: array<vec2<u32>, 4> = array<vec2<u32>, 4>(\r\n  vec2<u32>(0u, 0u),\r\n  vec2<u32>(1u, 0u),\r\n  vec2<u32>(0u, 1u),\r\n  vec2<u32>(1u, 1u),\r\n);\r\n\r\n@export fn getQuadIndex(vertex: u32) -> vec2<u32> {\r\n  return QUAD[vertex];\r\n}\r\n\r\n@export fn getQuadUV(vertex: u32) -> vec2<f32> {\r\n  return vec2<f32>(getQuadIndex(vertex));\r\n}\r\n\r\n",
    "hash": 7562400868280356,
    "table": {"symbols":["QUAD","getQuadIndex","getQuadUV"],"visibles":["getQuadIndex","getQuadUV"],"exports":[{"at":148,"symbol":"getQuadIndex","flags":1,"func":{"name":"getQuadIndex","type":{"name":"vec2","args":[{"name":"u32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"vertex","type":{"name":"u32"}}],"identifiers":["QUAD"]}},{"at":230,"symbol":"getQuadUV","flags":1,"func":{"name":"getQuadUV","type":{"name":"vec2","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"vertex","type":{"name":"u32"}}],"identifiers":["getQuadIndex"]}}],"declarations":[{"at":0,"symbol":"QUAD","flags":0,"constant":{"name":"QUAD","type":{"name":"array","args":[{"name":"vec2","args":[{"name":"u32"}]},{"name":"4"}]},"value":"array<vec2<u32>, 4>(\r\n  vec2<u32>(0u, 0u),\r\n  vec2<u32>(1u, 0u),\r\n  vec2<u32>(0u, 1u),\r\n  vec2<u32>(1u, 1u),\r\n)","identifiers":[]}},{"at":148,"symbol":"getQuadIndex","flags":1,"func":{"name":"getQuadIndex","type":{"name":"vec2","args":[{"name":"u32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"vertex","type":{"name":"u32"}}],"identifiers":["QUAD"]}},{"at":230,"symbol":"getQuadUV","flags":1,"func":{"name":"getQuadUV","type":{"name":"vec2","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"vertex","type":{"name":"u32"}}],"identifiers":["getQuadIndex"]}}]},
    "shake": [[0,["QUAD","getQuadIndex","getQuadUV"]],[148,["getQuadIndex","getQuadUV"]],[230,["getQuadUV"]]],
    "tree": decompressAST([["Shake",0,144],["Id",4,8],["Shake",148,226],["Skip",148,155],["Id",159,171],["Id",172,178],["Id",210,214],["Id",215,221],["Shake",230,324],["Skip",230,237],["Id",241,250],["Id",251,257],["Id",299,311],["Id",312,318]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getQuadIndex = getSymbol("getQuadIndex");
export const getQuadUV = getSymbol("getQuadUV");
/* __WGSL_LOADER_GENERATED */