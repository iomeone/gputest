/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSample main infer(T) link vec2<f32> location(0) fragment fragUV infers".split(' '));
const table = {[S]:_(["T",0,1]),[W]:_([1]),[X]:[{[A]:18,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:{[N]:"T",[Z]:_([2])},[Z]:_([3]),[P]:[{[N]:"uv",[T]:_(4)}],[I]:_(["T"]),[H]:[{[N]:"T",[A]:-1}]}}],[E]:[{[A]:71,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:{[N]:"T",[Z]:_([5])},[Z]:_([6]),[P]:[{[N]:_(7),[T]:_(4),[Z]:_([5])}],[I]:_(["T",0])}}],[_(8)]:_(["T"]),[L]:{[_(0)]:true}};
const data = {
  name: "copy/copy-sample.wgsl",
  code: _(["@infer ",T," T;\r\n\r\n@",3," fn ",0,"(uv: ",4,") -> @",2," T;\r\n\r\n@",6,"\r\nfn ",1,"(\r\n  @",5," ",7,": ",4,",\r\n) -> @",5," T {\r\n  return ",0,"(",7,");\r\n}\n"]).join(''),
  hash: 0x160feeb40e501c,
  table,
  shake: [[0,[0,1,2]],[18,[1,2]],[71,[2]]],
  tree: decompressAST([[1,0,14],[1,18,66],[0,53,162],[3,0,9],[2,14,18],[3,9,21],[3,38,50],[2,13,14],[2,14,23]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
