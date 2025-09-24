import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wlsl";
const data = {
    "name": "strip",
    "code": "@export fn getStripIndex(vertex: i32) -> vec2<i32> {\r\n  var x = vertex >> 1u;\r\n  var y = vertex & 1;\r\n  return vec2<i32>(x, y);\r\n}\r\n\r\n@export fn getStripUV(vertex: i32) -> vec2<f32> {\r\n  return vec2<f32>(getStripIndex(vertex));\r\n}\r\n\r\n",
    "table": {"hash":"fee9kvonjy","symbols":["getStripIndex","getStripUV"],"visibles":["getStripIndex","getStripUV"],"declarations":[{"at":0,"symbol":"getStripIndex","flags":1,"func":{"name":"getStripIndex","type":{"name":"vec2","args":[{"name":"i32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"vertex","type":{"name":"i32"}}],"identifiers":[]}},{"at":134,"symbol":"getStripUV","flags":1,"func":{"name":"getStripUV","type":{"name":"vec2","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"vertex","type":{"name":"i32"}}],"identifiers":["getStripIndex"]}}]},
    "shake": [[0,["getStripIndex","getStripUV"]],[134,["getStripUV"]]],
    "tree": decompressAST([["Shake",0,130],["Skip",0,7],["Id",11,24],["Id",25,31],["Id",60,61],["Id",64,70],["Id",85,86],["Id",89,95],["Id",121,122],["Id",124,125],["Shake",134,230],["Skip",134,141],["Id",145,155],["Id",156,162],["Id",204,217],["Id",218,224]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getStripIndex = getSymbol("getStripIndex");
export const getStripUV = getSymbol("getStripUV");
/* __WGSL_LOADER_GENERATED */