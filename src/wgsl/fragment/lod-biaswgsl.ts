/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getTexture getLODBias getLODBiasedTexture link vec2<f32> bias f32 optional export".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:C,[Z]:_([3]),[P]:[{[N]:"uv",[T]:_(4)},{[N]:_(5),[T]:_(6)}]}},{[A]:65,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:_(6),[Z]:_([7,3])}}],[E]:[{[A]:123,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:C,[Z]:_([8]),[P]:[{[N]:"uv",[T]:_(4)}],[I]:_([0,1])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "fragment/lod-bias.wgsl",
  code: _(["@",3," fn ",0,"(uv: ",4,", ",5,": f32) -> ",C," {}\r\n\r\n@",7," @",3," fn ",1,"() -> f32 { return 0.0; }\r\n\r\n@",8," fn ",1,"edTexture(uv: ",4,") -> ",C," {\r\n  return ",0,"(uv, ",1,"());\r\n};\n"]).join(''),
  hash: 0x15f8ef32df1628,
  table,
  shake: [[0,[0,2]],[65,[1,2]],[123,[2]]],
  tree: decompressAST([[1,0,61],[4,65,119,1],[1,0,9],[1,10,15],[2,9,19],[0,39,142],[1,0,7],[2,11,30],[2,60,70],[2,15,25]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getLODBiasedTexture = getSymbol("getLODBiasedTexture");
