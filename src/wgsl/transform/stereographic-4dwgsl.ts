/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getTransformMatrix getStereographicBend getStereographicNormalize getStereographic4DPosition symbols visibles symbol flags name mat4x4<f32> type link attr func f32 optional externals vec4<f32> export position parameters identifiers exports linkable return position stereoBend matrix".split(' '));
const t = {[_(4)]:_([0,1,2,3]),[_(5)]:_([3]),[_(16)]:[{"at":0,[_(6)]:_(0),[_(7)]:2,[_(13)]:{[_(8)]:_(0),[_(10)]:_(9),[_(12)]:_([11])}},{"at":49,[_(6)]:_(1),[_(7)]:6,[_(13)]:{[_(8)]:_(1),[_(10)]:_(14),[_(12)]:_([15,11])}},{"at":116,[_(6)]:_(2),[_(7)]:6,[_(13)]:{[_(8)]:_(2),[_(10)]:_(14),[_(12)]:_([15,11])}}],[_(22)]:[{"at":190,[_(6)]:_(3),[_(7)]:1,[_(13)]:{[_(8)]:_(3),[_(10)]:_(17),[_(12)]:_([18]),[_(20)]:[{[_(8)]:_(19),[_(10)]:_(17)}],[_(21)]:_([1,2,0])}}],[_(23)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  "name": "transform/stereographic-4d",
  "code": _(["@",11," fn ",0,"() -> ",9,";\r\n\r\n@",15," @",11," fn ",1,"() -> f32 { ",24," 0.0; };\r\n@",15," @",11," fn ",2,"() -> f32 { ",24," 1.0; };\r\n\r\n@",18," fn ",3,"(",19,": ",17,") -> ",17," {\r\n  let ",26," = ",1,"();\r\n  let stereoNormalize = ",2,"();\r\n\r\n  let ",27," = ",0,"();\r\n\r\n  if (",26," > 0.0001) {\r\n    if (",19,".w == -1.0) {\r\n      ",24," ",17,"(0.0);\r\n    }\r\n\r\n    let pos = ",19,";\r\n    let r = mix(1.0, length(pos), stereoNormalize);\r\n\r\n    let w = (pos.w + r);\r\n    let iw = 1.0/w;\r\n    let proj = pos.xyz * iw;\r\n\r\n    var f = ",26,";\r\n    let out = mix(pos.xyz, proj, f);\r\n\r\n    ",24," ",27," * ",17,"(out.xyz, 1.0);\r\n  }\r\n\r\n  ",24," ",27," * ",17,"(",19,".xyz, 1.0);\r\n}"]).join(''),
  "hash": 2680698260771533,
  "table": t,
  "shake": [[0,[0,3]],[49,[1,3]],[116,[2,3]],[190,[3]]],
  "tree": decompressAST([[1,0,44],[4,49,113,1],[1,0,9],[1,10,15],[2,9,29],[4,48,117,2],[1,0,9],[1,10,15],[2,9,34],[0,55,697],[1,0,7],[2,11,37],[2,83,103],[2,49,74],[2,47,65]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getStereographic4DPosition = getSymbol("getStereographic4DPosition");
