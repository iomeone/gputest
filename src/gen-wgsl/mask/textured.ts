import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getTexture","getTextureColor"],"visibles":["getTextureColor"],"externals":[{"at":0,"symbol":"getTexture","flags":6,"func":{"name":"getTexture","type":"vec4<f32>","attr":["optional","link"],"parameters":[{"name":"uv","type":"vec2<f32>"}]}}],"exports":[{"at":104,"symbol":"getTextureColor","flags":1,"func":{"name":"getTextureColor","type":"vec4<f32>","attr":["export"],"parameters":[{"name":"color","type":"vec4<f32>"},{"name":"uv","type":"vec4<f32>"},{"name":"st","type":"vec4<f32>"}],"identifiers":["getTexture"]}}],"linkable":{"getTexture":true}}; const data = {
  "name": "textured",
  "code": "@optional @link fn getTexture(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(1.0, 1.0, 1.0, 1.0); };\r\n\r\n@export fn getTextureColor(color: vec4<f32>, uv: vec4<f32>, st: vec4<f32>) -> vec4<f32> {\r\n  return color * getTexture(uv.xy);\r\n}\r\n",
  "hash": 6725755943969266,
  "table": t,
  "shake": [[0,[0,1]],[104,[1]]],
  "tree": decompressAST([[4,0,99,0],[1,0,9],[1,10,15],[2,9,19],[2,11,13],[0,74,203],[1,0,7],[2,11,26],[2,16,21],[2,18,20],[2,15,17],[2,40,45],[2,8,18],[2,11,13],[2,3,5]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getTextureColor = getSymbol("getTextureColor");
/* __WGSL_LOADER_GENERATED */