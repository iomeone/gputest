/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("DepthSampleOutput getSample selectDepth selectSample main infer(T) link vec2<f32> f32 infer(T1) fragment fragUV location(0) depth builtin(frag_depth) sample locals infers DepthSampleOutput sample".split(' '));
const table = {[S]:_(["T","TS",0,1,2,3,4]),[W]:_([4]),[X]:[{[A]:132,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:{[N]:"T",[Z]:_([5])},[Z]:_([6]),[P]:[{[N]:"uv",[T]:_(7)}],[I]:_(["T"]),[H]:[{[N]:"T",[A]:-1}]}},{[A]:185,[R]:_(2),[G]:2,[F]:{[N]:_(2),[T]:_(8),[Z]:_([6]),[P]:[{[N]:"v",[T]:"T"}],[I]:_(["T"])}},{[A]:221,[R]:_(3),[G]:2,[F]:{[N]:_(3),[T]:{[N]:"TS",[Z]:_([9])},[Z]:_([6]),[P]:[{[N]:"v",[T]:"T"}],[I]:_(["T","TS"]),[H]:[{[N]:"T1",[A]:-1}]}}],[E]:[{[A]:270,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:_(0),[Z]:_([10]),[P]:[{[N]:_(11),[T]:_(7),[Z]:_([12])}],[I]:_([0,1,0,2,3])}}],[_(16)]:[{[A]:31,[R]:_(0),[G]:0,[U]:{[N]:_(0),[M]:[{[N]:_(13),[T]:_(8),[Z]:_([14])},{[N]:_(15),[T]:"T",[Z]:_([12])}]}}],[_(17)]:_(["T","TS"]),[L]:{[_(1)]:true,[_(2)]:true,[_(3)]:true}};
const data = {
  name: "copy/copy-select-depth-sample.wgsl",
  code: _(["@infer ",T," T;\r\n@infer ",T," TS;\r\n\r\n",U," ",0," {\r\n  @builtin(frag_",13,") ",13,": f32,\r\n  @",12," ",15,": T,\r\n};\r\n\r\n@",6," fn ",1,"(uv: ",7,") -> @",5," T;\r\n\r\n@",6," fn ",2,"(v: T) -> f32;\r\n@",6," fn ",3,"(v: T) -> @",9," TS;\r\n\r\n@",10,"\r\nfn ",4,"(\r\n  @",12," ",11,": ",7,",\r\n) -> ",0," {\r\n  let ",15," = ",1,"(",11,");\r\n  return ",0,"(\r\n    ",2,"(",15,"),\r\n    ",3,"(",15,"),\r\n  );\r\n}\n"]).join(''),
  hash: 0x165ff3336eda9f,
  table,
  shake: [[0,[0,3,6,4,5]],[16,[1,5,6]],[31,[2,6]],[132,[3,6]],[185,[4,6]],[221,[5,6]],[270,[6]]],
  tree: decompressAST([[1,0,14],[1,16,31],[0,15,111],[2,11,28],[3,23,43],[3,36,48],[2,21,22],[1,10,58],[1,53,86],[1,36,80],[0,49,255],[3,0,9],[2,14,18],[3,9,21],[2,38,55],[2,36,45],[2,29,46],[2,24,35],[2,26,38]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
