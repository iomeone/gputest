/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getLineDetail getAnchorStart getAnchorEnd getLineAnchor symbols visibles symbol flags name i32 type optional link attr func externals vec4<u32> export index u32 parameters identifiers exports linkable optional return hasBoth".split(' '));
const t = {[_(4)]:_([0,1,2,3]),[_(5)]:_([3]),[_(15)]:[{"at":109,[_(6)]:_(0),[_(7)]:6,[_(14)]:{[_(8)]:_(0),[_(10)]:_(9),[_(13)]:_([11,12])}},{"at":176,[_(6)]:_(1),[_(7)]:6,[_(14)]:{[_(8)]:_(1),[_(10)]:_(9),[_(13)]:_([11,12])}},{"at":245,[_(6)]:_(2),[_(7)]:6,[_(14)]:{[_(8)]:_(2),[_(10)]:_(9),[_(13)]:_([11,12])}}],[_(22)]:[{"at":312,[_(6)]:_(3),[_(7)]:1,[_(14)]:{[_(8)]:_(3),[_(10)]:_(16),[_(13)]:_([17]),[_(20)]:[{[_(8)]:_(18),[_(10)]:_(19)}],[_(21)]:_([1,2,0])}}],[_(23)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  "name": "geometry/anchor",
  "code": _(["// anchor\r\n//\r\n// o--o--o-- ... --o\r\n// s s+1           e\r\n//\r\n// o-- ... --o--o--o\r\n// s           e-1 e\r\n\r\n@",11," @",12," fn ",0,"() -> i32 { ",25," LINE_DETAIL; }\r\n@",11," @",12," fn ",1,"() -> i32 { ",25," ANCHOR_START; }\r\n@",11," @",12," fn ",2,"() -> i32 { ",25," ANCHOR_END; }\r\n\r\n@",17," fn ",3,"(",18,": u32) -> ",16," {\r\n  let s = ",1,"();\r\n  let e = ",2,"();\r\n\r\n  let ",26," = s != 0 && e != 0;\r\n\r\n  var i = ",18,";\r\n  var d = 0u;\r\n  if (",26,") {\r\n    i = i >> 1u;\r\n    d = i & 1u;\r\n  }\r\n\r\n  let n = u32(",0,"() + 1);\r\n  let start = n * i;\r\n  let end = start + n - 1u;\r\n\r\n  var both = 0u;\r\n  if (",26,") { both = 1u; }\r\n\r\n  if (s != 0 && (e == 0 || d == 0u)) {\r\n    ",25," ",16,"(start, start + 1u, end, both);\r\n  }\r\n  if (e != 0 && (s == 0 || d == 1u)) {\r\n    ",25," ",16,"(end, end - 1u, start, both);\r\n  }\r\n\r\n  ",25," ",16,"(0u, 0u, 0u, 0u);\r\n};"]).join(''),
  "hash": 7675930999194314,
  "table": t,
  "shake": [[109,[0,3]],[176,[1,3]],[245,[2,3]],[312,[3]]],
  "tree": decompressAST([[4,109,174,0],[1,0,9],[1,10,15],[2,9,22],[4,48,115,1],[1,0,9],[1,10,15],[2,9,23],[4,50,113,2],[1,0,9],[1,10,15],[2,9,21],[0,48,664],[1,0,7],[2,11,24],[2,52,66],[2,29,41],[2,163,176]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getLineAnchor = getSymbol("getLineAnchor");
