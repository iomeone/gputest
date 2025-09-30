/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getLineDetail getLineSegment i32 optional link export index u32 return".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[X]:[{[A]:79,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:_(2),[Z]:_([3,4])}}],[E]:[{[A]:154,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(2),[Z]:_([5]),[P]:[{[N]:_(6),[T]:_(7)}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "geometry/segment.wgsl",
  code: _(["// segments\r\n//\r\n// o--o--o  o--o--o--o  o--o\r\n// 1  3  2  1  3  3  2  1  2\r\n\r\n@",3," @",4," fn ",0,"() -> i32 { ",8," SEGMENT_LINE_DETAIL; }\r\n@",5," fn ",1,"(",6,": u32) -> i32 {\r\n  let n = u32(",0,"() + 1);\r\n  let i = ",6," % n;\r\n  if (i == 0u) { ",8," 1; }\r\n  if (i == n - 1u) { ",8," 2; }\r\n  ",8," 3;\r\n};\n"]).join(''),
  hash: 0x2a8f49279a449,
  table,
  shake: [[79,[0,1]],[154,[1]]],
  tree: decompressAST([[4,79,152,0],[1,0,9],[1,10,15],[2,9,22],[0,56,241],[1,0,7],[2,11,25],[2,51,64]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getLineSegment = getSymbol("getLineSegment");
