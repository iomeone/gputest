/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getFaceDetail getFaceSegment i32 optional link export index u32 return".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[X]:[{[A]:149,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:_(2),[Z]:_([3,4])}}],[E]:[{[A]:216,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(2),[Z]:_([5]),[P]:[{[N]:_(6),[T]:_(7)}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "geometry/face.wgsl",
  code: _(["// segments\r\n//\r\n// .-----.\r\n// |     |\r\n// .--.--.\r\n//\r\n// 1 2 3 0 0\r\n//\r\n// triangles:\r\n// [0 1 2]\r\n// [0 2 3]\r\n// [0 3 4]\r\n\r\n// detail 1 = 1 tri\r\n@",3," @",4," fn ",0,"() -> i32 { ",8," FACE_DETAIL; }\r\n@",5," fn ",1,"(",6,": u32) -> i32 {\r\n  let n = u32(",0,"() + 2);\r\n  let i = ",6," % n;\r\n  if (i + 2u >= n) { ",8," 0; }\r\n  ",8," i + 1;\r\n};\n"]).join(''),
  hash: 0x155488252144e8,
  table,
  shake: [[149,[0,1]],[216,[1]]],
  tree: decompressAST([[4,149,214,0],[1,0,9],[1,10,15],[2,9,22],[0,48,207],[1,0,7],[2,11,25],[2,51,64]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getFaceSegment = getSymbol("getFaceSegment");
