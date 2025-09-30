/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
import m0 from "../../../wgsl/use/viewwgsl";
import m1 from "../../../wgsl/use/typeswgsl";
import m2 from "../../../wgsl/codec/octahedralwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSurface getLight applyLight getDeferredLightFragment ../../../wgsl/use/view getViewPosition clipToWorld to3D ../../../wgsl/use/types Light SurfaceFragment ../../../wgsl/codec/octahedral decodeOctahedral link vec2<f32> u32 light surface export coord index SurfaceFragment surface viewPosition".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([3]),[O]:[{[A]:0,[N]:_(4),[S]:_([5,6,7]),[K]:[{[N]:_(5),[J]:_(5)},{[N]:_(6),[J]:_(6)},{[N]:_(7),[J]:_(7)}]},{[A]:0,[N]:_(8),[S]:_([9,10]),[K]:[{[N]:_(9),[J]:_(9)},{[N]:_(10),[J]:_(10)}]},{[A]:0,[N]:_(11),[S]:_([12]),[K]:[{[N]:_(12),[J]:_(12)}]}],[X]:[{[A]:194,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(10),[Z]:_([13]),[P]:[{[N]:"uv",[T]:_(14)}]}},{[A]:252,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:_(9),[Z]:_([13]),[P]:[{[N]:"i",[T]:_(15)}]}},{[A]:289,[R]:_(2),[G]:2,[F]:{[N]:_(2),[T]:D,[Z]:_([13]),[P]:[{[N]:"N",[T]:D},{[N]:"V",[T]:D},{[N]:_(16),[T]:_(9)},{[N]:_(17),[T]:_(10)}]}}],[E]:[{[A]:410,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:C,[Z]:_([18]),[P]:[{[N]:"uv",[T]:_(14)},{[N]:_(19),[T]:C},{[N]:_(20),[T]:_(15)}],[I]:_([0,1,2])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  name: "fragment/deferred-light.wgsl",
  code: _(["use '",4,"'::{ ",5,", ",6,", ",7," };\r\nuse '",8,"'::{ ",9,", ",10," };\r\nuse '",11,"'::{ ",12," };\r\n\r\n@",13," fn ",0,"(uv: ",14,") -> ",10,";\r\n\r\n@",13," fn ",1,"(i: u32) -> ",9,";\r\n@",13," fn ",2,"(\r\n  N: ",D,",\r\n  V: ",D,",\r\n  ",16,": ",9,",\r\n  ",17,": ",10,",\r\n) -> ",D,";\r\n\r\n@",18," fn ",3,"(\r\n  uv: ",14,",\r\n  ",19,": ",C,",\r\n  ",20,": u32,\r\n) -> ",C," {\r\n  let ",17," = ",0,"(uv.xy, ",19,");\r\n\r\n  let ",23," = ",5,"();\r\n  let ",17,"Position = ",17,".position.xyz;\r\n  let toView = ",23,".xyz - ",17,"Position * ",23,".w;\r\n\r\n  let N: ",D," = normalize(",17,".normal.xyz);\r\n  let V: ",D," = normalize(toView);\r\n\r\n  let ",16," = ",1,"(",20,");\r\n  let output = ",2,"(N, V, ",16,", ",17,");\r\n\r\n  return ",C,"(output, 1.0);\r\n}\n"]).join(''),
  hash: 0x75a63ce4191d1,
  table,
  shake: [[194,[0,3]],[252,[1,3]],[289,[2,3]],[410,[3]]],
  tree: decompressAST([[1,0,68],[1,71,128],[1,60,118],[1,63,116],[1,58,92],[1,37,153],[0,121,650],[1,0,7],[2,11,35],[2,115,125],[2,50,65],[2,248,256],[2,33,43]], table[S]),
};

const libs = {"../../../wgsl/use/view": m0, "../../../wgsl/use/types": m1, "../../../wgsl/codec/octahedral": m2};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getDeferredLightFragment = getSymbol("getDeferredLightFragment");
