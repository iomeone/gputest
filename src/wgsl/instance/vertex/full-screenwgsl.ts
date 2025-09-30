/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
import m0 from "../../../wgsl/use/typeswgsl";
import m1 from "../../../wgsl/geometry/quadwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getFullScreenVertex ../../../wgsl/use/types SolidVertex ../../../wgsl/geometry/quad getQuadUV export vertexIndex u32 instanceIndex SolidVertex".split(' '));
const table = {[S]:_([0]),[W]:_([0]),[O]:[{[A]:0,[N]:_(1),[S]:_([2]),[K]:[{[N]:_(2),[J]:_(2)}]},{[A]:0,[N]:_(3),[S]:_([4]),[K]:[{[N]:_(4),[J]:_(4)}]}],[E]:[{[A]:255,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:_(2),[Z]:_([5]),[P]:[{[N]:_(6),[T]:_(7)},{[N]:_(8),[T]:_(7)}]}}]};
const data = {
  name: "vertex/full-screen.wgsl",
  code: _(["use '",1,"'::{ ",2," };\r\nuse '",3,"'::{ ",4," };\r\n\r\n//  0        1      2\r\n//    +------.------/\r\n//    |      .    /\r\n//    |      .  /\r\n//  1 ......../\r\n//    |     /\r\n//    |   /\r\n//    | /\r\n//  2 /\r\n\r\n@",5," fn ",0,"(",6,": u32, ",8,": u32) -> ",2," {\r\n  var uv = ",4,"(",6,");\r\n  var xy = uv * 2.0 - 1.0;\r\n\r\n  return ",2,"(\r\n    ",C,"(xy.x * 2.0 + 1.0, -(xy.y * 2.0 + 1.0), 0.5, 1.0),\r\n    ",C,"(1.0, 1.0, 1.0, 1.0),\r\n    ",C,"(uv * 2.0, 0.0, 0.0),\r\n    ",C,"(0.0),\r\n    ",C,"(1.0),\r\n    ",8,",\r\n  );\r\n}\n"]).join(''),
  hash: 0x21b557dfd5963,
  table,
  shake: [[255,[0]]],
  tree: decompressAST([[1,0,46],[1,49,97],[0,206,588],[1,0,7],[2,11,30],[2,61,72],[2,26,35],[2,64,75]], table[S]),
};

const libs = {"../../../wgsl/use/types": m0, "../../../wgsl/geometry/quad": m1};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getFullScreenVertex = getSymbol("getFullScreenVertex");
