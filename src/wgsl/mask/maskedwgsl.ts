/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getMask getMaskedColor f32 optional link vec2<f32> export color".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[X]:[{[A]:0,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:_(2),[Z]:_([3,4]),[P]:[{[N]:"uv",[T]:_(5)}]}}],[E]:[{[A]:69,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:C,[Z]:_([6]),[P]:[{[N]:_(7),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "mask/masked.wgsl",
  code: _(["@",3," @",4," fn ",0,"(uv: ",5,") -> f32 { return 1.0; };\r\n\r\n@",6," fn ",0,"edColor(",7,": ",C,", uv: ",C,", st: ",C,") -> ",C," {\r\n  let m = ",0,"(uv.xy);\r\n  return ",C,"(",7,".xyz, ",7,".a * m);\r\n}\n"]).join(''),
  hash: 0x3eef70d7bafdd,
  table,
  shake: [[0,[0,1]],[69,[1]]],
  tree: decompressAST([[4,0,64,0],[1,0,9],[1,10,15],[2,9,16],[0,50,213],[1,0,7],[2,11,25],[2,89,96]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getMaskedColor = getSymbol("getMaskedColor");
