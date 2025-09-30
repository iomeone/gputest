/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/fragment/pbrwgsl";
import m1 from "../../wgsl/use/typeswgsl";
const {} = symbolDictionary;
const _ = decompressString("sampleEnvironment getGain sqr varianceForRoughness applyPBREnvironment symbols visibles ../../wgsl/fragment/pbr name IBL IBLResult environmentBRDF imported imports ../../wgsl/use/types SurfaceFragment modules symbol flags vec4<f32> type link attr uvw vec3<f32> sigma f32 ddx ddy parameters func optional externals export surface identifiers exports linkable sampleEnvironment return roughness surface albedo diffuse specular".split(' '));
const t = {[_(5)]:_([0,1,2,3,4]),[_(6)]:_([4]),[_(16)]:[{"at":0,[_(8)]:_(7),[_(5)]:_([9,10,11]),[_(13)]:[{[_(8)]:_(9),[_(12)]:_(9)},{[_(8)]:_(10),[_(12)]:_(10)},{[_(8)]:_(11),[_(12)]:_(11)}]},{"at":0,[_(8)]:_(14),[_(5)]:_([15]),[_(13)]:[{[_(8)]:_(15),[_(12)]:_(15)}]}],[_(32)]:[{"at":121,[_(17)]:_(0),[_(18)]:2,[_(30)]:{[_(8)]:_(0),[_(20)]:_(19),[_(22)]:_([21]),[_(29)]:[{[_(8)]:_(23),[_(20)]:_(24)},{[_(8)]:_(25),[_(20)]:_(26)},{[_(8)]:_(27),[_(20)]:_(24)},{[_(8)]:_(28),[_(20)]:_(24)}]}},{"at":223,[_(17)]:_(1),[_(18)]:6,[_(30)]:{[_(8)]:_(1),[_(20)]:_(26),[_(22)]:_([31,21])}}],[_(36)]:[{"at":540,[_(17)]:_(4),[_(18)]:1,[_(30)]:{[_(8)]:_(4),[_(20)]:_(24),[_(22)]:_([33]),[_(29)]:[{[_(8)]:"N",[_(20)]:_(24)},{[_(8)]:"V",[_(20)]:_(24)},{[_(8)]:_(34),[_(20)]:_(15)}],[_(35)]:_([3,0,1])}}],[_(37)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "material/pbr-environment",
  "code": _(["use '",7,"'::{ IBL, ",10,", ",11," };\r\nuse '",14,"'::{ ",15," };\r\n\r\n@",21," fn ",0,"(uvw: ",24,", ",25,": f32, ddx: ",24,", ddy: ",24,") -> ",19,";\r\n@",31," @",21," fn ",1,"() -> f32 { ",39," 1.0; };\r\n\r\nfn sqr(x: f32) -> f32 { ",39," x * x; }\r\n\r\nfn ",3,"(",40,": f32) -> f32 {\r\n  if (",40," < 0.4) { ",39," 1.74 * sqr(sqr(",40,")); }\r\n  if (",40," < 0.8) { ",39," 0.575 * ",40," - 0.184; }\r\n  ",39," 0.312 * ",40," + 0.027;\r\n};\r\n\r\n@",33," fn ",4,"(\r\n  N: ",24,",\r\n  V: ",24,",\r\n  ",34,": ",15,",\r\n) -> ",24," {\r\n  let ",42," = ",34,".",42,";\r\n  let metalness = ",34,".material.x;\r\n  let ",40," = ",34,".material.y;\r\n\r\n  let ",25," = sqrt(",3,"(",40,"));\r\n  let ibl = IBL(N, V, ",42,".xyz, metalness, ",40,");\r\n\r\n  let R = reflect(-V, N);\r\n\r\n  let Fd = ibl.",43,";\r\n  let Fs = ibl.",44,";\r\n  let dotNV = ibl.dotNV;\r\n\r\n  let dfx = dpdx(R);\r\n  let dfy = dpdy(R);\r\n\r\n  let brdf = ",11,"(",40,", dotNV);\r\n  let ",43," = Fd * ",0,"(N, -1.0, dfx, dfy).xyz;\r\n  let ",44," = max(",24,"(0.0), brdf.x + Fs * brdf.y) * ",0,"(R, ",25,", dfx, dfy).xyz;\r\n\r\n  ",39," (",43," + ",44,") * ",34,".occlusion * ",1,"();\r\n}"]).join(''),
  "hash": 6006840527990339,
  "table": t,
  "shake": [[121,[0,4]],[223,[1,4]],[275,[2,3,4]],[318,[3,4]],[540,[4]]],
  "tree": decompressAST([[1,0,66],[1,69,116],[1,52,151],[4,102,153,1],[1,0,9],[1,10,15],[2,9,16],[0,33,76],[2,7,10],[0,36,253],[2,7,27],[2,86,89],[2,4,7],[0,125,904],[1,0,7],[2,11,30],[2,67,82],[2,167,187],[2,47,50],[2,215,230],[2,57,74],[2,104,121],[2,98,105]], t[S]),
};
const libs = {"../../wgsl/fragment/pbr": m0, "../../wgsl/use/types": m1};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const applyPBREnvironment = getSymbol("applyPBREnvironment");
