/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getTexture getSize textureUVToXY infer(T) link vec2<u32> vec2<f32> export infers".split(' '));
const table = {[S]:_(["T",0,1,2]),[W]:_([2]),[X]:[{[A]:18,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:{[N]:"T",[Z]:_([3])},[Z]:_([4]),[P]:[{[N]:"uv",[T]:_(5)}],[I]:_(["T"]),[H]:[{[N]:"T",[A]:-1}]}},{[A]:70,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:_(6),[Z]:_([4])}}],[E]:[{[A]:106,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:"T",[Z]:_([7]),[P]:[{[N]:"uv",[T]:_(6)}],[I]:_(["T",1,0])}}],[_(8)]:_(["T"]),[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "texture/raw.wgsl",
  code: _(["@infer ",T," T;\r\n\r\n@",4," fn ",0,"(uv: ",5,") -> @",3," T;\r\n@",4," fn ",1,"() -> ",6,";\r\n\r\n@",7," fn ",2,"(uv: ",6,") -> T {\r\n  let xy = ",5,"(uv.xy * ",1,"());\r\n  return ",0,"(xy);\r\n}\n"]).join(''),
  hash: 0x3accdbfe2d248,
  table,
  shake: [[0,[0,1,3]],[18,[1,3]],[70,[2,3]],[106,[3]]],
  tree: decompressAST([[1,0,14],[1,18,67],[1,52,83],[0,36,153],[1,0,7],[2,11,24],[2,32,33],[2,34,41],[2,22,32]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const textureUVToXY = getSymbol("textureUVToXY");
