/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/viewwgsl";
import m1 from "../../../wgsl/use/typeswgsl";
import m2 from "../../../wgsl/geometry/quadwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getFullScreenVertex ../../../wgsl/use/view getViewSize ../../../wgsl/use/types SolidVertex ../../../wgsl/geometry/quad getQuadUV export vertexIndex u32 instanceIndex SolidVertex".split(' '));
const table = {[S]:_([0]),[W]:_([0]),[O]:[{[A]:0,[N]:_(1),[S]:_([2]),[K]:[{[N]:_(2),[J]:_(2)}]},{[A]:0,[N]:_(3),[S]:_([4]),[K]:[{[N]:_(4),[J]:_(4)}]},{[A]:0,[N]:_(5),[S]:_([6]),[K]:[{[N]:_(6),[J]:_(6)}]}],[E]:[{[A]:303,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:_(4),[Z]:_([7]),[P]:[{[N]:_(8),[T]:_(9)},{[N]:_(10),[T]:_(9)}]}}]};
const data = {
  name: "vertex/full-screen-view.wgsl",
  code: _(["use '",1,"'::{ ",2," };\r\nuse '",3,"'::{ ",4," };\r\nuse '",5,"'::{ ",6," };\r\n\r\n//  0        1      2\r\n//    +------.------/\r\n//    |      .    /\r\n//    |      .  /\r\n//  1 ......../\r\n//    |     /\r\n//    |   /\r\n//    | /\r\n//  2 /\r\n\r\n@",7," fn ",0,"(",8,": u32, ",10,": u32) -> ",4," {\r\n  var uv = ",6,"(",8,");\r\n  var xy = uv * 2.0 - 1.0;\r\n\r\n  ",2,"();\r\n\r\n  return ",4,"(\r\n    ",C,"(xy.x * 2.0 + 1.0, -(xy.y * 2.0 + 1.0), 0.5, 1.0),\r\n    ",C,"(1.0, 1.0, 1.0, 1.0),\r\n    ",C,"(uv * 2.0, 0.0, 0.0),\r\n    ",C,"(0.0),\r\n    ",C,"(1.0),\r\n    ",10,",\r\n  );\r\n}\n"]).join(''),
  hash: 0xa66bbaece45fb,
  table,
  shake: [[303,[0]]],
  tree: decompressAST([[1,0,45],[1,48,94],[1,49,97],[0,206,608],[1,0,7],[2,11,30],[2,61,72],[2,26,35],[2,57,68],[2,27,38]], table[S]),
};

const libs = {"../../../wgsl/use/view": m0, "../../../wgsl/use/types": m1, "../../../wgsl/geometry/quad": m2};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getFullScreenVertex = getSymbol("getFullScreenVertex");
