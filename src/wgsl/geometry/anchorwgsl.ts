/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getLineDetail getAnchorStart getAnchorEnd getLineAnchor i32 optional link vec4<u32> export index u32 optional return hasBoth".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([3]),[X]:[{[A]:109,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:_(4),[Z]:_([5,6])}},{[A]:183,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:_(4),[Z]:_([5,6])}},{[A]:252,[R]:_(2),[G]:6,[F]:{[N]:_(2),[T]:_(4),[Z]:_([5,6])}}],[E]:[{[A]:319,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(7),[Z]:_([8]),[P]:[{[N]:_(9),[T]:_(10)}],[I]:_([1,2,0])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  name: "geometry/anchor.wgsl",
  code: _(["// anchor\r\n//\r\n// o--o--o-- ... --o\r\n// s s+1           e\r\n//\r\n// o-- ... --o--o--o\r\n// s           e-1 e\r\n\r\n@",5," @",6," fn ",0,"() -> i32 { ",12," ANCHOR_LINE_DETAIL; }\r\n@",5," @",6," fn ",1,"() -> i32 { ",12," ANCHOR_START; }\r\n@",5," @",6," fn ",2,"() -> i32 { ",12," ANCHOR_END; }\r\n\r\n@",8," fn ",3,"(",9,": u32) -> ",7," {\r\n  let s = ",1,"();\r\n  let e = ",2,"();\r\n\r\n  let ",13," = s != 0 && e != 0;\r\n\r\n  var i = ",9,";\r\n  var d = 0u;\r\n  if (",13,") {\r\n    i = i >> 1u;\r\n    d = i & 1u;\r\n  }\r\n\r\n  let n = u32(",0,"() + 1);\r\n  let start = n * i;\r\n  let end = start + n - 1u;\r\n\r\n  var both = 0u;\r\n  if (",13,") { both = 1u; }\r\n\r\n  if (s != 0 && (e == 0 || d == 0u)) {\r\n    ",12," ",7,"(start, start + 1u, end, both);\r\n  }\r\n  if (e != 0 && (s == 0 || d == 1u)) {\r\n    ",12," ",7,"(end, end - 1u, start, both);\r\n  }\r\n\r\n  ",12," ",7,"(0u, 0u, 0u, 0u);\r\n};\n"]).join(''),
  hash: 0x15e6dc6046a087,
  table,
  shake: [[109,[0,3]],[183,[1,3]],[252,[2,3]],[319,[3]]],
  tree: decompressAST([[4,109,181,0],[1,0,9],[1,10,15],[2,9,22],[4,55,122,1],[1,0,9],[1,10,15],[2,9,23],[4,50,113,2],[1,0,9],[1,10,15],[2,9,21],[0,48,664],[1,0,7],[2,11,24],[2,52,66],[2,29,41],[2,163,176]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getLineAnchor = getSymbol("getLineAnchor");
