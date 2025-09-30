/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/geometry/normalwgsl";
const {} = symbolDictionary;
const _ = decompressString("transformPosition getEpsilon getEpsilonDifferential symbols visibles ../../wgsl/geometry/normal name getOrthoVector imported imports modules symbol flags vec4<f32> type link attr position parameters func f32 optional externals export vector origin contravariant bool identifiers exports linkable transformPosition return vector origin".split(' '));
const t = {[_(3)]:_([0,1,2]),[_(4)]:_([2]),[_(10)]:[{"at":0,[_(6)]:_(5),[_(3)]:_([7]),[_(9)]:[{[_(6)]:_(7),[_(8)]:_(7)}]}],[_(22)]:[{"at":57,[_(11)]:_(0),[_(12)]:2,[_(19)]:{[_(6)]:_(0),[_(14)]:_(13),[_(16)]:_([15]),[_(18)]:[{[_(6)]:_(17),[_(14)]:_(13)}]}},{"at":120,[_(11)]:_(1),[_(12)]:6,[_(19)]:{[_(6)]:_(1),[_(14)]:_(20),[_(16)]:_([21,15])}}],[_(29)]:[{"at":181,[_(11)]:_(2),[_(12)]:1,[_(19)]:{[_(6)]:_(2),[_(14)]:_(13),[_(16)]:_([23]),[_(18)]:[{[_(6)]:_(24),[_(14)]:_(13)},{[_(6)]:_(25),[_(14)]:_(13)},{[_(6)]:_(26),[_(14)]:_(27)}],[_(28)]:_([1,0])}}],[_(30)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "transform/diff-epsilon",
  "code": _(["use '",5,"'::{ ",7," };\r\n\r\n@",15," fn ",0,"(",17,": ",13,") -> ",13,";\r\n@",21," @",15," fn ",1,"() -> f32 { ",32," 0.001; };\r\n\r\n@",23," fn ",1,"Differential(",24,": ",13,", ",25,": ",13,", ",26,": ",27,") -> ",13," {\r\n  let e = ",1,"();\r\n\r\n  if (",26,") {\r\n    let nt = ",7,"(",24,".xyz);\r\n    let nb = cross(",24,".xyz, nt);\r\n\r\n    let a = ",0,"(",25,").xyz;\r\n    let b = ",0,"(",25," + ",13,"(nt.xyz * e, 0.0)).xyz;\r\n    let c = ",0,"(",25," + ",13,"(nb.xyz * e, 0.0)).xyz;\r\n\r\n    let n = cross(b - a, c - a);\r\n    ",32," ",13,"(normalize(n), ",24,".w);\r\n  }\r\n\r\n  let a = ",0,"(",25,").xyz;\r\n  let b = ",0,"(",25," + ",13,"(",24,".xyz * e, 0.0)).xyz;\r\n\r\n  ",32," ",13,"((b - a) / e, ",24,".w);\r\n}"]).join(''),
  "hash": 7318163301710923,
  "table": t,
  "shake": [[57,[0,2]],[120,[1,2]],[181,[2]]],
  "tree": decompressAST([[1,0,52],[1,57,117],[4,63,119,1],[1,0,9],[1,10,15],[2,9,19],[0,42,727],[1,0,7],[2,11,33],[2,108,118],[2,54,68],[2,80,97],[2,44,61],[2,73,90],[2,161,178],[2,42,59]], t[S]),
};
const libs = {"../../wgsl/geometry/normal": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getEpsilonDifferential = getSymbol("getEpsilonDifferential");
