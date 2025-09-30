/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getTexture getOffset downsampleExact2 infer(T) link vec2<u32> optional export infers".split(' '));
const table = {[S]:_(["T",0,1,2]),[W]:_([2]),[X]:[{[A]:18,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:{[N]:"T",[Z]:_([3])},[Z]:_([4]),[P]:[{[N]:"ij",[T]:_(5)}],[I]:_(["T"]),[H]:[{[N]:"T",[A]:-1}]}},{[A]:70,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:_(5),[Z]:_([6,4])}}],[E]:[{[A]:143,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:"T",[Z]:_([7]),[P]:[{[N]:"ij",[T]:_(5)}],[I]:_(["T",0,1])}}],[_(8)]:_(["T"]),[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "texture/downsample.wgsl",
  code: _(["@infer ",T," T;\r\n\r\n@",4," fn ",0,"(ij: ",5,") -> @",3," T;\r\n@",6," @",4," fn ",1,"() -> ",5," { return ",5,"(0); };\r\n\r\n@",7," fn ",2,"(ij: ",5,") -> T {\r\n  return ",0,"(ij * 2 + ",1,"());\r\n}\n"]).join(''),
  hash: 0x16cb6887ac65,
  table,
  shake: [[0,[0,1,3]],[18,[1,3]],[70,[2,3]],[143,[3]]],
  tree: decompressAST([[1,0,14],[1,18,67],[4,52,120,2],[1,0,9],[1,10,15],[2,9,18],[0,54,150],[1,0,7],[2,11,27],[2,35,36],[2,14,24],[2,20,29]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const downsampleExact2 = getSymbol("downsampleExact2");
