/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getLineDetail getLineSegment symbols visibles symbol flags name i32 type optional link attr func externals export index u32 parameters identifiers exports linkable return".split(' '));
const t = {[_(2)]:_([0,1]),[_(3)]:_([1]),[_(13)]:[{"at":79,[_(4)]:_(0),[_(5)]:6,[_(12)]:{[_(6)]:_(0),[_(8)]:_(7),[_(11)]:_([9,10])}}],[_(19)]:[{"at":146,[_(4)]:_(1),[_(5)]:1,[_(12)]:{[_(6)]:_(1),[_(8)]:_(7),[_(11)]:_([14]),[_(17)]:[{[_(6)]:_(15),[_(8)]:_(16)}],[_(18)]:_([0])}}],[_(20)]:{[_(0)]:true}};
const data = {
  "name": "geometry/segment",
  "code": _(["// segments\r\n//\r\n// o--o--o  o--o--o--o  o--o\r\n// 1  3  2  1  3  3  2  1  2\r\n\r\n@",9," @",10," fn ",0,"() -> i32 { ",21," LINE_DETAIL; }\r\n@",14," fn ",1,"(",15,": u32) -> i32 {\r\n  let n = u32(",0,"() + 1);\r\n  let i = ",15," % n;\r\n  if (i == 0u) { ",21," 1; }\r\n  if (i == n - 1u) { ",21," 2; }\r\n  ",21," 3;\r\n};"]).join(''),
  "hash": 1824759111104011,
  "table": t,
  "shake": [[79,[0,1]],[146,[1]]],
  "tree": decompressAST([[4,79,144,0],[1,0,9],[1,10,15],[2,9,22],[0,48,233],[1,0,7],[2,11,25],[2,51,64]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getLineSegment = getSymbol("getLineSegment");
