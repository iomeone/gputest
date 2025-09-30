/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("loopSurface vec3<u32> export index size offset vec2<i32> offset".split(' '));
const table = {[S]:_([0]),[W]:_([0]),[E]:[{[A]:0,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:_(1),[Z]:_([2]),[P]:[{[N]:_(3),[T]:_(1)},{[N]:_(4),[T]:_(1)},{[N]:_(5),[T]:_(6)}]}}]};
const data = {
  name: "plot/loop.wgsl",
  code: _(["@",2," fn ",0,"(",3,": ",1,", ",4,": ",1,", ",5,": ",6,") -> ",1," {\r\n  var sx = i32(",3,".x) + ",5,".x;\r\n  if (LOOP_X) {\r\n    if (sx < 0) { sx = sx + i32(",4,".x); }\r\n    if (sx >= i32(",4,".x)) { sx = sx - i32(",4,".x); }\r\n  }\r\n  else {\r\n    if (sx < 0) { sx = 0; }\r\n    if (sx >= i32(",4,".x)) { sx = i32(",4,".x) - 1; }\r\n  }\r\n\r\n  var sy = i32(",3,".y) + ",5,".y;\r\n  if (LOOP_Y) {\r\n    if (sy < 0) { sy = sy + i32(",4,".y); }\r\n    if (sy >= i32(",4,".y)) { sy = sy - i32(",4,".y); }\r\n  }\r\n  else {\r\n    if (sy < 0) { sy = 0; }\r\n    if (sy >= i32(",4,".y)) { sy = i32(",4,".y) - 1; }\r\n  }\r\n\r\n  return ",1,"(u32(sx), u32(sy), ",3,".z);\r\n}\n"]).join(''),
  hash: 0x1b8f92f2a37347,
  table,
  shake: [[0,[0]]],
  tree: decompressAST([[0,0,658],[1,0,7],[2,11,22]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const loopSurface = getSymbol("loopSurface");
