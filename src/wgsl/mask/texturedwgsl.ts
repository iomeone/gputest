/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getTexture getTextureColor optional link vec2<f32> export color".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[X]:[{[A]:0,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:C,[Z]:_([2,3]),[P]:[{[N]:"uv",[T]:_(4)}]}}],[E]:[{[A]:104,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:C,[Z]:_([5]),[P]:[{[N]:_(6),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "mask/textured.wgsl",
  code: _(["@",2," @",3," fn ",0,"(uv: ",4,") -> ",C," { return ",C,"(1.0, 1.0, 1.0, 1.0); };\r\n\r\n@",5," fn ",0,"Color(",6,": ",C,", uv: ",C,", st: ",C,") -> ",C," {\r\n  return ",6," * ",0,"(uv.xy);\r\n}\n"]).join(''),
  hash: 0x1840cc96444da8,
  table,
  shake: [[0,[0,1]],[104,[1]]],
  tree: decompressAST([[4,0,99,0],[1,0,9],[1,10,15],[2,9,19],[0,85,214],[1,0,7],[2,11,26],[2,97,107]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getTextureColor = getSymbol("getTextureColor");
