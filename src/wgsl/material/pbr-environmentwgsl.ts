/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
import m0 from "../../wgsl/fragment/pbrwgsl";
import m1 from "../../wgsl/use/typeswgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("sampleEnvironment sqr varianceForRoughness applyPBREnvironment ../../wgsl/fragment/pbr IBL IBLResult environmentBRDF ../../wgsl/use/types SurfaceFragment link uvw sigma f32 ddx ddy export surface sampleEnvironment return roughness surface albedo diffuse specular occlusion".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([3]),[O]:[{[A]:0,[N]:_(4),[S]:_([5,6,7]),[K]:[{[N]:_(5),[J]:_(5)},{[N]:_(6),[J]:_(6)},{[N]:_(7),[J]:_(7)}]},{[A]:0,[N]:_(8),[S]:_([9]),[K]:[{[N]:_(9),[J]:_(9)}]}],[X]:[{[A]:121,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:C,[Z]:_([10]),[P]:[{[N]:_(11),[T]:D},{[N]:_(12),[T]:_(13)},{[N]:_(14),[T]:D},{[N]:_(15),[T]:D}]}}],[E]:[{[A]:486,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:D,[Z]:_([16]),[P]:[{[N]:"N",[T]:D},{[N]:"V",[T]:D},{[N]:_(17),[T]:_(9)}],[I]:_([2,0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "material/pbr-environment.wgsl",
  code: _(["use '",4,"'::{ IBL, ",6,", ",7," };\r\nuse '",8,"'::{ ",9," };\r\n\r\n@",10," fn ",0,"(uvw: ",D,", ",12,": f32, ddx: ",D,", ddy: ",D,") -> ",C,";\r\n\r\nfn sqr(x: f32) -> f32 { ",19," x * x; }\r\n\r\nfn ",2,"(",20,": f32) -> f32 {\r\n  if (",20," < 0.4) { ",19," 1.74 * sqr(sqr(",20,")); }\r\n  if (",20," < 0.8) { ",19," 0.575 * ",20," - 0.184; }\r\n  ",19," 0.312 * ",20," + 0.027;\r\n};\r\n\r\n@",16," fn ",3,"(\r\n  N: ",D,",\r\n  V: ",D,",\r\n  ",17,": ",9,",\r\n) -> ",D," {\r\n  let ",22," = ",17,".",22,";\r\n  let metalness = ",17,".material.x;\r\n  let ",20," = ",17,".material.y;\r\n\r\n  let ",12," = sqrt(",2,"(",20,"));\r\n  let ibl = IBL(N, V, ",22,".xyz, metalness, ",20,");\r\n\r\n  let R = reflect(-V, N);\r\n\r\n  let Fd = ibl.",23,";\r\n  let Fs = ibl.",24,";\r\n  let dotNV = ibl.dotNV;\r\n\r\n  let dfx = dpdx(R);\r\n  let dfy = dpdy(R);\r\n\r\n  let bentNormal = ",17,".",25,".xyz;\r\n  let ",25," = ",17,".",25,".w;\r\n\r\n  let brdf = ",7,"(",20,", dotNV);\r\n  let ",23," = Fd * ",0,"(bentNormal, -1.0, dfx, dfy).xyz;\r\n  let ",24," = max(",D,"(0.0), brdf.x + Fs * brdf.y) * ",0,"(R, ",12,", dfx, dfy).xyz;\r\n\r\n  ",19," (",23," + ",24,") * ",25,";\r\n}\n"]).join(''),
  hash: 0xc4977cef8d861,
  table,
  shake: [[121,[0,3]],[221,[1,2,3]],[264,[2,3]],[486,[3]]],
  tree: decompressAST([[1,0,66],[1,69,116],[1,52,151],[0,100,143],[2,7,10],[0,36,253],[2,7,27],[2,86,89],[2,4,7],[0,125,978],[1,0,7],[2,11,30],[2,67,82],[2,167,187],[2,47,50],[2,300,315],[2,57,74],[2,113,130]], table[S]),
};

const libs = {"../../wgsl/fragment/pbr": m0, "../../wgsl/use/types": m1};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const applyPBREnvironment = getSymbol("applyPBREnvironment");
