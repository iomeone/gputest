import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["lightTexture","lightSampler","sampleShadow"],"visibles":["sampleShadow"],"exports":[{"at":136,"symbol":"sampleShadow","flags":1,"func":{"name":"sampleShadow","type":"f32","attr":["export"],"parameters":[{"name":"uv","type":"vec2<f32>"},{"name":"index","type":"u32"},{"name":"level","type":"f32"}],"identifiers":["lightTexture","lightSampler"]}}]}; const data = {
  "name": "shadow",
  "code": "@group(LIGHT) @binding(1) var lightTexture: texture_depth_2d_array;\r\n@group(LIGHT) @binding(2) var lightSampler: sampler_comparison;\r\n\r\n@export fn sampleShadow(uv: vec2<f32>, index: u32, level: f32) -> f32 {\r\n  return textureSampleCompareLevel(lightTexture, lightSampler, uv, index, level);\r\n}\r\n",
  "hash": 5685552190986538,
  "table": t,
  "shake": [[0,[0,2]],[69,[1,2]],[136,[2]]],
  "tree": decompressAST([[0,0,67],[3,0,13],[2,1,6],[2,6,11],[3,7,18],[2,1,8],[2,15,27],[0,39,102],[3,0,13],[2,1,6],[2,6,11],[3,7,18],[2,1,8],[2,15,27],[0,37,194],[1,0,7],[2,11,23],[2,13,15],[2,15,20],[2,12,17],[2,31,56],[2,26,38],[2,14,26],[2,14,16],[2,4,9],[2,7,12]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const sampleShadow = getSymbol("sampleShadow");
/* __WGSL_LOADER_GENERATED */