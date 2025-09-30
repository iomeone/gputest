/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../../shader/wgsl";
import m0 from "../../../../../wgsl/fragment/pbrwgsl";
import m1 from "../../../../../wgsl/use/viewwgsl";
const {} = symbolDictionary;
const _ = decompressString("LightUniforms lightUniforms FragmentOutput main symbols visibles ../../../../../wgsl/fragment/pbr name PBR imported imports ../../../../../wgsl/use/view viewUniforms modules symbol flags type export group(LIGHT) binding(LIGHT) attr identifiers <uniform> qual variable fragment fragColor vec4<f32> location(0) fragUV vec2<f32> location(1) fragNormal vec3<f32> location(2) fragPosition location(3) parameters func exports texture_2d<f32> group(1) binding(0) sampler binding(1) bindings binding lightUniforms FragmentOutput location outColor fragPosition normalize inColor".split(' '));
const t = {[_(4)]:_([0,1,"t","s",2,3]),[_(5)]:_([1,3]),[_(13)]:[{"at":0,[_(7)]:_(6),[_(4)]:_([8]),[_(10)]:[{[_(7)]:_(8),[_(9)]:_(8)}]},{"at":0,[_(7)]:_(11),[_(4)]:_([12]),[_(10)]:[{[_(7)]:_(12),[_(9)]:_(12)}]}],[_(39)]:[{"at":192,[_(14)]:_(1),[_(15)]:33,[_(24)]:{[_(7)]:_(1),[_(16)]:_(0),[_(20)]:_([17,18,19]),[_(21)]:_([0]),[_(23)]:_(22)}},{"at":432,[_(14)]:_(3),[_(15)]:1,[_(38)]:{[_(7)]:_(3),[_(16)]:_(2),[_(20)]:_([25]),[_(37)]:[{[_(7)]:_(26),[_(16)]:_(27),[_(20)]:_([28])},{[_(7)]:_(29),[_(16)]:_(30),[_(20)]:_([31])},{[_(7)]:_(32),[_(16)]:_(33),[_(20)]:_([34])},{[_(7)]:_(35),[_(16)]:_(33),[_(20)]:_([36])}],[_(21)]:_([2,1,"t","s",2])}}],[_(45)]:[{"at":192,[_(14)]:_(1),[_(15)]:33,[_(24)]:{[_(7)]:_(1),[_(16)]:_(0),[_(20)]:_([17,18,19]),[_(21)]:_([0]),[_(23)]:_(22)}},{"at":276,[_(14)]:"t",[_(15)]:32,[_(24)]:{[_(7)]:"t",[_(16)]:_(40),[_(20)]:_([41,42])}},{"at":323,[_(14)]:"s",[_(15)]:32,[_(24)]:{[_(7)]:"s",[_(16)]:_(43),[_(20)]:_([41,44])}}]};
const data = {
  "name": "fragment/mesh",
  "code": _(["use '",6,"'::{ PBR };\r\nuse '",11,"'::{ ",12," };\r\n\r\nstruct ",0," {\r\n  lightPosition: ",27,",\r\n  lightColor: ",27,",\r\n};\r\n\r\n@",17," @",18," @",19," var",22," ",1,": ",0,";\r\n\r\n@",41," @",42," var t: ",40,";\r\n@",41," @",44," var s: ",43,";\r\n\r\nstruct ",2," {\r\n  @",28," ",50,": ",27,",\r\n};\r\n\r\n@",25,"\r\nfn ",3,"(\r\n  @",28," ",26,": ",27,",\r\n  @",31," ",29,": ",30,",\r\n  @",34," ",32,": ",33,",\r\n  @",36," ",35,": ",33,",\r\n) -> ",2," {\r\n  var fragLight: ",33," = ",1,".lightPosition.xyz - ",35,";\r\n  var fragView: ",33," = ",12,".viewPosition.xyz - ",35,";\r\n\r\n  var N: ",33," = ",52,"(",32,");\r\n  var L: ",33," = ",52,"(fragLight);\r\n  var V: ",33," = ",52,"(fragView);\r\n\r\n  var texColor: ",27," = textureSample(t, s, ",29,");\r\n  var ",53,": ",27," = ",26," * texColor;\r\n  if (",53,".a <= 0.0) { discard; }\r\n\r\n  var albedo: ",33," = ",53,".rgb;\r\n  var metalness: f32 = 0.2;\r\n  var roughness: f32 = 0.8;\r\n\r\n  var radiance: ",33," = ",1,".lightColor.xyz * 3.1415;\r\n  var color: ",33," = radiance * PBR(N, L, V, albedo, metalness, roughness);\r\n  var ",50,": ",27," = ",27,"(color, ",53,".a);\r\n\r\n  return ",2,"(",50,");\r\n}"]).join(''),
  "hash": 4041227125557085,
  "table": t,
  "shake": [[103,[0,1,5]],[192,[1,5]],[276,[2,5]],[323,[3,5]],[360,[4,5]],[432,[5]]],
  "tree": decompressAST([[1,0,47],[1,50,102],[0,53,137],[2,11,24],[0,78,158],[1,0,7],[3,8,21],[3,14,29],[2,29,42],[2,15,28],[0,18,63],[3,0,9],[3,10,21],[2,16,17],[0,21,58],[3,0,9],[3,10,21],[2,16,17],[0,11,78],[2,11,25],[3,20,32],[0,41,1021],[3,0,9],[2,14,18],[3,9,21],[3,38,50],[3,35,47],[3,39,51],[2,44,58],[2,47,60],[2,77,89],[2,225,226],[2,3,4],[2,231,244],[2,76,79],[2,114,128]], t[S]),
};
const libs = {"../../../../../wgsl/fragment/pbr": m0, "../../../../../wgsl/use/view": m1};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const lightUniforms = getSymbol("lightUniforms");
export const main = getSymbol("main");
