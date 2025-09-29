import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getQuadIndex","getQuadUV"],"visibles":["getQuadIndex","getQuadUV"],"exports":[{"at":0,"symbol":"getQuadIndex","flags":1,"func":{"name":"getQuadIndex","type":"vec2<u32>","attr":["export"],"parameters":[{"name":"vertex","type":"u32"}]}},{"at":113,"symbol":"getQuadUV","flags":1,"func":{"name":"getQuadUV","type":"vec2<f32>","attr":["export"],"parameters":[{"name":"vertex","type":"u32"}],"identifiers":["getQuadIndex"]}}]}; const data = {
  "name": "quad",
  "code": "@export fn getQuadIndex(vertex: u32) -> vec2<u32> {\r\n  return vec2<u32>(vertex & 1u, (vertex & 2u) >> 1u);\r\n}\r\n\r\n@export fn getQuadUV(vertex: u32) -> vec2<f32> {\r\n  return vec2<f32>(getQuadIndex(vertex));\r\n}\r\n\r\n",
  "hash": 1709966487746152,
  "table": t,
  "shake": [[0,[0,1]],[113,[1]]],
  "tree": decompressAST([[0,0,109],[1,0,7],[2,11,23],[2,13,19],[2,48,54],[2,14,20],[0,27,121],[1,0,7],[2,11,20],[2,10,16],[2,48,60],[2,13,19]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getQuadIndex = getSymbol("getQuadIndex");
export const getQuadUV = getSymbol("getQuadUV");
/* __WGSL_LOADER_GENERATED */