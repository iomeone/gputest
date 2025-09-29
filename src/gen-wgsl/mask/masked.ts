import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getMask","getMaskedColor"],"visibles":["getMaskedColor"],"externals":[{"at":0,"symbol":"getMask","flags":6,"func":{"name":"getMask","type":"f32","attr":["optional","link"],"parameters":[{"name":"uv","type":"vec2<f32>"}]}}],"exports":[{"at":69,"symbol":"getMaskedColor","flags":1,"func":{"name":"getMaskedColor","type":"vec4<f32>","attr":["export"],"parameters":[{"name":"color","type":"vec4<f32>"},{"name":"uv","type":"vec4<f32>"},{"name":"st","type":"vec4<f32>"}],"identifiers":["getMask"]}}],"linkable":{"getMask":true}}; const data = {
  "name": "masked",
  "code": "@optional @link fn getMask(uv: vec2<f32>) -> f32 { return 1.0; };\r\n\r\n@export fn getMaskedColor(color: vec4<f32>, uv: vec4<f32>, st: vec4<f32>) -> vec4<f32> {\r\n  let m = getMask(uv.xy);\r\n  return vec4<f32>(color.xyz, color.a * m);\r\n}\r\n",
  "hash": 61292061074848,
  "table": t,
  "shake": [[0,[0,1]],[69,[1]]],
  "tree": decompressAST([[4,0,64,0],[1,0,9],[1,10,15],[2,9,16],[2,8,10],[0,42,205],[1,0,7],[2,11,25],[2,15,20],[2,18,20],[2,15,17],[2,37,38],[2,4,11],[2,8,10],[2,3,5],[2,25,30],[2,6,9],[2,5,10],[2,6,7],[2,4,5]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getMaskedColor = getSymbol("getMaskedColor");
/* __WGSL_LOADER_GENERATED */