/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getFaceDetail getFaceSegment symbols visibles symbol flags name i32 type optional link attr func externals export index u32 parameters identifiers exports linkable return".split(' '));
const t = {[_(2)]:_([0,1]),[_(3)]:_([1]),[_(13)]:[{"at":149,[_(4)]:_(0),[_(5)]:6,[_(12)]:{[_(6)]:_(0),[_(8)]:_(7),[_(11)]:_([9,10])}}],[_(19)]:[{"at":216,[_(4)]:_(1),[_(5)]:1,[_(12)]:{[_(6)]:_(1),[_(8)]:_(7),[_(11)]:_([14]),[_(17)]:[{[_(6)]:_(15),[_(8)]:_(16)}],[_(18)]:_([0])}}],[_(20)]:{[_(0)]:true}};
const data = {
  "name": "geometry/face",
  "code": _(["// segments\r\n//\r\n// .-----.\r\n// |     |\r\n// .--.--.\r\n//\r\n// 1 2 3 0 0\r\n//\r\n// triangles:\r\n// [0 1 2]\r\n// [0 2 3]\r\n// [0 3 4]\r\n\r\n// detail 1 = 1 tri\r\n@",9," @",10," fn ",0,"() -> i32 { ",21," FACE_DETAIL; }\r\n@",14," fn ",1,"(",15,": u32) -> i32 {\r\n  let n = u32(",0,"() + 2);\r\n  let i = ",15," % n;\r\n  if (i + 2u >= n) { ",21," 0; }\r\n  ",21," i + 1;\r\n};"]).join(''),
  "hash": 3003416070599884,
  "table": t,
  "shake": [[149,[0,1]],[216,[1]]],
  "tree": decompressAST([[4,149,214,0],[1,0,9],[1,10,15],[2,9,22],[0,48,207],[1,0,7],[2,11,25],[2,51,64]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getFaceSegment = getSymbol("getFaceSegment");
