/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getLineDetail getAnchorStart getAnchorEnd getLineTrim i32 optional link vec4<u32> export index u32 optional return".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([3]),[X]:[{[A]:91,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:_(4),[Z]:_([5,6])}},{[A]:158,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:_(4),[Z]:_([5,6])}},{[A]:227,[R]:_(2),[G]:6,[F]:{[N]:_(2),[T]:_(4),[Z]:_([5,6])}}],[E]:[{[A]:294,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(7),[Z]:_([8]),[P]:[{[N]:_(9),[T]:_(10)}],[I]:_([1,2,0])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  name: "geometry/trim.wgsl",
  code: _(["// trim\r\n//\r\n// o--o--o  o--o--o--o\r\n//\r\n// 0  0  0  3  3  3  3\r\n// 2  2  2  6  6  6  6\r\n\r\n@",5," @",6," fn ",0,"() -> i32 { ",12," LINE_DETAIL; }\r\n@",5," @",6," fn ",1,"() -> i32 { ",12," ANCHOR_START; }\r\n@",5," @",6," fn ",2,"() -> i32 { ",12," ANCHOR_END; }\r\n\r\n@",8," fn ",3,"(",9,": u32) -> ",7," {\r\n  let s = ",1,"();\r\n  let e = ",2,"();\r\n\r\n  let n = u32(",0,"() + 1);\r\n\r\n  let i = ",9," / n;\r\n  let d = ",9," % n;\r\n\r\n  let start = i * n;\r\n  let end = start + n - 1u;\r\n\r\n  var bits = 0u;\r\n  if (s != 0) { bits += 1u; }\r\n  if (e != 0) { bits += 2u; }\r\n\r\n  ",12," ",7,"(start, end, bits, 0u);\r\n};\n"]).join(''),
  hash: 0x841092773ce7e,
  table,
  shake: [[91,[0,3]],[158,[1,3]],[227,[2,3]],[294,[3]]],
  tree: decompressAST([[4,91,156,0],[1,0,9],[1,10,15],[2,9,22],[4,48,115,1],[1,0,9],[1,10,15],[2,9,23],[4,50,113,2],[1,0,9],[1,10,15],[2,9,21],[0,48,421],[1,0,7],[2,11,22],[2,50,64],[2,29,41],[2,33,46]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getLineTrim = getSymbol("getLineTrim");
