/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("DepthSampleOutput getDepth getSample main f32 link vec2<f32> infer(T) fragment fragUV location(0) depth builtin(frag_depth) sample locals infers DepthSampleOutput fragUV".split(' '));
const table = {[S]:_(["T",0,1,2,3]),[W]:_([3]),[X]:[{[A]:115,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:_(4),[Z]:_([5]),[P]:[{[N]:"uv",[T]:_(6)}]}},{[A]:157,[R]:_(2),[G]:2,[F]:{[N]:_(2),[T]:{[N]:"T",[Z]:_([7])},[Z]:_([5]),[P]:[{[N]:"uv",[T]:_(6)}],[I]:_(["T"]),[H]:[{[N]:"T",[A]:-1}]}}],[E]:[{[A]:210,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(0),[Z]:_([8]),[P]:[{[N]:_(9),[T]:_(6),[Z]:_([10])}],[I]:_([0,0,1,2])}}],[_(14)]:[{[A]:14,[R]:_(0),[G]:0,[U]:{[N]:_(0),[M]:[{[N]:_(11),[T]:_(4),[Z]:_([12])},{[N]:_(13),[T]:"T",[Z]:_([10])}]}}],[_(15)]:_(["T"]),[L]:{[_(1)]:true,[_(2)]:true}};
const data = {
  name: "copy/copy-depth-sample.wgsl",
  code: _(["@infer ",T," T;\r\n\r\n",U," ",0," {\r\n  @builtin(frag_",11,") ",11,": f32,\r\n  @",10," ",13,": T,\r\n};\r\n\r\n@",5," fn ",1,"(uv: ",6,") -> f32;\r\n@",5," fn ",2,"(uv: ",6,") -> @",7," T;\r\n\r\n@",8,"\r\nfn ",3,"(\r\n  @",10," ",9,": ",6,",\r\n) -> ",0," {\r\n  return ",0,"(\r\n    ",1,"(",9,"),\r\n    ",2,"(",9,"),\r\n  );\r\n}\n"]).join(''),
  hash: 0x14eabc608cfa94,
  table,
  shake: [[0,[0,3,4]],[14,[1,4]],[115,[2,4]],[157,[3,4]],[210,[4]]],
  tree: decompressAST([[1,0,14],[0,14,110],[2,11,28],[3,23,43],[3,36,48],[2,21,22],[1,10,49],[1,42,90],[0,53,218],[3,0,9],[2,14,18],[3,9,21],[2,38,55],[2,30,47],[2,24,32],[2,23,32]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
