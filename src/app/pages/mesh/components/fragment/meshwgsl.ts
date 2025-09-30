/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../../shader/wgsl";
import m0 from "../../../../../wgsl/fragment/pbrwgsl";
import m1 from "../../../../../wgsl/use/viewwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("LightUniforms lightUniforms FragmentOutput main ../../../../../wgsl/fragment/pbr PBR ../../../../../wgsl/use/view viewUniforms export group(LIGHT) binding(LIGHT) <uniform> fragment fragColor location(0) fragUV vec2<f32> location(1) fragNormal location(2) fragPosition location(3) texture_2d<f32> group(1) binding(0) sampler binding(1) binding lightUniforms FragmentOutput location outColor fragPosition normalize inColor".split(' '));
const table = {[S]:_([0,1,"t","s",2,3]),[W]:_([1,3]),[O]:[{[A]:0,[N]:_(4),[S]:_([5]),[K]:[{[N]:_(5),[J]:_(5)}]},{[A]:0,[N]:_(6),[S]:_([7]),[K]:[{[N]:_(7),[J]:_(7)}]}],[E]:[{[A]:192,[R]:_(1),[G]:33,[V]:{[N]:_(1),[T]:_(0),[Z]:_([8,9,10]),[I]:_([0]),[Q]:_(11)}},{[A]:432,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(2),[Z]:_([12]),[P]:[{[N]:_(13),[T]:C,[Z]:_([14])},{[N]:_(15),[T]:_(16),[Z]:_([17])},{[N]:_(18),[T]:D,[Z]:_([19])},{[N]:_(20),[T]:D,[Z]:_([21])}],[I]:_([2,1,"t","s",2])}}],[B]:[{[A]:192,[R]:_(1),[G]:33,[V]:{[N]:_(1),[T]:_(0),[Z]:_([8,9,10]),[I]:_([0]),[Q]:_(11)}},{[A]:276,[R]:"t",[G]:32,[V]:{[N]:"t",[T]:_(22),[Z]:_([23,24])}},{[A]:323,[R]:"s",[G]:32,[V]:{[N]:"s",[T]:_(25),[Z]:_([23,26])}}]};
const data = {
  name: "fragment/mesh.wgsl",
  code: _(["use '",4,"'::{ PBR };\r\nuse '",6,"'::{ ",7," };\r\n\r\n",U," ",0," {\r\n  lightPosition: ",C,",\r\n  lightColor: ",C,",\r\n};\r\n\r\n@",8," @",9," @",10," var",11," ",1,": ",0,";\r\n\r\n@",23," @",24," var t: ",22,";\r\n@",23," @",26," var s: ",25,";\r\n\r\n",U," ",2," {\r\n  @",14," ",31,": ",C,",\r\n};\r\n\r\n@",12,"\r\nfn ",3,"(\r\n  @",14," ",13,": ",C,",\r\n  @",17," ",15,": ",16,",\r\n  @",19," ",18,": ",D,",\r\n  @",21," ",20,": ",D,",\r\n) -> ",2," {\r\n  var fragLight: ",D," = ",1,".lightPosition.xyz - ",20,";\r\n  var fragView: ",D," = ",7,".viewPosition.xyz - ",20,";\r\n\r\n  var N: ",D," = ",33,"(",18,");\r\n  var L: ",D," = ",33,"(fragLight);\r\n  var V: ",D," = ",33,"(fragView);\r\n\r\n  var texColor: ",C," = textureSample(t, s, ",15,");\r\n  var ",34,": ",C," = ",13," * texColor;\r\n  if (",34,".a <= 0.0) { discard; }\r\n\r\n  var albedo: ",D," = ",34,".rgb;\r\n  var metalness: f32 = 0.2;\r\n  var roughness: f32 = 0.8;\r\n\r\n  var radiance: ",D," = ",1,".lightColor.xyz * 3.1415;\r\n  var color: ",D," = radiance * PBR(N, L, V, albedo, metalness, roughness);\r\n  var ",31,": ",C," = ",C,"(color, ",34,".a);\r\n\r\n  return ",2,"(",31,");\r\n}\n"]).join(''),
  hash: 0xa22a1285c4adf,
  table,
  shake: [[103,[0,1,5]],[192,[1,5]],[276,[2,5]],[323,[3,5]],[360,[4,5]],[432,[5]]],
  tree: decompressAST([[1,0,47],[1,50,102],[0,53,137],[2,11,24],[0,78,158],[1,0,7],[3,8,21],[3,14,29],[2,29,42],[2,15,28],[0,18,63],[3,0,9],[3,10,21],[2,16,17],[0,21,58],[3,0,9],[3,10,21],[2,16,17],[0,11,78],[2,11,25],[3,20,32],[0,41,1021],[3,0,9],[2,14,18],[3,9,21],[3,38,50],[3,35,47],[3,39,51],[2,44,58],[2,47,60],[2,77,89],[2,225,226],[2,3,4],[2,231,244],[2,76,79],[2,114,128]], table[S]),
};

const libs = {"../../../../../wgsl/fragment/pbr": m0, "../../../../../wgsl/use/view": m1};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const lightUniforms = getSymbol("lightUniforms");
export const main = getSymbol("main");
