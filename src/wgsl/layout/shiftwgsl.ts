/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getOffset getShiftedRectangle symbols visibles symbol flags name vec2<f32> type link attr func externals vec4<f32> export rectangle parameters identifiers exports linkable rectangle offset".split(' '));
const t = {[_(2)]:_([0,1]),[_(3)]:_([1]),[_(12)]:[{"at":0,[_(4)]:_(0),[_(5)]:2,[_(11)]:{[_(6)]:_(0),[_(8)]:_(7),[_(10)]:_([9])}}],[_(18)]:[{"at":38,[_(4)]:_(1),[_(5)]:1,[_(11)]:{[_(6)]:_(1),[_(8)]:_(13),[_(10)]:_([14]),[_(16)]:[{[_(6)]:_(15),[_(8)]:_(13)}],[_(17)]:_([0])}}],[_(19)]:{[_(0)]:true}};
const data = {
  "name": "layout/shift",
  "code": _(["@",9," fn ",0,"() -> ",7,";\r\n\r\n@",14," fn ",1,"(",15,": ",13,") -> ",13," {\r\n  let ",21," = ",0,"();\r\n  return ",13,"(",15,".xy + ",21,", ",15,".zw + ",21,");\r\n}"]).join(''),
  "hash": 5062196642758524,
  "table": t,
  "shake": [[0,[0,1]],[38,[1]]],
  "tree": decompressAST([[1,0,33],[0,38,204],[1,0,7],[2,11,30],[2,73,82]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getShiftedRectangle = getSymbol("getShiftedRectangle");
