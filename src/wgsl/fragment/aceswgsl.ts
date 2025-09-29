import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["ACES_INPUT","ACES_OUTPUT","RRTAndODTFit","tonemapACES"],"visibles":["tonemapACES"],"exports":[{"at":556,"symbol":"tonemapACES","flags":1,"func":{"name":"tonemapACES","type":"vec4<f32>","attr":["export"],"parameters":[{"name":"color","type":"vec4<f32>"}],"identifiers":["ACES_INPUT","RRTAndODTFit","ACES_OUTPUT"]}}]}; const data = {
  "name": "aces",
  "code": "// ACES fit by Stephen Hill (@self_shadow)\r\n\r\n// sRGB => XYZ => D65_2_D60 => AP1 => RRT_SAT\r\nconst ACES_INPUT = mat3x3(\r\n\t0.59719, 0.07600, 0.02840,\r\n\t0.35458, 0.90834, 0.13383,\r\n\t0.04823, 0.01566, 0.83777\r\n);\r\n\r\n// ODT_SAT => XYZ => D60_2_D65 => sRGB\r\nconst ACES_OUTPUT = mat3x3(\r\n   1.60475, -0.10208, -0.00327,\r\n  -0.53108,  1.10813, -0.07276,\r\n  -0.07367, -0.00605,  1.07602,\r\n);\r\n\r\nfn RRTAndODTFit(v: vec3<f32>) -> vec3<f32> {\r\n  let a = v * (v + 0.0245786) - 0.000090537;\r\n  let b = v * (0.983729 * v + 0.4329510) + 0.238081;\r\n  return a / b;\r\n};\r\n\r\n@export fn tonemapACES(color: vec4<f32>) -> vec4<f32> {\r\n  var rgb = color.rgb;\r\n  \r\n  rgb = ACES_INPUT * rgb;\r\n  rgb = RRTAndODTFit(rgb);\r\n  rgb = ACES_OUTPUT * rgb;\r\n  rgb = saturate(rgb);\r\n\r\n  return vec4<f32>(rgb, color.a);\r\n};\r\n",
  "hash": 4996701175472662,
  "table": t,
  "shake": [[0,[0,3]],[209,[1,3]],[383,[2,3]],[556,[3]]],
  "tree": decompressAST([[0,0,209],[2,99,109],[0,110,284],[2,50,61],[0,124,292],[2,7,19],[2,13,14],[2,36,37],[2,4,5],[2,5,6],[2,37,38],[2,4,5],[2,16,17],[2,37,38],[2,4,5],[0,10,240],[1,0,7],[2,11,22],[2,12,17],[2,40,43],[2,6,11],[2,6,9],[2,12,15],[2,6,16],[2,13,16],[2,8,11],[2,6,18],[2,13,16],[2,9,12],[2,6,17],[2,14,17],[2,8,11],[2,6,14],[2,9,12],[2,28,31],[2,5,10],[2,6,7]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const tonemapACES = getSymbol("tonemapACES");
/* __WGSL_LOADER_GENERATED */