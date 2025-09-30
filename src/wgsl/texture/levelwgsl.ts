/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getTexture getLevel loadTextureLevel infer(T) link vec2<u32> u32 optional export infers".split(' '));
const table = {[S]:_(["T",0,1,2]),[W]:_([2]),[X]:[{[A]:18,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:{[N]:"T",[Z]:_([3])},[Z]:_([4]),[P]:[{[N]:"ij",[T]:_(5)},{[N]:"l",[T]:_(6)}],[I]:_(["T"]),[H]:[{[N]:"T",[A]:-1}]}},{[A]:78,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:_(6),[Z]:_([7,4])}}],[E]:[{[A]:134,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:"T",[Z]:_([8]),[P]:[{[N]:"ij",[T]:_(5)}],[I]:_(["T",0,1])}}],[_(9)]:_(["T"]),[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "texture/level.wgsl",
  code: _(["@infer ",T," T;\r\n\r\n@",4," fn ",0,"(ij: ",5,", l: u32) -> @",3," T;\r\n@",7," @",4," fn ",1,"() -> u32 { return 0u; };\r\n\r\n@",8," fn ",2,"(ij: ",5,") -> T {\r\n  return ",0,"(ij, ",1,"());\r\n};\n"]).join(''),
  hash: 0x1d7415bc48916f,
  table,
  shake: [[0,[0,1,3]],[18,[1,3]],[78,[2,3]],[134,[3]]],
  tree: decompressAST([[1,0,14],[1,18,75],[4,60,111,2],[1,0,9],[1,10,15],[2,9,17],[0,37,127],[1,0,7],[2,11,27],[2,35,36],[2,14,24],[2,15,23]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const loadTextureLevel = getSymbol("loadTextureLevel");
