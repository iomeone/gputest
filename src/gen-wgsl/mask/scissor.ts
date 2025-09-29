import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getScissorColor","isScissored"],"visibles":["getScissorColor","isScissored"],"exports":[{"at":0,"symbol":"getScissorColor","flags":1,"func":{"name":"getScissorColor","type":"vec4<f32>","attr":["export"],"parameters":[{"name":"color","type":"vec4<f32>"},{"name":"min4","type":"vec4<f32>"}]}},{"at":407,"symbol":"isScissored","flags":1,"func":{"name":"isScissored","type":"bool","attr":["export"],"parameters":[{"name":"min4","type":"vec4<f32>"}]}}]}; const data = {
  "name": "scissor",
  "code": "@export fn getScissorColor(color: vec4<f32>, min4: vec4<f32>) -> vec4<f32> {\r\n  let min2 = min(min4.xy, min4.zw);\r\n  let m = min(min2.x, min2.y);\r\n  \r\n  let dx = dpdx(m);\r\n  let dy = dpdy(m);\r\n  let l = (length(dx) + length(dy));\r\n\r\n  let alpha = clamp(m / l, 0.0, 1.0);\r\n  if (HAS_ALPHA_TO_COVERAGE) {\r\n    return vec4<f32>(color.xyz, color.a * alpha);\r\n  }\r\n  else {\r\n    return color * alpha;\r\n  }\r\n}\r\n\r\n@export fn isScissored(min4: vec4<f32>) -> bool {\r\n  let min2 = min(min4.xy, min4.zw);\r\n  let m = min(min2.x, min2.y);\r\n  return m < 0.0;\r\n}\r\n",
  "hash": 2962410205920002,
  "table": t,
  "shake": [[0,[0]],[407,[1]]],
  "tree": decompressAST([[0,0,403],[1,0,7],[2,11,26],[2,16,21],[2,18,22],[2,39,43],[2,7,10],[2,4,8],[2,5,7],[2,4,8],[2,5,7],[2,12,13],[2,4,7],[2,4,8],[2,5,6],[2,3,7],[2,5,6],[2,15,17],[2,5,9],[2,5,6],[2,11,13],[2,5,9],[2,5,6],[2,11,12],[2,5,11],[2,7,9],[2,6,12],[2,7,9],[2,15,20],[2,8,13],[2,6,7],[2,4,5],[2,21,42],[2,47,52],[2,6,9],[2,5,10],[2,6,7],[2,4,9],[2,35,40],[2,8,13],[0,18,158],[1,0,7],[2,11,22],[2,12,16],[2,34,38],[2,7,10],[2,4,8],[2,5,7],[2,4,8],[2,5,7],[2,12,13],[2,4,7],[2,4,8],[2,5,6],[2,3,7],[2,5,6],[2,14,15]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getScissorColor = getSymbol("getScissorColor");
export const isScissored = getSymbol("isScissored");
/* __WGSL_LOADER_GENERATED */