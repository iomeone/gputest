import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getStripIndex","getStripUV"],"visibles":["getStripIndex","getStripUV"],"exports":[{"at":0,"symbol":"getStripIndex","flags":1,"func":{"name":"getStripIndex","type":"vec2<u32>","attr":["export"],"parameters":[{"name":"vertex","type":"u32"}]}},{"at":135,"symbol":"getStripUV","flags":1,"func":{"name":"getStripUV","type":"vec2<f32>","attr":["export"],"parameters":[{"name":"vertex","type":"u32"}],"identifiers":["getStripIndex"]}}]}; const data = {
  "name": "strip",
  "code": "@export fn getStripIndex(vertex: u32) -> vec2<u32> {\r\n  var x = vertex >> 1u;\r\n  var y = vertex & 1u;\r\n  return vec2<u32>(x, y);\r\n}\r\n\r\n@export fn getStripUV(vertex: u32) -> vec2<f32> {\r\n  return vec2<f32>(getStripIndex(vertex));\r\n}\r\n\r\n",
  "hash": 6380113716234358,
  "table": t,
  "shake": [[0,[0,1]],[135,[1]]],
  "tree": decompressAST([[0,0,131],[1,0,7],[2,11,24],[2,14,20],[2,35,36],[2,4,10],[2,21,22],[2,4,10],[2,33,34],[2,3,4],[0,10,106],[1,0,7],[2,11,21],[2,11,17],[2,48,61],[2,14,20]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getStripIndex = getSymbol("getStripIndex");
export const getStripUV = getSymbol("getStripUV");
/* __WGSL_LOADER_GENERATED */