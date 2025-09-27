import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
const data = {
    "name": "strip",
    "code": "@export fn getStripIndex(vertex: u32) -> vec2<u32> {\r\n  var x = vertex >> 1u;\r\n  var y = vertex & 1u;\r\n  return vec2<u32>(x, y);\r\n}\r\n\r\n@export fn getStripUV(vertex: u32) -> vec2<f32> {\r\n  return vec2<f32>(getStripIndex(vertex));\r\n}\r\n\r\n",
    "hash": "cornx50wco",
    "table": {"symbols":["getStripIndex","getStripUV"],"visibles":["getStripIndex","getStripUV"],"declarations":[{"at":0,"symbol":"getStripIndex","flags":1,"func":{"name":"getStripIndex","type":{"name":"vec2","args":[{"name":"u32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"vertex","type":{"name":"u32"}}],"identifiers":[]}},{"at":135,"symbol":"getStripUV","flags":1,"func":{"name":"getStripUV","type":{"name":"vec2","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"vertex","type":{"name":"u32"}}],"identifiers":["getStripIndex"]}}]},
    "shake": [[0,["getStripIndex","getStripUV"]],[135,["getStripUV"]]],
    "tree": decompressAST([["Shake",0,131],["Skip",0,7],["Id",11,24],["Id",25,31],["Id",60,61],["Id",64,70],["Id",85,86],["Id",89,95],["Id",122,123],["Id",125,126],["Shake",135,231],["Skip",135,142],["Id",146,156],["Id",157,163],["Id",205,218],["Id",219,225]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getStripIndex = getSymbol("getStripIndex");
export const getStripUV = getSymbol("getStripUV");
/* __WGSL_LOADER_GENERATED */