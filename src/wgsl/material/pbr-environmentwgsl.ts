/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/fragment/pbrwgsl";
import m1 from "../../wgsl/use/typeswgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("sampleEnvironment getGain sqr varianceForRoughness applyPBREnvironment ../../wgsl/fragment/pbr IBL IBLResult environmentBRDF ../../wgsl/use/types SurfaceFragment link uvw sigma f32 ddx ddy optional export surface sampleEnvironment return roughness surface albedo diffuse specular".split(' '));
const table = {[S]:_([0,1,2,3,4]),[W]:_([4]),[O]:[{[A]:0,[N]:_(5),[S]:_([6,7,8]),[K]:[{[N]:_(6),[J]:_(6)},{[N]:_(7),[J]:_(7)},{[N]:_(8),[J]:_(8)}]},{[A]:0,[N]:_(9),[S]:_([10]),[K]:[{[N]:_(10),[J]:_(10)}]}],[X]:[{[A]:121,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:C,[Z]:_([11]),[P]:[{[N]:_(12),[T]:D},{[N]:_(13),[T]:_(14)},{[N]:_(15),[T]:D},{[N]:_(16),[T]:D}]}},{[A]:223,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:_(14),[Z]:_([17,11])}}],[E]:[{[A]:540,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:D,[Z]:_([18]),[P]:[{[N]:"N",[T]:D},{[N]:"V",[T]:D},{[N]:_(19),[T]:_(10)}],[I]:_([3,0,1])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "material/pbr-environment.wgsl",
  code: _(["use '",5,"'::{ IBL, ",7,", ",8," };\r\nuse '",9,"'::{ ",10," };\r\n\r\n@",11," fn ",0,"(uvw: ",D,", ",13,": f32, ddx: ",D,", ddy: ",D,") -> ",C,";\r\n@",17," @",11," fn ",1,"() -> f32 { ",21," 1.0; };\r\n\r\nfn sqr(x: f32) -> f32 { ",21," x * x; }\r\n\r\nfn ",3,"(",22,": f32) -> f32 {\r\n  if (",22," < 0.4) { ",21," 1.74 * sqr(sqr(",22,")); }\r\n  if (",22," < 0.8) { ",21," 0.575 * ",22," - 0.184; }\r\n  ",21," 0.312 * ",22," + 0.027;\r\n};\r\n\r\n@",18," fn ",4,"(\r\n  N: ",D,",\r\n  V: ",D,",\r\n  ",19,": ",10,",\r\n) -> ",D," {\r\n  let ",24," = ",19,".",24,";\r\n  let metalness = ",19,".material.x;\r\n  let ",22," = ",19,".material.y;\r\n\r\n  let ",13," = sqrt(",3,"(",22,"));\r\n  let ibl = IBL(N, V, ",24,".xyz, metalness, ",22,");\r\n\r\n  let R = reflect(-V, N);\r\n\r\n  let Fd = ibl.",25,";\r\n  let Fs = ibl.",26,";\r\n  let dotNV = ibl.dotNV;\r\n\r\n  let dfx = dpdx(R);\r\n  let dfy = dpdy(R);\r\n\r\n  let brdf = ",8,"(",22,", dotNV);\r\n  let ",25," = Fd * ",0,"(N, -1.0, dfx, dfy).xyz;\r\n  let ",26," = max(",D,"(0.0), brdf.x + Fs * brdf.y) * ",0,"(R, ",13,", dfx, dfy).xyz;\r\n\r\n  ",21," (",25," + ",26,") * ",19,".occlusion * ",1,"();\r\n}\n"]).join(''),
  hash: 0x1a0de566ea77,
  table,
  shake: [[121,[0,4]],[223,[1,4]],[275,[2,3,4]],[318,[3,4]],[540,[4]]],
  tree: decompressAST([[1,0,66],[1,69,116],[1,52,151],[4,102,153,1],[1,0,9],[1,10,15],[2,9,16],[0,33,76],[2,7,10],[0,36,253],[2,7,27],[2,86,89],[2,4,7],[0,125,904],[1,0,7],[2,11,30],[2,67,82],[2,167,187],[2,47,50],[2,215,230],[2,57,74],[2,104,121],[2,98,105]], table[S]),
};

const libs = {"../../wgsl/fragment/pbr": m0, "../../wgsl/use/types": m1};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const applyPBREnvironment = getSymbol("applyPBREnvironment");
