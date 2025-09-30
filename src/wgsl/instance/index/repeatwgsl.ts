/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getInstanceSize getInstanceRepeatIndex symbols visibles symbol flags name u32 type link attr func externals vec2<u32> export vertexIndex instanceIndex parameters identifiers exports linkable instanceIndex elementIndex uniformIndex".split(' '));
const t = {[_(2)]:_([0,1]),[_(3)]:_([1]),[_(12)]:[{"at":0,[_(4)]:_(0),[_(5)]:2,[_(11)]:{[_(6)]:_(0),[_(8)]:_(7),[_(10)]:_([9])}}],[_(19)]:[{"at":41,[_(4)]:_(1),[_(5)]:1,[_(11)]:{[_(6)]:_(1),[_(8)]:_(13),[_(10)]:_([14]),[_(17)]:[{[_(6)]:_(15),[_(8)]:_(7)},{[_(6)]:_(16),[_(8)]:_(7)}],[_(18)]:_([0])}}],[_(20)]:{[_(0)]:true}};
const data = {
  "name": "index/repeat",
  "code": _(["@",9," fn ",0,"() -> u32 {};\r\n\r\n@",14," fn ",1,"(",15,": u32, ",16,": u32) -> ",13," {\r\n  var ",22,": u32;\r\n  var ",23,": u32;\r\n\r\n  let size = ",0,"();\r\n  ",22," = ",16," % size;\r\n  ",23," = ",16," / size;\r\n\r\n  return ",13,"(",22,", ",23,");\r\n};"]).join(''),
  "hash": 5882784987446767,
  "table": t,
  "shake": [[0,[0,1]],[41,[1]]],
  "tree": decompressAST([[1,0,36],[0,41,348],[1,0,7],[2,11,33],[2,144,159]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getInstanceRepeatIndex = getSymbol("getInstanceRepeatIndex");
