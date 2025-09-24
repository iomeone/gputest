import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
const data = {
    "name": "quad",
    "code": "let QUAD: array<vec2<i32>, 4> = array<vec2<i32>, 4>(\r\n  vec2<i32>(0, 0),\r\n  vec2<i32>(1, 0),\r\n  vec2<i32>(0, 1),\r\n  vec2<i32>(1, 1),\r\n);\r\n\r\n@export fn getQuadIndex(vertex: i32) -> vec2<i32> {\r\n  return QUAD[vertex];\r\n}\r\n\r\n@export fn getQuadUV(vertex: i32) -> vec2<f32> {\r\n  return vec2<f32>(getQuadIndex(vertex));\r\n}\r\n\r\n",
    "table": {"hash":"6jsnc56nnq","symbols":["QUAD","getQuadIndex","getQuadUV"],"visibles":["getQuadIndex","getQuadUV"],"declarations":[{"at":0,"symbol":"QUAD","flags":0,"constant":{"name":"QUAD","type":{"name":"array","args":[{"name":"vec2","args":[{"name":"i32"}]},{"name":"4"}]},"value":"array<vec2<i32>, 4>(\r\n  vec2<i32>(0, 0),\r\n  vec2<i32>(1, 0),\r\n  vec2<i32>(0, 1),\r\n  vec2<i32>(1, 1),\r\n)","identifiers":[]}},{"at":140,"symbol":"getQuadIndex","flags":1,"func":{"name":"getQuadIndex","type":{"name":"vec2","args":[{"name":"i32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"vertex","type":{"name":"i32"}}],"identifiers":["QUAD"]}},{"at":222,"symbol":"getQuadUV","flags":1,"func":{"name":"getQuadUV","type":{"name":"vec2","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"vertex","type":{"name":"i32"}}],"identifiers":["getQuadIndex"]}}]},
    "shake": [[0,["QUAD","getQuadIndex","getQuadUV"]],[140,["getQuadIndex","getQuadUV"]],[222,["getQuadUV"]]],
    "tree": decompressAST([["Shake",0,136],["Id",4,8],["Shake",140,218],["Skip",140,147],["Id",151,163],["Id",164,170],["Id",202,206],["Id",207,213],["Shake",222,316],["Skip",222,229],["Id",233,242],["Id",243,249],["Id",291,303],["Id",304,310]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getQuadIndex = getSymbol("getQuadIndex");
export const getQuadUV = getSymbol("getQuadUV");
/* __WGSL_LOADER_GENERATED */