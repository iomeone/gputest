/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("DepthSampleOutput getSample selectDepth selectA selectB main infer(T) link vec2<f32> f32 infer(T1) infer(T2) fragment fragUV location(0) depth builtin(frag_depth) location(1) locals infers DepthSampleOutput location sample".split(' '));
const table = {[S]:_(["T","T1","T2",0,1,2,3,4,5]),[W]:_([5]),[X]:[{[A]:168,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:{[N]:"T",[Z]:_([6])},[Z]:_([7]),[P]:[{[N]:"uv",[T]:_(8)}],[I]:_(["T"]),[H]:[{[N]:"T",[A]:-1}]}},{[A]:221,[R]:_(2),[G]:2,[F]:{[N]:_(2),[T]:_(9),[Z]:_([7]),[P]:[{[N]:"v",[T]:"T"}],[I]:_(["T"])}},{[A]:257,[R]:_(3),[G]:2,[F]:{[N]:_(3),[T]:{[N]:"T1",[Z]:_([10])},[Z]:_([7]),[P]:[{[N]:"v",[T]:"T"}],[I]:_(["T","T1"]),[H]:[{[N]:"T1",[A]:-1}]}},{[A]:299,[R]:_(4),[G]:2,[F]:{[N]:_(4),[T]:{[N]:"T2",[Z]:_([11])},[Z]:_([7]),[P]:[{[N]:"v",[T]:"T"}],[I]:_(["T","T2"]),[H]:[{[N]:"T2",[A]:-1}]}}],[E]:[{[A]:343,[R]:_(5),[G]:1,[F]:{[N]:_(5),[T]:_(0),[Z]:_([12]),[P]:[{[N]:_(13),[T]:_(8),[Z]:_([14])}],[I]:_([0,1,0,2,3,4])}}],[_(18)]:[{[A]:48,[R]:_(0),[G]:0,[U]:{[N]:_(0),[M]:[{[N]:_(15),[T]:_(9),[Z]:_([16])},{[N]:"a",[T]:"T1",[Z]:_([14])},{[N]:"b",[T]:"T2",[Z]:_([17])}]}}],[_(19)]:_(["T","T1","T2"]),[L]:{[_(1)]:true,[_(2)]:true,[_(3)]:true,[_(4)]:true}};
const data = {
  name: "copy/copy-select-depth-sample-2.wgsl",
  code: _(["@infer ",T," T;\r\n@infer ",T," T1;\r\n@infer ",T," T2;\r\n\r\n",U," ",0," {\r\n  @builtin(frag_",15,") ",15,": f32,\r\n  @",14," a: T1,\r\n  @",17," b: T2,\r\n};\r\n\r\n@",7," fn ",1,"(uv: ",8,") -> @",6," T;\r\n\r\n@",7," fn ",2,"(v: T) -> f32;\r\n@",7," fn ",3,"(v: T) -> @",10," T1;\r\n@",7," fn ",4,"(v: T) -> @",11," T2;\r\n\r\n@",12,"\r\nfn ",5,"(\r\n  @",14," ",13,": ",8,",\r\n) -> ",0," {\r\n  let ",22," = ",1,"(",13,");\r\n  return ",0,"(\r\n    ",2,"(",22,"),\r\n    ",3,"(",22,"),\r\n    ",4,"(",22,"),\r\n  );\r\n}\n"]).join(''),
  hash: 0x1a2164f1c3e61a,
  table,
  shake: [[0,[0,4,8,5,6,7]],[16,[1,6,8]],[33,[2,7,8]],[48,[3,8]],[168,[4,8]],[221,[5,8]],[257,[6,8]],[299,[7,8]],[343,[8]]],
  tree: decompressAST([[1,0,14],[1,16,31],[1,17,32],[0,15,130],[2,11,28],[3,23,43],[3,36,48],[2,16,18],[3,7,19],[2,16,18],[1,11,59],[1,53,86],[1,36,75],[1,42,81],[0,44,267],[3,0,9],[2,14,18],[3,9,21],[2,38,55],[2,36,45],[2,29,46],[2,24,35],[2,26,33],[2,22,29]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
