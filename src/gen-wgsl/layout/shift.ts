import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
const data = {
    "name": "shift",
    "code": "@link fn getOffset(i: u32) -> vec2<f32>;\r\n\r\n@export fn getShiftedRectangle(rectangle: vec4<f32>) -> vec4<f32> {\r\n  let offset = getOffset(0u);\r\n  return vec4<f32>(rectangle.xy + offset, rectangle.zw + offset);\r\n}\r\n",
    "hash": 8083400433632283,
    "table": {"symbols":["getOffset","getShiftedRectangle"],"visibles":["getShiftedRectangle"],"externals":[{"at":0,"symbol":"getOffset","flags":2,"func":{"name":"getOffset","type":{"name":"vec2","args":[{"name":"f32"}]},"attributes":[{"name":"link"}],"parameters":[{"name":"i","type":{"name":"u32"}}],"identifiers":[]}}],"exports":[{"at":44,"symbol":"getShiftedRectangle","flags":1,"func":{"name":"getShiftedRectangle","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"rectangle","type":{"name":"vec4","args":[{"name":"f32"}]}}],"identifiers":["getOffset"]}}],"declarations":[{"at":0,"symbol":"getOffset","flags":2,"func":{"name":"getOffset","type":{"name":"vec2","args":[{"name":"f32"}]},"attributes":[{"name":"link"}],"parameters":[{"name":"i","type":{"name":"u32"}}],"identifiers":[]}},{"at":44,"symbol":"getShiftedRectangle","flags":1,"func":{"name":"getShiftedRectangle","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"rectangle","type":{"name":"vec4","args":[{"name":"f32"}]}}],"identifiers":["getOffset"]}}]},
    "shake": [[0,["getOffset","getShiftedRectangle"]],[44,["getShiftedRectangle"]]],
    "tree": decompressAST([["Skip",0,39],["Shake",44,212],["Skip",44,51],["Id",55,74],["Id",75,84],["Id",119,125],["Id",128,137],["Id",163,172],["Id",173,175],["Id",178,184],["Id",186,195],["Id",196,198],["Id",201,207]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getShiftedRectangle = getSymbol("getShiftedRectangle");
/* __WGSL_LOADER_GENERATED */