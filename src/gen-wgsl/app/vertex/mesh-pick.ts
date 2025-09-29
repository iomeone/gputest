import {decompressAST, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../gen-wgsl/use/view";
const t = {"symbols":["VertexOutput","main"],"visibles":["main"],"modules":[{"at":0,"name":"../../../wgsl/use/view","symbols":["worldToClip"],"imports":[{"name":"worldToClip","imported":"worldToClip"}]}],"exports":[{"at":261,"symbol":"main","flags":1,"func":{"name":"main","type":"VertexOutput","attr":["vertex"],"parameters":[{"name":"instanceIndex","type":"u32","attr":["builtin(instance_index)"]},{"name":"position","type":"vec4<f32>","attr":["location(0)"]},{"name":"normal","type":"vec4<f32>","attr":["location(1)"]},{"name":"color","type":"vec4<f32>","attr":["location(2)"]},{"name":"uv","type":"vec2<f32>","attr":["location(3)"]}],"identifiers":["VertexOutput"]}}]}; const data = {
  "name": "mesh-pick",
  "code": "use '../../../wgsl/use/view'::{ worldToClip };\r\n\r\nstruct VertexOutput {\r\n  @builtin(position) position: vec4<f32>,\r\n  @location(0) fragScissor: vec4<f32>,\r\n  @location(1) @interpolate(flat) fragId: u32,\r\n  @location(2) @interpolate(flat) fragIndex: u32,\r\n};\r\n\r\n@vertex\r\nfn main(\r\n  @builtin(instance_index) instanceIndex: u32,\r\n  @location(0) position: vec4<f32>,\r\n  @location(1) normal: vec4<f32>,\r\n  @location(2) color: vec4<f32>,\r\n  @location(3) uv: vec2<f32>,\r\n) -> VertexOutput {\r\n  \r\n  var outPosition: vec4<f32> = worldToClip(position);\r\n  var fragIndex = u32(instanceIndex);\r\n  \r\n  return VertexOutput(\r\n    outPosition,\r\n    vec4<f32>(0.0),\r\n    u32(PICKING_ID),\r\n    fragIndex,\r\n  );\r\n}\r\n",
  "hash": 7718287354297247,
  "table": t,
  "shake": [[46,[0,1]],[261,[1]]],
  "tree": decompressAST([[1,0,45],[0,46,256],[2,11,23],[3,18,36],[2,1,8],[2,8,16],[2,10,18],[3,24,36],[2,1,9],[2,12,23],[3,27,39],[2,1,9],[3,12,30],[2,1,12],[2,12,16],[2,6,12],[3,16,28],[2,1,9],[3,12,30],[2,1,12],[2,12,16],[2,6,15],[0,23,458],[3,0,7],[2,1,7],[2,11,15],[3,9,33],[2,1,8],[2,8,22],[2,16,29],[3,23,35],[2,1,9],[2,12,20],[3,24,36],[2,1,9],[2,12,18],[3,22,34],[2,1,9],[2,12,17],[3,21,33],[2,1,9],[2,12,14],[2,21,33],[2,26,37],[2,25,36],[2,12,20],[2,18,27],[2,16,29],[2,30,42],[2,19,30],[2,43,53],[2,18,27]], t.symbols),
};
const libs = {"../../../wgsl/use/view": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
/* __WGSL_LOADER_GENERATED */