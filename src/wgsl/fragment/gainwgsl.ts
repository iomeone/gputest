/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getGain gainColor symbols visibles symbol flags name f32 type link attr func externals vec4<f32> export color parameters identifiers exports linkable getGain".split(' '));
const t = {[_(2)]:_([0,1]),[_(3)]:_([1]),[_(12)]:[{"at":0,[_(4)]:_(0),[_(5)]:2,[_(11)]:{[_(6)]:_(0),[_(8)]:_(7),[_(10)]:_([9])}}],[_(18)]:[{"at":30,[_(4)]:_(1),[_(5)]:1,[_(11)]:{[_(6)]:_(1),[_(8)]:_(13),[_(10)]:_([14]),[_(16)]:[{[_(6)]:_(15),[_(8)]:_(13)}],[_(17)]:_([0])}}],[_(19)]:{[_(0)]:true}};
const data = {
  "name": "fragment/gain",
  "code": _(["@",9," fn ",0,"() -> f32;\r\n\r\n@",14," fn ",1,"(",15,": ",13,") -> ",13," {\r\n  var rgb = ",15,".rgb * ",0,"();\r\n  if (IS_OPAQUE) { return ",13,"(rgb, 1.0); }\r\n  else { return ",13,"(rgb * ",0,"(), ",15,".a); }\r\n};"]).join(''),
  "hash": 7134930869767960,
  "table": t,
  "shake": [[0,[0,1]],[30,[1]]],
  "tree": decompressAST([[1,0,25],[0,30,228],[1,0,7],[2,11,20],[2,68,75],[2,94,101]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const gainColor = getSymbol("gainColor");
