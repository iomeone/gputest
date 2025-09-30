/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getQuadIndex getQuadUV symbols visibles symbol flags name vec2<u32> type export attr vertex u32 parameters func vec2<f32> identifiers exports vertex".split(' '));
const t = {[_(2)]:_([0,1]),[_(3)]:_([0,1]),[_(17)]:[{"at":0,[_(4)]:_(0),[_(5)]:1,[_(14)]:{[_(6)]:_(0),[_(8)]:_(7),[_(10)]:_([9]),[_(13)]:[{[_(6)]:_(11),[_(8)]:_(12)}]}},{"at":113,[_(4)]:_(1),[_(5)]:1,[_(14)]:{[_(6)]:_(1),[_(8)]:_(15),[_(10)]:_([9]),[_(13)]:[{[_(6)]:_(11),[_(8)]:_(12)}],[_(16)]:_([0])}}]};
const data = {
  "name": "geometry/quad",
  "code": _(["@",9," fn ",0,"(",11,": u32) -> ",7," {\r\n  return ",7,"(",11," & 1u, (",11," & 2u) >> 1u);\r\n}\r\n\r\n@",9," fn ",1,"(",11,": u32) -> ",15," {\r\n  return ",15,"(",0,"(",11,"));\r\n}"]).join(''),
  "hash": 688258459664733,
  "table": t,
  "shake": [[0,[0,1]],[113,[1]]],
  "tree": decompressAST([[0,0,109],[1,0,7],[2,11,23],[0,102,196],[1,0,7],[2,11,20],[2,58,70]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getQuadIndex = getSymbol("getQuadIndex");
export const getQuadUV = getSymbol("getQuadUV");
