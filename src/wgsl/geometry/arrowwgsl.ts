/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/use/viewwgsl";
const {} = symbolDictionary;
const _ = decompressString("ARROW_ASPECT sqr getArrowSize getArrowCorrection symbols visibles ../../wgsl/use/view name getWorldScale getViewScale imported imports modules symbol flags f32 type export attr maxLength width size both i32 depth parameters identifiers func exports return targetSize maxSize finalSize".split(' '));
const t = {[_(4)]:_([0,1,2,3]),[_(5)]:_([2,3]),[_(12)]:[{"at":0,[_(7)]:_(6),[_(4)]:_([8,9]),[_(11)]:[{[_(7)]:_(8),[_(10)]:_(8)},{[_(7)]:_(9),[_(10)]:_(9)}]}],[_(28)]:[{"at":141,[_(13)]:_(2),[_(14)]:1,[_(27)]:{[_(7)]:_(2),[_(16)]:_(15),[_(18)]:_([17]),[_(25)]:[{[_(7)]:_(19),[_(16)]:_(15)},{[_(7)]:_(20),[_(16)]:_(15)},{[_(7)]:_(21),[_(16)]:_(15)},{[_(7)]:_(22),[_(16)]:_(23)},{[_(7)]:"w",[_(16)]:_(15)},{[_(7)]:_(24),[_(16)]:_(15)}],[_(26)]:_([0,1])}},{"at":666,[_(13)]:_(3),[_(14)]:1,[_(27)]:{[_(7)]:_(3),[_(16)]:_(15),[_(18)]:_([17]),[_(25)]:[{[_(7)]:"w1",[_(16)]:_(15)},{[_(7)]:"w2",[_(16)]:_(15)},{[_(7)]:_(24),[_(16)]:_(15)}]}}]};
const data = {
  "name": "geometry/arrow",
  "code": _(["use '",6,"'::{ ",8,", ",9," };\r\n\r\nconst ",0,": f32 = 2.5;\r\n\r\nfn sqr(f: f32) -> f32 { ",29," f * f; };\r\n\r\n@",17," fn ",2,"(",19,": f32, ",20,": f32, ",21,": f32, ",22,": i32, w: f32, ",24,": f32) -> f32 {\r\n  if (w <= 0.0) { ",29," 0.0; }\r\n\r\n  let worldScale = ",8,"(w, ",24,") * ",9,"();\r\n\r\n  let ",30," = ",21," * ",20," * worldScale * 0.5;\r\n  var ",31," = ",19," / ",0,";\r\n  if (",22," > 0) { ",31," = ",31," * 0.5; }\r\n\r\n  let ratio = ",31," / ",30,";\r\n  var ",32," = ",30,";\r\n  if (ratio < 2.0) { ",32," = ",30," * (1.0 - sqr(1.0 - ratio * 0.5)); }\r\n\r\n  ",29," ",32,";\r\n};\r\n\r\n@",17," fn ",3,"(w1: f32, w2: f32, ",24,": f32) -> f32 {\r\n  ",29," mix(w1 / w2, 1.0, ",24,");\r\n};"]).join(''),
  "hash": 7905816878872677,
  "table": t,
  "shake": [[59,[0,2]],[93,[1,2]],[141,[2]],[666,[3]]],
  "tree": decompressAST([[1,0,58],[0,59,93],[2,10,22],[0,24,67],[2,7,10],[0,41,561],[1,0,7],[2,11,23],[2,147,160],[2,26,38],[2,100,112],[2,184,187],[0,57,164],[1,0,7],[2,11,29]], t[S]),
};
const libs = {"../../wgsl/use/view": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getArrowSize = getSymbol("getArrowSize");
export const getArrowCorrection = getSymbol("getArrowCorrection");
