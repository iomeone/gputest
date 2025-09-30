/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/use/arraywgsl";
const {} = symbolDictionary;
const _ = decompressString("getSize unpackIndex packIndex symbols visibles ../../wgsl/use/array name sizeToModulus4 packIndex4 unpackIndex4 imported imports modules symbol flags vec4<u32> type link attr func externals export u32 parameters identifiers exports linkable sizeToModulus4 getSize modulus".split(' '));
const t = {[_(3)]:_([0,1,2]),[_(4)]:_([1,2]),[_(12)]:[{"at":0,[_(6)]:_(5),[_(3)]:_([7,8,9]),[_(11)]:[{[_(6)]:_(7),[_(10)]:_(7)},{[_(6)]:_(8),[_(10)]:_(8)},{[_(6)]:_(9),[_(10)]:_(9)}]}],[_(20)]:[{"at":76,[_(13)]:_(0),[_(14)]:2,[_(19)]:{[_(6)]:_(0),[_(16)]:_(15),[_(18)]:_([17])}}],[_(25)]:[{"at":115,[_(13)]:_(1),[_(14)]:1,[_(19)]:{[_(6)]:_(1),[_(16)]:_(15),[_(18)]:_([21]),[_(23)]:[{[_(6)]:"i",[_(16)]:_(22)}],[_(24)]:_([0])}},{"at":261,[_(13)]:_(2),[_(14)]:1,[_(19)]:{[_(6)]:_(2),[_(16)]:_(22),[_(18)]:_([21]),[_(23)]:[{[_(6)]:"v",[_(16)]:_(15)}],[_(24)]:_([0])}}],[_(26)]:{[_(0)]:true}};
const data = {
  "name": "plot/array",
  "code": _(["use '",5,"'::{ ",7,", ",2,"4, ",1,"4 }\r\n\r\n@",17," fn ",0,"() -> ",15," {};\r\n\r\n@",21," fn ",1,"(i: u32) -> ",15," {\r\n  let s = ",0,"();\r\n  let ",29," = ",7,"(s);\r\n  return ",1,"4(i, ",29,");\r\n}\r\n\r\n@",21," fn ",2,"(v: ",15,") -> u32 {\r\n  let s = ",0,"();\r\n  let ",29," = ",7,"(s);\r\n  return ",2,"4(v, ",29,");\r\n}"]).join(''),
  "hash": 3209687059792624,
  "table": t,
  "shake": [[76,[0,1,2]],[115,[1]],[261,[2]]],
  "tree": decompressAST([[1,0,72],[1,76,110],[0,39,181],[1,0,7],[2,11,22],[2,46,53],[2,28,42],[2,29,41],[0,32,170],[1,0,7],[2,11,20],[2,44,51],[2,28,42],[2,29,39]], t[S]),
};
const libs = {"../../wgsl/use/array": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const unpackIndex = getSymbol("unpackIndex");
export const packIndex = getSymbol("packIndex");
