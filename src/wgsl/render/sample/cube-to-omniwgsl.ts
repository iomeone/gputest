/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/codec/octahedralwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getTexture getScale getCubeToOmniSample ../../../wgsl/codec/octahedral decodeOctahedral wrapOctahedral link uvw vec2<f32> optional export".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[O]:[{[A]:0,[N]:_(3),[S]:_([4,5]),[K]:[{[N]:_(4),[J]:_(4)},{[N]:_(5),[J]:_(5)}]}],[X]:[{[A]:79,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:C,[Z]:_([6]),[P]:[{[N]:_(7),[T]:D}]}},{[A]:130,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:_(8),[Z]:_([9,6])}}],[E]:[{[A]:204,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:C,[Z]:_([10]),[P]:[{[N]:"uv",[T]:_(8)}],[I]:_([1,0])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "sample/cube-to-omni.wgsl",
  code: _(["use '",3,"'::{ ",4,", ",5," };\r\n\r\n@",6," fn ",0,"(uvw: ",D,") -> ",C,";\r\n@",9," @",6," fn ",1,"() -> ",8," { return ",8,"(1.0); };\r\n\r\n@",10," fn ",2,"(uv: ",8,") -> ",C," {\r\n  let oct = ",5,"((uv.xy * 2.0 - 1.0) * ",1,"());\r\n  let uvw: ",D," = ",4,"(oct);\r\n  return ",0,"(uvw);\r\n}\n"]).join(''),
  hash: 0x16dfc0dd60f686,
  table,
  shake: [[79,[0,2]],[130,[1,2]],[204,[2]]],
  tree: decompressAST([[1,0,74],[1,79,127],[4,51,120,1],[1,0,9],[1,10,15],[2,9,17],[0,55,255],[1,0,7],[2,11,30],[2,63,77],[2,37,45],[2,37,53],[2,33,43]], table[S]),
};

const libs = {"../../../wgsl/codec/octahedral": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getCubeToOmniSample = getSymbol("getCubeToOmniSample");
