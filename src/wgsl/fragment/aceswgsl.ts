/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("ACES_INPUT ACES_OUTPUT RRTAndODTFit tonemapACES symbols visibles symbol flags name vec4<f32> type export attr color parameters identifiers func exports".split(' '));
const t = {[_(4)]:_([0,1,2,3]),[_(5)]:_([3]),[_(17)]:[{"at":556,[_(6)]:_(3),[_(7)]:1,[_(16)]:{[_(8)]:_(3),[_(10)]:_(9),[_(12)]:_([11]),[_(14)]:[{[_(8)]:_(13),[_(10)]:_(9)}],[_(15)]:_([0,2,1])}}]};
const data = {
  "name": "fragment/aces",
  "code": _(["// ACES fit by Stephen Hill (@self_shadow)\r\n\r\n// sRGB => XYZ => D65_2_D60 => AP1 => RRT_SAT\r\nconst ",0," = mat3x3(\r\n\t0.59719, 0.07600, 0.02840,\r\n\t0.35458, 0.90834, 0.13383,\r\n\t0.04823, 0.01566, 0.83777\r\n);\r\n\r\n// ODT_SAT => XYZ => D60_2_D65 => sRGB\r\nconst ",1," = mat3x3(\r\n   1.60475, -0.10208, -0.00327,\r\n  -0.53108,  1.10813, -0.07276,\r\n  -0.07367, -0.00605,  1.07602,\r\n);\r\n\r\nfn ",2,"(v: vec3<f32>) -> vec3<f32> {\r\n  let a = v * (v + 0.0245786) - 0.000090537;\r\n  let b = v * (0.983729 * v + 0.4329510) + 0.238081;\r\n  return a / b;\r\n};\r\n\r\n@",11," fn ",3,"(",13,": ",9,") -> ",9," {\r\n  var rgb = ",13,".rgb;\r\n\r\n  rgb = ",0," * rgb;\r\n  rgb = ",2,"(rgb);\r\n  rgb = ",1," * rgb;\r\n  rgb = saturate(rgb);\r\n\r\n  return ",9,"(rgb, ",13,".a);\r\n};"]).join(''),
  "hash": 4628785980449116,
  "table": t,
  "shake": [[0,[0,3]],[209,[1,3]],[383,[2,3]],[556,[3]]],
  "tree": decompressAST([[0,0,209],[2,99,109],[0,110,284],[2,50,61],[0,124,292],[2,7,19],[0,166,394],[1,0,7],[2,11,22],[2,80,90],[2,27,39],[2,28,39]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const tonemapACES = getSymbol("tonemapACES");
