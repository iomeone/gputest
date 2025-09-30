/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getStripIndex getStripUV symbols visibles symbol flags name vec2<u32> type export attr vertex u32 parameters func vec2<f32> identifiers exports vertex".split(' '));
const t = {[_(2)]:_([0,1]),[_(3)]:_([0,1]),[_(17)]:[{"at":0,[_(4)]:_(0),[_(5)]:1,[_(14)]:{[_(6)]:_(0),[_(8)]:_(7),[_(10)]:_([9]),[_(13)]:[{[_(6)]:_(11),[_(8)]:_(12)}]}},{"at":135,[_(4)]:_(1),[_(5)]:1,[_(14)]:{[_(6)]:_(1),[_(8)]:_(15),[_(10)]:_([9]),[_(13)]:[{[_(6)]:_(11),[_(8)]:_(12)}],[_(16)]:_([0])}}]};
const data = {
  "name": "geometry/strip",
  "code": _(["@",9," fn ",0,"(",11,": u32) -> ",7," {\r\n  var x = ",11," >> 1u;\r\n  var y = ",11," & 1u;\r\n  return ",7,"(x, y);\r\n}\r\n\r\n@",9," fn ",1,"(",11,": u32) -> ",15," {\r\n  return ",15,"(",0,"(",11,"));\r\n}"]).join(''),
  "hash": 3094383181996306,
  "table": t,
  "shake": [[0,[0,1]],[135,[1]]],
  "tree": decompressAST([[0,0,131],[1,0,7],[2,11,24],[0,124,220],[1,0,7],[2,11,21],[2,59,72]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getStripIndex = getSymbol("getStripIndex");
export const getStripUV = getSymbol("getStripUV");
