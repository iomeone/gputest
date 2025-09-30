/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/typeswgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getMaterial getSolidSurface ../../../wgsl/use/types SurfaceFragment link color mapUV mapST export normal tangent position coord SurfaceFragment normal albedo".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[O]:[{[A]:0,[N]:_(2),[S]:_([3]),[K]:[{[N]:_(3),[J]:_(3)}]}],[X]:[{[A]:55,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:C,[Z]:_([4]),[P]:[{[N]:_(5),[T]:C},{[N]:_(6),[T]:C},{[N]:_(7),[T]:C}]}}],[E]:[{[A]:162,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(3),[Z]:_([8]),[P]:[{[N]:_(5),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C},{[N]:_(9),[T]:C},{[N]:_(10),[T]:C},{[N]:_(11),[T]:C},{[N]:_(12),[T]:C}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "surface/solid-surface.wgsl",
  code: _(["use '",2,"'::{ ",3," };\r\n\r\n@",4," fn ",0,"(\r\n  ",5,": ",C,",\r\n  ",6,": ",C,",\r\n  ",7,": ",C,",\r\n) -> ",C," {}\r\n\r\n@",8," fn ",1,"(\r\n  ",5,": ",C,",\r\n  uv: ",C,",\r\n  st: ",C,",\r\n  ",9,": ",C,",\r\n  ",10,": ",C,",\r\n  ",11,": ",C,",\r\n  ",12,": ",C,",\r\n) -> ",3," {\r\n\r\n  let ",15," = ",0,"(",5,", uv, st);\r\n\r\n  return ",3,"(\r\n    ",11,",\r\n    ",9,",\r\n    ",C,"(",9,".xyz, 1.0),\r\n    ",C,"(0.0, 0.0, 0.0, ",15,".a),\r\n    ",C,"(",15,".rgb, 0.0),\r\n    ",C,"(0.0, 0.0, 0.0, 1.0),\r\n    0.0,\r\n  );\r\n}\n"]).join(''),
  hash: 0x8e06e065e5d84,
  table,
  shake: [[55,[0,1]],[162,[1]]],
  tree: decompressAST([[1,0,50],[1,55,158],[0,107,570],[1,0,7],[2,11,26],[2,170,185],[2,36,47],[2,40,55]], table[S]),
};

const libs = {"../../../wgsl/use/types": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getSolidSurface = getSymbol("getSolidSurface");
