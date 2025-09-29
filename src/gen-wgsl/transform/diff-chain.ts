import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["transformPositionA","getDifferentialA","getDifferentialB","getChainDifferential"],"visibles":["getChainDifferential"],"externals":[{"at":0,"symbol":"transformPositionA","flags":2,"func":{"name":"transformPositionA","type":"vec4<f32>","attr":["link"],"parameters":[{"name":"origin","type":"vec4<f32>"}]}},{"at":64,"symbol":"getDifferentialA","flags":2,"func":{"name":"getDifferentialA","type":"vec4<f32>","attr":["link"],"parameters":[{"name":"vector","type":"vec4<f32>"},{"name":"origin","type":"vec4<f32>"},{"name":"contravariant","type":"bool"}]}},{"at":164,"symbol":"getDifferentialB","flags":2,"func":{"name":"getDifferentialB","type":"vec4<f32>","attr":["link"],"parameters":[{"name":"vector","type":"vec4<f32>"},{"name":"origin","type":"vec4<f32>"},{"name":"contravariant","type":"bool"}]}}],"exports":[{"at":266,"symbol":"getChainDifferential","flags":1,"func":{"name":"getChainDifferential","type":"vec4<f32>","attr":["export"],"parameters":[{"name":"vector","type":"vec4<f32>"},{"name":"origin","type":"vec4<f32>"},{"name":"contravariant","type":"bool"}],"identifiers":["getDifferentialA","getDifferentialB","transformPositionA"]}}],"linkable":{"transformPositionA":true,"getDifferentialA":true,"getDifferentialB":true}}; const data = {
  "name": "diff-chain",
  "code": "@link fn transformPositionA(origin: vec4<f32>) -> vec4<f32>;\r\n\r\n@link fn getDifferentialA(vector: vec4<f32>, origin: vec4<f32>, contravariant: bool) -> vec4<f32>;\r\n@link fn getDifferentialB(vector: vec4<f32>, origin: vec4<f32>, contravariant: bool) -> vec4<f32>;\r\n\r\n@export fn getChainDifferential(vector: vec4<f32>, origin: vec4<f32>, contravariant: bool) -> vec4<f32> {\r\n  let v = getDifferentialA(vector, origin, contravariant);\r\n  return getDifferentialB(v, transformPositionA(origin), contravariant);\r\n}\r\n",
  "hash": 4034776901087521,
  "table": t,
  "shake": [[0,[0,3]],[64,[1,3]],[164,[2,3]],[266,[3]]],
  "tree": decompressAST([[1,0,59],[1,64,161],[1,100,197],[0,102,344],[1,0,7],[2,11,31],[2,21,27],[2,19,25],[2,19,32],[2,43,44],[2,4,20],[2,17,23],[2,8,14],[2,8,21],[2,26,42],[2,17,18],[2,3,21],[2,19,25],[2,9,22]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getChainDifferential = getSymbol("getChainDifferential");
/* __WGSL_LOADER_GENERATED */