/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getTexture getSize getOffset textureUVToXYOffset infer(T) link vec2<u32> vec2<f32> optional export infers".split(' '));
const table = {[S]:_(["T",0,1,2,3]),[W]:_([3]),[X]:[{[A]:18,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:{[N]:"T",[Z]:_([4])},[Z]:_([5]),[P]:[{[N]:"uv",[T]:_(6)}],[I]:_(["T"]),[H]:[{[N]:"T",[A]:-1}]}},{[A]:70,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:_(7),[Z]:_([5])}},{[A]:104,[R]:_(2),[G]:6,[F]:{[N]:_(2),[T]:_(6),[Z]:_([8,5])}}],[E]:[{[A]:177,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:"T",[Z]:_([9]),[P]:[{[N]:"uv",[T]:_(7)}],[I]:_(["T",1,2,0])}}],[_(10)]:_(["T"]),[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  name: "texture/raw-offset.wgsl",
  code: _(["@infer ",T," T;\r\n\r\n@",5," fn ",0,"(uv: ",6,") -> @",4," T;\r\n@",5," fn ",1,"() -> ",7,";\r\n@",8," @",5," fn ",2,"() -> ",6," { return ",6,"(0); };\r\n\r\n@",9," fn ",3,"(uv: ",7,") -> T {\r\n  let xy = ",6,"(uv.xy * ",1,"()) + ",2,"();\r\n  return ",0,"(xy);\r\n}\n"]).join(''),
  hash: 0x179378c8c9238c,
  table,
  shake: [[0,[0,1,4]],[18,[1,4]],[70,[2,4]],[104,[3,4]],[177,[4]]],
  tree: decompressAST([[1,0,14],[1,18,67],[1,52,83],[4,34,102,3],[1,0,9],[1,10,15],[2,9,18],[0,54,191],[1,0,7],[2,11,30],[2,38,39],[2,34,41],[2,13,22],[2,23,33]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const textureUVToXYOffset = getSymbol("textureUVToXYOffset");
