/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("SampleOutput getSample selectA selectB main infer(T) link vec2<f32> infer(T1) infer(T2) fragment fragUV location(0) location(1) locals infers SampleOutput location sample".split(' '));
const table = {[S]:_(["T","T1","T2",0,1,2,3,4]),[W]:_([4]),[X]:[{[A]:127,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:{[N]:"T",[Z]:_([5])},[Z]:_([6]),[P]:[{[N]:"uv",[T]:_(7)}],[I]:_(["T"]),[H]:[{[N]:"T",[A]:-1}]}},{[A]:180,[R]:_(2),[G]:2,[F]:{[N]:_(2),[T]:{[N]:"T1",[Z]:_([8])},[Z]:_([6]),[P]:[{[N]:"v",[T]:"T"}],[I]:_(["T","T1"]),[H]:[{[N]:"T1",[A]:-1}]}},{[A]:222,[R]:_(3),[G]:2,[F]:{[N]:_(3),[T]:{[N]:"T2",[Z]:_([9])},[Z]:_([6]),[P]:[{[N]:"v",[T]:"T"}],[I]:_(["T","T2"]),[H]:[{[N]:"T2",[A]:-1}]}}],[E]:[{[A]:266,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:_(0),[Z]:_([10]),[P]:[{[N]:_(11),[T]:_(7),[Z]:_([12])}],[I]:_([0,1,0,2,3])}}],[_(14)]:[{[A]:48,[R]:_(0),[G]:0,[U]:{[N]:_(0),[M]:[{[N]:"a",[T]:"T1",[Z]:_([12])},{[N]:"b",[T]:"T2",[Z]:_([13])}]}}],[_(15)]:_(["T","T1","T2"]),[L]:{[_(1)]:true,[_(2)]:true,[_(3)]:true}};
const data = {
  name: "copy/copy-select-sample-2.wgsl",
  code: _(["@infer ",T," T;\r\n@infer ",T," T1;\r\n@infer ",T," T2;\r\n\r\n",U," ",0," {\r\n  @",12," a: T1,\r\n  @",13," b: T2,\r\n};\r\n\r\n@",6," fn ",1,"(uv: ",7,") -> @",5," T;\r\n\r\n@",6," fn ",2,"(v: T) -> @",8," T1;\r\n@",6," fn ",3,"(v: T) -> @",9," T2;\r\n\r\n@",10,"\r\nfn ",4,"(\r\n  @",12," ",11,": ",7,",\r\n) -> ",0," {\r\n  let ",18," = ",1,"(",11,");\r\n  return ",0,"(\r\n    ",2,"(",18,"),\r\n    ",3,"(",18,"),\r\n  );\r\n}\n"]).join(''),
  hash: 0x1d8a7fa75b665c,
  table,
  shake: [[0,[0,4,7,5,6]],[16,[1,5,7]],[33,[2,6,7]],[48,[3,7]],[127,[4,7]],[180,[5,7]],[222,[6,7]],[266,[7]]],
  tree: decompressAST([[1,0,14],[1,16,31],[1,17,32],[0,15,89],[2,11,23],[3,18,30],[2,16,18],[3,7,19],[2,16,18],[1,11,59],[1,53,92],[1,42,81],[0,44,231],[3,0,9],[2,14,18],[3,9,21],[2,38,50],[2,31,40],[2,29,41],[2,19,26],[2,22,29]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
