/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/typeswgsl";
import m1 from "../../../wgsl/use/viewwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("solidToShaded ../../../wgsl/use/types SolidVertex ShadedVertex ../../../wgsl/use/view clipToWorld3D export ShadedVertex".split(' '));
const table = {[S]:_([0]),[W]:_([0]),[O]:[{[A]:0,[N]:_(1),[S]:_([2,3]),[K]:[{[N]:_(2),[J]:_(2)},{[N]:_(3),[J]:_(3)}]},{[A]:0,[N]:_(4),[S]:_([5]),[K]:[{[N]:_(5),[J]:_(5)}]}],[E]:[{[A]:115,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:_(3),[Z]:_([6]),[P]:[{[N]:"v",[T]:_(2)}]}}]};
const data = {
  name: "surface/solid-to-shaded.wgsl",
  code: _(["use '",1,"'::{ ",2,", ",3," };\r\nuse '",4,"'::{ ",5," };\r\n\r\n@",6," fn ",0,"(v: ",2,") -> ",3," {\r\n  let world = ",5,"(v.position);\r\n  return ",3,"(\r\n    v.position,\r\n    ",C,"(world, 1.0),\r\n    ",C,"(0.0, 0.0, 1.0, 0.0),\r\n    ",C,"(1.0, 0.0, 0.0, 0.0),\r\n    v.color,\r\n    v.uv,\r\n    v.st,\r\n    v.scissor,\r\n    v.index,\r\n  );\r\n};\n"]).join(''),
  hash: 0x7f99b966e5c56,
  table,
  shake: [[115,[0]]],
  tree: decompressAST([[1,0,60],[1,63,110],[0,52,368],[1,0,7],[2,11,24],[2,17,28],[2,16,28],[2,30,43],[2,37,49]], table[S]),
};

const libs = {"../../../wgsl/use/types": m0, "../../../wgsl/use/view": m1};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const solidToShaded = getSymbol("solidToShaded");
