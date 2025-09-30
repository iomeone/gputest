/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getDepth main f32 optional link vec2<f32> builtin(frag_depth) fragment fragUV location(0)".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[X]:[{[A]:0,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:_(2),[Z]:_([3,4]),[P]:[{[N]:"uv",[T]:_(5)}]}}],[E]:[{[A]:69,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:{[N]:_(2),[Z]:_([6])},[Z]:_([7]),[P]:[{[N]:_(8),[T]:_(5),[Z]:_([9])}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "copy/copy-depth.wgsl",
  code: _(["@",3," @",4," fn ",0,"(uv: ",5,") -> f32 { return 0.0; }\r\n\r\n@",7,"\r\nfn ",1,"(\r\n  @",9," ",8,": ",5,",\r\n) -> @",6," f32 {\r\n  return ",0,"(",8,");\r\n}\n"]).join(''),
  hash: 0x8c660da6b1bf3,
  table,
  shake: [[0,[0,1]],[69,[1]]],
  tree: decompressAST([[4,0,65,0],[1,0,9],[1,10,15],[2,9,17],[0,50,168],[3,0,9],[2,14,18],[3,9,21],[3,38,58],[2,37,45]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
