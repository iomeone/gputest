/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/viewwgsl";
import m1 from "../../../wgsl/use/typeswgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSurface applyEnvironment getDeferredEnvironmentFragment ../../../wgsl/use/view getViewPosition ../../../wgsl/use/types Light SurfaceFragment link vec2<f32> surface export coord index u32 SurfaceFragment surface viewPosition".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[O]:[{[A]:0,[N]:_(3),[S]:_([4]),[K]:[{[N]:_(4),[J]:_(4)}]},{[A]:0,[N]:_(5),[S]:_([6,7]),[K]:[{[N]:_(6),[J]:_(6)},{[N]:_(7),[J]:_(7)}]}],[X]:[{[A]:114,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(7),[Z]:_([8]),[P]:[{[N]:"uv",[T]:_(9)}]}},{[A]:172,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:D,[Z]:_([8]),[P]:[{[N]:"N",[T]:D},{[N]:"V",[T]:D},{[N]:_(10),[T]:_(7)}]}}],[E]:[{[A]:308,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:C,[Z]:_([11]),[P]:[{[N]:"uv",[T]:_(9)},{[N]:_(12),[T]:C},{[N]:_(13),[T]:_(14)}],[I]:_([0,1])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "fragment/deferred-environment.wgsl",
  code: _(["use '",3,"'::{ ",4," };\r\nuse '",5,"'::{ ",6,", ",7," };\r\n\r\n@",8," fn ",0,"(uv: ",9,") -> ",7,";\r\n\r\n@",8," fn ",1,"(\r\n  N: ",D,",\r\n  V: ",D,",\r\n  ",10,": ",7,",\r\n) -> ",D," { return ",D,"(0.0); }\r\n\r\n@",11," fn ",2,"(\r\n  uv: ",9,",\r\n  ",12,": ",C,",\r\n  ",13,": u32,\r\n) -> ",C," {\r\n  let ",10," = ",0,"(uv.xy, ",12,");\r\n\r\n  let ",17," = ",4,"();\r\n  let ",10,"Position = ",10,".position.xyz;\r\n  let toView = ",17,".xyz - ",10,"Position * ",17,".w;\r\n\r\n  let N: ",D," = normalize(",10,".normal.xyz);\r\n  let V: ",D," = normalize(toView);\r\n\r\n  let output = ",1,"(N, V, ",10,");\r\n\r\n  return ",C,"(output, 1.0);\r\n}\n"]).join(''),
  hash: 0x1f453f3c937f77,
  table,
  shake: [[114,[0,2]],[172,[1,2]],[308,[2]]],
  tree: decompressAST([[1,0,49],[1,52,109],[1,62,115],[1,58,190],[0,136,638],[1,0,7],[2,11,41],[2,121,131],[2,50,65],[2,249,265]], table[S]),
};

const libs = {"../../../wgsl/use/view": m0, "../../../wgsl/use/types": m1};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getDeferredEnvironmentFragment = getSymbol("getDeferredEnvironmentFragment");
