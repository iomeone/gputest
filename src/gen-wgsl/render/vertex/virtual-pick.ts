import {decompressAST, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../gen-wgsl/use/types";
const t = {"symbols":["getVertex","getPicking","VertexOutput","main"],"visibles":["main"],"modules":[{"at":0,"name":"../../../wgsl/use/types","symbols":["PickVertex"],"imports":[{"name":"PickVertex","imported":"PickVertex"}]}],"externals":[{"at":50,"symbol":"getVertex","flags":2,"func":{"name":"getVertex","type":"PickVertex","attr":["link"],"parameters":[{"name":"v","type":"u32"},{"name":"i","type":"u32"}]}},{"at":104,"symbol":"getPicking","flags":6,"func":{"name":"getPicking","type":"vec2<u32>","attr":["optional","link"],"parameters":[{"name":"i","type":"u32"}]}}],"exports":[{"at":400,"symbol":"main","flags":1,"func":{"name":"main","type":"VertexOutput","attr":["vertex"],"parameters":[{"name":"vertexIndex","type":"u32","attr":["builtin(vertex_index)"]},{"name":"instanceIndex","type":"u32","attr":["builtin(instance_index)"]}],"identifiers":["getVertex","getPicking","VertexOutput"]}}],"linkable":{"getVertex":true,"getPicking":true}}; const data = {
  "name": "virtual-pick",
  "code": "use '../../../wgsl/use/types'::{ PickVertex };\r\n\r\n@link fn getVertex(v: u32, i: u32) -> PickVertex {};\r\n@optional @link fn getPicking(i: u32) -> vec2<u32> { return vec2<u32>(0u, 0u); };\r\n\r\nstruct VertexOutput {\r\n  @builtin(position) position: vec4<f32>,\r\n  @location(0) fragScissor: vec4<f32>,\r\n  @location(1) @interpolate(flat) fragId: u32,\r\n  @location(2) @interpolate(flat) fragIndex: u32,\r\n};\r\n\r\n@vertex\r\nfn main(\r\n  @builtin(vertex_index) vertexIndex: u32,\r\n  @builtin(instance_index) instanceIndex: u32,\r\n) -> VertexOutput {\r\n  var v = getVertex(vertexIndex, instanceIndex);\r\n  var p = getPicking(v.index);\r\n\r\n  return VertexOutput(\r\n    v.position,\r\n    v.scissor,\r\n    p.x,\r\n    p.y,\r\n  );\r\n}\r\n",
  "hash": 3781330765232195,
  "table": t,
  "shake": [[50,[0,3]],[104,[1,3]],[185,[2,3]],[400,[3]]],
  "tree": decompressAST([[1,0,45],[1,50,101],[4,54,134,1],[1,0,9],[1,10,15],[2,9,19],[2,11,12],[0,51,261],[2,11,23],[3,18,36],[2,1,8],[2,8,16],[2,10,18],[3,24,36],[2,1,9],[2,12,23],[3,27,39],[2,1,9],[3,12,30],[2,1,12],[2,12,16],[2,6,12],[3,16,28],[2,1,9],[3,12,30],[2,1,12],[2,12,16],[2,6,15],[0,23,323],[3,0,7],[2,1,7],[2,11,15],[3,9,31],[2,1,8],[2,8,20],[2,14,25],[3,21,45],[2,1,8],[2,8,22],[2,16,29],[2,26,38],[2,22,23],[2,4,13],[2,10,21],[2,13,26],[2,23,24],[2,4,14],[2,11,12],[2,2,7],[2,20,32],[2,19,20],[2,2,10],[2,15,16],[2,2,9],[2,14,15],[2,2,3],[2,8,9],[2,2,3]], t.symbols),
};
const libs = {"../../../wgsl/use/types": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
/* __WGSL_LOADER_GENERATED */