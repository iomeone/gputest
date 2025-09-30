/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/viewwgsl";
import m1 from "../../../wgsl/use/typeswgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("applyLights applyEnvironment getLitFragment ../../../wgsl/use/view getViewPosition ../../../wgsl/use/types SurfaceFragment optional link surface export SurfaceFragment surface return viewPosition".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[O]:[{[A]:0,[N]:_(3),[S]:_([4]),[K]:[{[N]:_(4),[J]:_(4)}]},{[A]:0,[N]:_(5),[S]:_([6]),[K]:[{[N]:_(6),[J]:_(6)}]}],[X]:[{[A]:107,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:D,[Z]:_([7,8]),[P]:[{[N]:"N",[T]:D},{[N]:"V",[T]:D},{[N]:_(9),[T]:_(6)}]}},{[A]:248,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:D,[Z]:_([7,8]),[P]:[{[N]:"N",[T]:D},{[N]:"V",[T]:D},{[N]:_(9),[T]:_(6)}]}}],[E]:[{[A]:394,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:C,[Z]:_([10]),[P]:[{[N]:_(9),[T]:_(6)}],[I]:_([0,1])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "fragment/lit.wgsl",
  code: _(["use '",3,"'::{ ",4," };\r\nuse '",5,"'::{ ",6," };\r\n\r\n@",7," @",8," fn ",0,"(\r\n  N: ",D,",\r\n  V: ",D,",\r\n  ",9,": ",6,",\r\n) -> ",D," { ",13," ",D,"(0.0); }\r\n\r\n@",7," @",8," fn ",1,"(\r\n  N: ",D,",\r\n  V: ",D,",\r\n  ",9,": ",6,",\r\n) -> ",D," { ",13," ",D,"(0.0); }\r\n\r\n@",10," fn ",2,"(\r\n  ",9,": ",6,",\r\n) -> ",C," {\r\n  let ",14," = ",4,"();\r\n  let ",9,"Position = ",9,".position.xyz;\r\n  let toView = ",14,".xyz - ",9,"Position * ",14,".w;\r\n\r\n  let N: ",D," = normalize(",9,".normal.xyz);\r\n  let V: ",D," = normalize(toView);\r\n\r\n  let light = ",9,".emissive.xyz + ",0,"(N, V, ",9,") + ",1,"(N, V, ",9,");\r\n  let alpha = ",9,".albedo.a;\r\n\r\n  if (HAS_ALPHA_TO_COVERAGE) {\r\n    ",13," ",C,"(light, alpha);\r\n  }\r\n  else {\r\n    ",13," ",C,"(light * alpha, alpha);\r\n  }\r\n}\n"]).join(''),
  hash: 0x1e9833cd4b3bd4,
  table,
  shake: [[107,[0,2]],[248,[1,2]],[394,[2]]],
  tree: decompressAST([[1,0,49],[1,52,102],[4,55,192,0],[1,0,9],[1,10,15],[2,9,20],[2,59,74],[4,63,205,1],[1,0,9],[1,10,15],[2,9,25],[2,64,79],[0,63,663],[1,0,7],[2,11,25],[2,28,43],[2,57,72],[2,271,282],[2,29,45]], table[S]),
};

const libs = {"../../../wgsl/use/view": m0, "../../../wgsl/use/types": m1};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getLitFragment = getSymbol("getLitFragment");
