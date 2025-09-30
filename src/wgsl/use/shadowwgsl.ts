/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("lightTexture lightSampler sampleShadow symbols visibles symbol flags name f32 type export attr vec2<f32> index u32 level parameters identifiers func exports texture_depth_2d_array group(PASS) binding(1) variable sampler_comparison binding(2) bindings".split(' '));
const t = {[_(3)]:_([0,1,2]),[_(4)]:_([2]),[_(19)]:[{"at":134,[_(5)]:_(2),[_(6)]:1,[_(18)]:{[_(7)]:_(2),[_(9)]:_(8),[_(11)]:_([10]),[_(16)]:[{[_(7)]:"uv",[_(9)]:_(12)},{[_(7)]:_(13),[_(9)]:_(14)},{[_(7)]:_(15),[_(9)]:_(8)}],[_(17)]:_([0,1])}}],[_(26)]:[{"at":0,[_(5)]:_(0),[_(6)]:32,[_(23)]:{[_(7)]:_(0),[_(9)]:_(20),[_(11)]:_([21,22])}},{"at":68,[_(5)]:_(1),[_(6)]:32,[_(23)]:{[_(7)]:_(1),[_(9)]:_(24),[_(11)]:_([21,25])}}]};
const data = {
  "name": "use/shadow",
  "code": _(["@",21," @",22," var ",0,": ",20,";\r\n@",21," @",25," var ",1,": ",24,";\r\n\r\n@",10," fn ",2,"(uv: ",12,", ",13,": u32, ",15,": f32) -> f32 {\r\n  return textureSampleCompareLevel(",0,", ",1,", uv, ",13,", ",15,");\r\n}"]).join(''),
  "hash": 4775721069556550,
  "table": t,
  "shake": [[0,[0,2]],[68,[1,2]],[134,[2]]],
  "tree": decompressAST([[0,0,66],[3,0,12],[3,13,24],[2,16,28],[0,39,101],[3,0,12],[3,13,24],[2,16,28],[0,37,194],[1,0,7],[2,11,23],[2,97,109],[2,14,26]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const sampleShadow = getSymbol("sampleShadow");
