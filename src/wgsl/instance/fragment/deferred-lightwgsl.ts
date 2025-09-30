/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/viewwgsl";
import m1 from "../../../wgsl/use/typeswgsl";
import m2 from "../../../wgsl/codec/octahedralwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getAlbedo getNormal getMaterial getEmissive getDepth getLight applyLight getDeferredLightFragment ../../../wgsl/use/view getViewPosition clipToWorld to3D ../../../wgsl/use/types Light SurfaceFragment ../../../wgsl/codec/octahedral decodeOctahedral link vec2<f32> f32 u32 light surface export index SurfaceFragment surface albedo normal position viewPosition".split(' '));
const table = {[S]:_([0,1,2,3,4,5,6,7]),[W]:_([7]),[O]:[{[A]:0,[N]:_(8),[S]:_([9,10,11]),[K]:[{[N]:_(9),[J]:_(9)},{[N]:_(10),[J]:_(10)},{[N]:_(11),[J]:_(11)}]},{[A]:0,[N]:_(12),[S]:_([13,14]),[K]:[{[N]:_(13),[J]:_(13)},{[N]:_(14),[J]:_(14)}]},{[A]:0,[N]:_(15),[S]:_([16]),[K]:[{[N]:_(16),[J]:_(16)}]}],[X]:[{[A]:194,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:C,[Z]:_([17]),[P]:[{[N]:"uv",[T]:_(18)}]}},{[A]:243,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:C,[Z]:_([17]),[P]:[{[N]:"uv",[T]:_(18)}]}},{[A]:292,[R]:_(2),[G]:2,[F]:{[N]:_(2),[T]:C,[Z]:_([17]),[P]:[{[N]:"uv",[T]:_(18)}]}},{[A]:343,[R]:_(3),[G]:2,[F]:{[N]:_(3),[T]:C,[Z]:_([17]),[P]:[{[N]:"uv",[T]:_(18)}]}},{[A]:394,[R]:_(4),[G]:2,[F]:{[N]:_(4),[T]:_(19),[Z]:_([17]),[P]:[{[N]:"uv",[T]:_(18)}]}},{[A]:438,[R]:_(5),[G]:2,[F]:{[N]:_(5),[T]:_(13),[Z]:_([17]),[P]:[{[N]:"i",[T]:_(20)}]}},{[A]:475,[R]:_(6),[G]:2,[F]:{[N]:_(6),[T]:D,[Z]:_([17]),[P]:[{[N]:"N",[T]:D},{[N]:"V",[T]:D},{[N]:_(21),[T]:_(13)},{[N]:_(22),[T]:_(14)}]}}],[E]:[{[A]:596,[R]:_(7),[G]:1,[F]:{[N]:_(7),[T]:C,[Z]:_([23]),[P]:[{[N]:"uv",[T]:_(18)},{[N]:_(24),[T]:_(20)}],[I]:_([0,1,2,4,5,6])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true,[_(4)]:true,[_(5)]:true,[_(6)]:true}};
const data = {
  name: "fragment/deferred-light.wgsl",
  code: _(["use '",8,"'::{ ",9,", ",10,", ",11," };\r\nuse '",12,"'::{ ",13,", ",14," };\r\nuse '",15,"'::{ ",16," };\r\n\r\n@",17," fn ",0,"(uv: ",18,") -> ",C,";\r\n@",17," fn ",1,"(uv: ",18,") -> ",C,";\r\n@",17," fn ",2,"(uv: ",18,") -> ",C,";\r\n@",17," fn ",3,"(uv: ",18,") -> ",C,";\r\n@",17," fn ",4,"(uv: ",18,") -> f32;\r\n\r\n@",17," fn ",5,"(i: u32) -> ",13,";\r\n@",17," fn ",6,"(\r\n  N: ",D,",\r\n  V: ",D,",\r\n  ",21,": ",13,",\r\n  ",22,": ",14,",\r\n) -> ",D,";\r\n\r\n@",23," fn ",7,"(\r\n  uv: ",18,",\r\n  ",24,": u32,\r\n) -> ",C," {\r\n  let ",27," = ",0,"(uv);\r\n  let ",28," = ",1,"(uv);\r\n  let material = ",2,"(uv);\r\n  let depth = ",4,"(uv);\r\n\r\n  let ",29," = ",11,"(",10,"(",C,"((uv * 2.0 - 1.0) * ",18,"(1.0, -1.0), depth, 1.0)));\r\n\r\n  let ",22," = ",14,"(\r\n    ",C,"(",29,", 1.0),\r\n    ",C,"(",16,"(",28,".xy), 0.0),\r\n    ",C,"(",27,".xyz, 1.0),\r\n    ",C,"(0.0),\r\n    material,\r\n    ",27,".w,\r\n    0.0,\r\n  );\r\n\r\n  let ",30," = ",9,"();\r\n  let ",22,"Position = ",22,".",29,".xyz;\r\n  let toView = ",30,".xyz - ",22,"Position * ",30,".w;\r\n\r\n  let N: ",D," = ",28,"ize(",22,".",28,".xyz);\r\n  let V: ",D," = ",28,"ize(toView);\r\n\r\n  let ",21," = ",5,"(",24,");\r\n  let output = ",6,"(N, V, ",21,", ",22,");\r\n\r\n  return ",C,"(output, 1.0);\r\n}\n"]).join(''),
  hash: 0x1638fa97104c16,
  table,
  shake: [[194,[0,7]],[243,[1,7]],[292,[2,7]],[343,[3]],[394,[4,7]],[438,[5,7]],[475,[6,7]],[596,[7]]],
  tree: decompressAST([[1,0,68],[1,71,128],[1,60,118],[1,63,109],[1,49,95],[1,49,97],[1,51,99],[1,51,90],[1,44,78],[1,37,153],[0,121,1032],[1,0,7],[2,11,35],[2,93,102],[2,31,40],[2,33,44],[2,32,40],[2,34,38],[2,5,16],[2,97,112],[2,63,79],[2,159,174],[2,248,256],[2,33,43]], table[S]),
};

const libs = {"../../../wgsl/use/view": m0, "../../../wgsl/use/types": m1, "../../../wgsl/codec/octahedral": m2};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getDeferredLightFragment = getSymbol("getDeferredLightFragment");
