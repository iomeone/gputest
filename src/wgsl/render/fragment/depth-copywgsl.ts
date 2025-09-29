import {decompressAST, bindEntryPoint} from "../../../shader/wgsl";
const t = {"symbols":["getDepth","main"],"visibles":["main"],"externals":[{"at":0,"symbol":"getDepth","flags":6,"func":{"name":"getDepth","type":"vec4<f32>","attr":["optional","link"],"parameters":[{"name":"color","type":"vec4<f32>"},{"name":"uv","type":"vec4<f32>"},{"name":"st","type":"vec4<f32>"}]}}],"exports":[{"at":132,"symbol":"main","flags":1,"func":{"name":"main","type":{"name":"f32","attr":["builtin(frag_depth)"]},"attr":["fragment"],"parameters":[{"name":"frontFacing","type":"bool","attr":["builtin(front_facing)"]},{"name":"fragAlpha","type":"f32","attr":["location(0)"]},{"name":"fragUV","type":"vec4<f32>","attr":["location(1)"]},{"name":"fragST","type":"vec4<f32>","attr":["location(2)"]},{"name":"fragScissor","type":"vec4<f32>","attr":["location(3)"]}],"identifiers":["getDepth"]}}],"linkable":{"getDepth":true}}; const data = {
  "name": "depth-copy",
  "code": "@optional @link fn getDepth(\r\n  color: vec4<f32>,\r\n  uv: vec4<f32>,\r\n  st: vec4<f32>,\r\n) -> vec4<f32> { return vec4<f32>(0.0); }\r\n\r\n@fragment\r\nfn main(\r\n  @builtin(front_facing) frontFacing: bool,\r\n  @location(0) fragAlpha: f32,\r\n  @location(1) fragUV: vec4<f32>,\r\n  @location(2) fragST: vec4<f32>,\r\n  @location(3) fragScissor: vec4<f32>,  \r\n) -> @builtin(frag_depth) f32 {\r\n\r\n  var outColor = vec4<f32>(1.0, 1.0, 1.0, fragAlpha);\r\n  return getDepth(outColor, fragUV, fragST).r;\r\n}\r\n",
  "hash": 4002730679008560,
  "table": t,
  "shake": [[0,[0,1]],[132,[1]]],
  "tree": decompressAST([[4,0,128,0],[1,0,9],[1,10,15],[2,9,17],[2,13,18],[2,21,23],[2,18,20],[0,61,410],[3,0,9],[2,1,9],[2,13,17],[3,9,31],[2,1,8],[2,8,20],[2,14,25],[3,22,34],[2,1,9],[2,12,21],[3,19,31],[2,1,9],[2,12,18],[3,22,34],[2,1,9],[2,12,18],[3,22,34],[2,1,9],[2,12,23],[3,32,52],[2,1,8],[2,8,18],[2,27,35],[2,36,45],[2,22,30],[2,9,17],[2,10,16],[2,8,14],[2,8,9]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
/* __WGSL_LOADER_GENERATED */