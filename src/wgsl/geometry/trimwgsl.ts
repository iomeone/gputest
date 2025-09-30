/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getLineDetail getAnchorStart getAnchorEnd getLineTrim symbols visibles symbol flags name i32 type optional link attr func externals vec4<u32> export index u32 parameters identifiers exports linkable optional return".split(' '));
const t = {[_(4)]:_([0,1,2,3]),[_(5)]:_([3]),[_(15)]:[{"at":91,[_(6)]:_(0),[_(7)]:6,[_(14)]:{[_(8)]:_(0),[_(10)]:_(9),[_(13)]:_([11,12])}},{"at":158,[_(6)]:_(1),[_(7)]:6,[_(14)]:{[_(8)]:_(1),[_(10)]:_(9),[_(13)]:_([11,12])}},{"at":227,[_(6)]:_(2),[_(7)]:6,[_(14)]:{[_(8)]:_(2),[_(10)]:_(9),[_(13)]:_([11,12])}}],[_(22)]:[{"at":294,[_(6)]:_(3),[_(7)]:1,[_(14)]:{[_(8)]:_(3),[_(10)]:_(16),[_(13)]:_([17]),[_(20)]:[{[_(8)]:_(18),[_(10)]:_(19)}],[_(21)]:_([1,2,0])}}],[_(23)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  "name": "geometry/trim",
  "code": _(["// trim\r\n//\r\n// o--o--o  o--o--o--o\r\n//\r\n// 0  0  0  3  3  3  3\r\n// 2  2  2  6  6  6  6\r\n\r\n@",11," @",12," fn ",0,"() -> i32 { ",25," LINE_DETAIL; }\r\n@",11," @",12," fn ",1,"() -> i32 { ",25," ANCHOR_START; }\r\n@",11," @",12," fn ",2,"() -> i32 { ",25," ANCHOR_END; }\r\n\r\n@",17," fn ",3,"(",18,": u32) -> ",16," {\r\n  let s = ",1,"();\r\n  let e = ",2,"();\r\n\r\n  let n = u32(",0,"() + 1);\r\n\r\n  let i = ",18," / n;\r\n  let d = ",18," % n;\r\n\r\n  let start = i * n;\r\n  let end = start + n - 1u;\r\n\r\n  var bits = 0u;\r\n  if (s != 0) { bits += 1u; }\r\n  if (e != 0) { bits += 2u; }\r\n\r\n  ",25," ",16,"(start, end, bits, 0u);\r\n};"]).join(''),
  "hash": 8526153744205008,
  "table": t,
  "shake": [[91,[0,3]],[158,[1,3]],[227,[2,3]],[294,[3]]],
  "tree": decompressAST([[4,91,156,0],[1,0,9],[1,10,15],[2,9,22],[4,48,115,1],[1,0,9],[1,10,15],[2,9,23],[4,50,113,2],[1,0,9],[1,10,15],[2,9,21],[0,48,421],[1,0,7],[2,11,22],[2,50,64],[2,29,41],[2,33,46]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getLineTrim = getSymbol("getLineTrim");
