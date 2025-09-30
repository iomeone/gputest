/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/viewwgsl";
import m1 from "../../../wgsl/use/typeswgsl";
import m2 from "../../../wgsl/codec/octahedralwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getAlbedo getNormal getMaterial getEmissive getDepth getDeferredEmissiveFragment ../../../wgsl/use/view getViewPosition clipToWorld to3D ../../../wgsl/use/types Light SurfaceFragment ../../../wgsl/codec/octahedral decodeOctahedral link vec2<f32> f32 export index u32".split(' '));
const table = {[S]:_([0,1,2,3,4,5]),[W]:_([5]),[O]:[{[A]:0,[N]:_(6),[S]:_([7,8,9]),[K]:[{[N]:_(7),[J]:_(7)},{[N]:_(8),[J]:_(8)},{[N]:_(9),[J]:_(9)}]},{[A]:0,[N]:_(10),[S]:_([11,12]),[K]:[{[N]:_(11),[J]:_(11)},{[N]:_(12),[J]:_(12)}]},{[A]:0,[N]:_(13),[S]:_([14]),[K]:[{[N]:_(14),[J]:_(14)}]}],[X]:[{[A]:194,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:C,[Z]:_([15]),[P]:[{[N]:"uv",[T]:_(16)}]}},{[A]:243,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:C,[Z]:_([15]),[P]:[{[N]:"uv",[T]:_(16)}]}},{[A]:292,[R]:_(2),[G]:2,[F]:{[N]:_(2),[T]:C,[Z]:_([15]),[P]:[{[N]:"uv",[T]:_(16)}]}},{[A]:343,[R]:_(3),[G]:2,[F]:{[N]:_(3),[T]:C,[Z]:_([15]),[P]:[{[N]:"uv",[T]:_(16)}]}},{[A]:394,[R]:_(4),[G]:2,[F]:{[N]:_(4),[T]:_(17),[Z]:_([15]),[P]:[{[N]:"uv",[T]:_(16)}]}}],[E]:[{[A]:438,[R]:_(5),[G]:1,[F]:{[N]:_(5),[T]:C,[Z]:_([18]),[P]:[{[N]:"uv",[T]:_(16)},{[N]:_(19),[T]:_(20)}],[I]:_([3])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true,[_(4)]:true}};
const data = {
  name: "fragment/deferred-emissive.wgsl",
  code: _(["use '",6,"'::{ ",7,", ",8,", ",9," };\r\nuse '",10,"'::{ ",11,", ",12," };\r\nuse '",13,"'::{ ",14," };\r\n\r\n@",15," fn ",0,"(uv: ",16,") -> ",C,";\r\n@",15," fn ",1,"(uv: ",16,") -> ",C,";\r\n@",15," fn ",2,"(uv: ",16,") -> ",C,";\r\n@",15," fn ",3,"(uv: ",16,") -> ",C,";\r\n@",15," fn ",4,"(uv: ",16,") -> f32;\r\n\r\n@",18," fn ",5,"(\r\n  uv: ",16,",\r\n  ",19,": u32,\r\n) -> ",C," {\r\n  return ",3,"(uv);\r\n}\n"]).join(''),
  hash: 0x751d9f804d75f,
  table,
  shake: [[194,[0]],[243,[1]],[292,[2]],[343,[3,5]],[394,[4]],[438,[5]]],
  tree: decompressAST([[1,0,68],[1,71,128],[1,60,118],[1,63,109],[1,49,95],[1,49,97],[1,51,99],[1,51,90],[0,44,164],[1,0,7],[2,11,38],[2,90,101]], table[S]),
};

const libs = {"../../../wgsl/use/view": m0, "../../../wgsl/use/types": m1, "../../../wgsl/codec/octahedral": m2};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getDeferredEmissiveFragment = getSymbol("getDeferredEmissiveFragment");
