/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/viewwgsl";
import m1 from "../../../wgsl/use/typeswgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSolidFragment ../../../wgsl/use/view getViewPosition ../../../wgsl/use/types SurfaceFragment export surface surface".split(' '));
const table = {[S]:_([0]),[W]:_([0]),[O]:[{[A]:0,[N]:_(1),[S]:_([2]),[K]:[{[N]:_(2),[J]:_(2)}]},{[A]:0,[N]:_(3),[S]:_([4]),[K]:[{[N]:_(4),[J]:_(4)}]}],[E]:[{[A]:107,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:C,[Z]:_([5]),[P]:[{[N]:_(6),[T]:_(4)}]}}]};
const data = {
  name: "fragment/solid.wgsl",
  code: _(["use '",1,"'::{ ",2," };\r\nuse '",3,"'::{ ",4," };\r\n\r\n@",5," fn ",0,"(\r\n  ",6,": ",4,",\r\n) -> ",C," {\r\n  let rgb = ",6,".albedo.rgb + ",6,".emissive.rgb;\r\n  let a = ",6,".albedo.a;\r\n  if (HAS_ALPHA_TO_COVERAGE) {\r\n    return ",C,"(rgb, a);\r\n  }\r\n  else {\r\n    return ",C,"(rgb * a, a);\r\n  }\r\n}\n"]).join(''),
  hash: 0x12c0d846b9624c,
  table,
  shake: [[107,[0]]],
  tree: decompressAST([[1,0,49],[1,52,102],[0,55,336],[1,0,7],[2,11,27],[2,30,45]], table[S]),
};

const libs = {"../../../wgsl/use/view": m0, "../../../wgsl/use/types": m1};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getSolidFragment = getSymbol("getSolidFragment");
