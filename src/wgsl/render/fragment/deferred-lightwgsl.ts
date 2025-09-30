/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/viewwgsl";
const {} = symbolDictionary;
const _ = decompressString("getFragment main symbols visibles ../../../wgsl/use/view name getViewResolution imported imports modules symbol flags vec4<f32> type link attr vec2<f32> parameters func externals location(0) fragment fragCoord builtin(position) lightIndex u32 interpolate(flat) identifiers exports linkable".split(' '));
const t = {[_(2)]:_([0,1]),[_(3)]:_([1]),[_(9)]:[{"at":0,[_(5)]:_(4),[_(2)]:_([6]),[_(8)]:[{[_(5)]:_(6),[_(7)]:_(6)}]}],[_(19)]:[{"at":57,[_(10)]:_(0),[_(11)]:2,[_(18)]:{[_(5)]:_(0),[_(13)]:_(12),[_(15)]:_([14]),[_(17)]:[{[_(5)]:"uv",[_(13)]:_(16)}]}}],[_(28)]:[{"at":110,[_(10)]:_(1),[_(11)]:1,[_(18)]:{[_(5)]:_(1),[_(13)]:{[_(5)]:_(12),[_(15)]:_([20])},[_(15)]:_([21]),[_(17)]:[{[_(5)]:_(22),[_(13)]:_(12),[_(15)]:_([23])},{[_(5)]:_(24),[_(13)]:_(25),[_(15)]:_([20,26])}],[_(27)]:_([0])}}],[_(29)]:{[_(0)]:true}};
const data = {
  "name": "fragment/deferred-light",
  "code": _(["use '",4,"':: { ",6," };\r\n\r\n@",14," fn ",0,"(uv: ",16,") -> ",12,";\r\n\r\n@",21,"\r\nfn ",1,"(\r\n  @",23," ",22,": ",12,",\r\n  @",20," @",26," ",24,": u32,\r\n) -> @",20," ",12," {\r\n\r\n  var uv = ",16,"(",22,".xy) * ",6,"();\r\n  var outColor = ",0,"(uv, ",24,");\r\n\r\n  return ",12,"(outColor.rgb, 1.0);\r\n}"]).join(''),
  "hash": 2649288567353547,
  "table": t,
  "shake": [[57,[0,1]],[110,[1]]],
  "tree": decompressAST([[1,0,52],[1,57,105],[0,53,352],[3,0,9],[2,14,18],[3,9,27],[3,44,56],[3,13,31],[3,42,54],[2,65,82],[2,39,50]], t[S]),
};
const libs = {"../../../wgsl/use/view": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
