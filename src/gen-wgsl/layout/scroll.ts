import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
const data = {
    "name": "scroll",
    "code": "@link fn getOffset(i: u32) -> vec2<f32>;\r\n\r\n@export fn getScrolledPosition(position: vec4<f32>) -> vec4<f32> {\r\n  return vec4<f32>(position.xy + getOffset(0u), position.zw);\r\n}\r\n",
    "hash": 3020650034908723,
    "table": {"symbols":["getOffset","getScrolledPosition"],"visibles":["getScrolledPosition"],"externals":[{"at":0,"symbol":"getOffset","flags":2,"func":{"name":"getOffset","type":{"name":"vec2","args":[{"name":"f32"}]},"attributes":[{"name":"link"}],"parameters":[{"name":"i","type":{"name":"u32"}}],"identifiers":[]}}],"exports":[{"at":44,"symbol":"getScrolledPosition","flags":1,"func":{"name":"getScrolledPosition","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"position","type":{"name":"vec4","args":[{"name":"f32"}]}}],"identifiers":["getOffset"]}}],"declarations":[{"at":0,"symbol":"getOffset","flags":2,"func":{"name":"getOffset","type":{"name":"vec2","args":[{"name":"f32"}]},"attributes":[{"name":"link"}],"parameters":[{"name":"i","type":{"name":"u32"}}],"identifiers":[]}},{"at":44,"symbol":"getScrolledPosition","flags":1,"func":{"name":"getScrolledPosition","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"position","type":{"name":"vec4","args":[{"name":"f32"}]}}],"identifiers":["getOffset"]}}]},
    "shake": [[0,["getOffset","getScrolledPosition"]],[44,["getScrolledPosition"]]],
    "tree": decompressAST([["Skip",0,39],["Shake",44,176],["Skip",44,51],["Id",55,74],["Id",75,83],["Id",131,139],["Id",140,142],["Id",145,154],["Id",160,168],["Id",169,171]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getScrolledPosition = getSymbol("getScrolledPosition");
/* __WGSL_LOADER_GENERATED */