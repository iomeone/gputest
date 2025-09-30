/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("shadowTexture shadowSampler sampleShadow f32 export vec2<f32> index u32 level texture_depth_2d_array group(PASS) binding(2) sampler_comparison binding(3)".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[E]:[{[A]:136,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(3),[Z]:_([4]),[P]:[{[N]:"uv",[T]:_(5)},{[N]:_(6),[T]:_(7)},{[N]:_(8),[T]:_(3)}],[I]:_([0,1])}}],[B]:[{[A]:0,[R]:_(0),[G]:32,[V]:{[N]:_(0),[T]:_(9),[Z]:_([10,11])}},{[A]:69,[R]:_(1),[G]:32,[V]:{[N]:_(1),[T]:_(12),[Z]:_([10,13])}}]};
const data = {
  name: "use/shadow.wgsl",
  code: _(["@",10," @",11," var ",0,": ",9,";\r\n@",10," @",13," var ",1,": ",12,";\r\n\r\n@",4," fn ",2,"(uv: ",5,", ",6,": u32, ",8,": f32) -> f32 {\r\n  return textureSampleCompareLevel(",0,", ",1,", uv, ",6,", ",8,");\r\n}\n"]).join(''),
  hash: 0xec14b03b930a6,
  table,
  shake: [[0,[0,2]],[69,[1,2]],[136,[2]]],
  tree: decompressAST([[0,0,67],[3,0,12],[3,13,24],[2,16,29],[0,40,103],[3,0,12],[3,13,24],[2,16,29],[0,38,197],[1,0,7],[2,11,23],[2,97,110],[2,15,28]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const sampleShadow = getSymbol("sampleShadow");
