/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("ssaoTexture sampleSSAO export vec2<u32> texture_2d<f32> group(PASS) binding(4)".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[E]:[{[A]:62,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:C,[Z]:_([2]),[P]:[{[N]:"xy",[T]:_(3)}],[I]:_([0])}}],[B]:[{[A]:0,[R]:_(0),[G]:32,[V]:{[N]:_(0),[T]:_(4),[Z]:_([5,6])}}]};
const data = {
  name: "use/ssao.wgsl",
  code: _(["@",5," @",6," var ",0,": ",4,";\r\n\r\n@",2," fn ",1,"(xy: ",3,") -> ",C," {\r\n  return textureLoad(",0,", xy, 0u);\r\n}\n"]).join(''),
  hash: 0x1ce54ed74550f0,
  table,
  shake: [[0,[0,1]],[62,[1]]],
  tree: decompressAST([[0,0,58],[3,0,12],[3,13,24],[2,16,27],[0,33,131],[1,0,7],[2,11,21],[2,63,74]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const sampleSSAO = getSymbol("sampleSSAO");
