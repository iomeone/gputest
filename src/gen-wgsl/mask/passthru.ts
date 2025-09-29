import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getPassThruColor"],"visibles":["getPassThruColor"],"exports":[{"at":0,"symbol":"getPassThruColor","flags":1,"func":{"name":"getPassThruColor","type":"vec4<f32>","attr":["export"],"parameters":[{"name":"color","type":"vec4<f32>"},{"name":"uv","type":"vec4<f32>"},{"name":"st","type":"vec4<f32>"}]}}]}; const data = {
  "name": "passthru",
  "code": "@export fn getPassThruColor(color: vec4<f32>, uv: vec4<f32>, st: vec4<f32>) -> vec4<f32> {\r\n  if (HAS_ALPHA_TO_COVERAGE) {\r\n    return vec4<f32>(color.xyz, color.a);\r\n  }\r\n  else {\r\n    return vec4<f32>(color.xyz * color.a, color.a);\r\n  }\r\n}\r\n",
  "hash": 3523251283692929,
  "table": t,
  "shake": [[0,[0]]],
  "tree": decompressAST([[0,0,241],[1,0,7],[2,11,27],[2,17,22],[2,18,20],[2,15,17],[2,37,58],[2,47,52],[2,6,9],[2,5,10],[2,6,7],[2,41,46],[2,6,9],[2,6,11],[2,6,7],[2,3,8],[2,6,7]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getPassThruColor = getSymbol("getPassThruColor");
/* __WGSL_LOADER_GENERATED */