/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/codec/octahedralwgsl";
const {} = symbolDictionary;
const _ = decompressString("getTexture getScale getCubeToOmniSample symbols visibles ../../../wgsl/codec/octahedral name decodeOctahedral wrapOctahedral imported imports modules symbol flags vec4<f32> type link attr uvw vec3<f32> parameters func vec2<f32> optional externals export outColor identifiers exports linkable".split(' '));
const t = {[_(3)]:_([0,1,2]),[_(4)]:_([2]),[_(11)]:[{"at":0,[_(6)]:_(5),[_(3)]:_([7,8]),[_(10)]:[{[_(6)]:_(7),[_(9)]:_(7)},{[_(6)]:_(8),[_(9)]:_(8)}]}],[_(24)]:[{"at":79,[_(12)]:_(0),[_(13)]:2,[_(21)]:{[_(6)]:_(0),[_(15)]:_(14),[_(17)]:_([16]),[_(20)]:[{[_(6)]:_(18),[_(15)]:_(19)}]}},{"at":130,[_(12)]:_(1),[_(13)]:6,[_(21)]:{[_(6)]:_(1),[_(15)]:_(22),[_(17)]:_([23,16])}}],[_(28)]:[{"at":204,[_(12)]:_(2),[_(13)]:1,[_(21)]:{[_(6)]:_(2),[_(15)]:_(14),[_(17)]:_([25]),[_(20)]:[{[_(6)]:_(26),[_(15)]:_(14)},{[_(6)]:"uv",[_(15)]:_(14)},{[_(6)]:"st",[_(15)]:_(14)}],[_(27)]:_([1,0])}}],[_(29)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "sample/cube-to-omni",
  "code": _(["use '",5,"'::{ ",7,", ",8," };\r\n\r\n@",16," fn ",0,"(uvw: ",19,") -> ",14,";\r\n@",23," @",16," fn ",1,"() -> ",22," { return ",22,"(1.0); };\r\n\r\n@",25," fn ",2,"(",26,": ",14,", uv: ",14,", st: ",14,") -> ",14," {\r\n  let oct = ",8,"((uv.xy * 2.0 - 1.0) * ",1,"());\r\n  let uvw: ",19," = ",7,"(oct);\r\n  return ",0,"(uvw);\r\n}"]).join(''),
  "hash": 1956710824467037,
  "table": t,
  "shake": [[79,[0,2]],[130,[1,2]],[204,[2]]],
  "tree": decompressAST([[1,0,74],[1,79,127],[4,51,120,1],[1,0,9],[1,10,15],[2,9,17],[0,55,291],[1,0,7],[2,11,30],[2,99,113],[2,37,45],[2,37,53],[2,33,43]], t[S]),
};
const libs = {"../../../wgsl/codec/octahedral": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getCubeToOmniSample = getSymbol("getCubeToOmniSample");
