/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getVertex loadInstance getMappedInstance getInstancedVertex infer(T) link vertexIndex u32 instanceIndex void vec2<u32> optional export infers vertexIndex instanceIndex elementIndex mappedIndex".split(' '));
const table = {[S]:_(["T",0,1,2,3]),[W]:_([3]),[X]:[{[A]:18,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:{[N]:"T",[Z]:_([4])},[Z]:_([5]),[P]:[{[N]:_(6),[T]:_(7)},{[N]:_(8),[T]:_(7)}],[I]:_(["T"]),[H]:[{[N]:"T",[A]:-1}]}},{[A]:92,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:_(9),[Z]:_([5]),[P]:[{[N]:"i",[T]:_(7)}]}},{[A]:130,[R]:_(2),[G]:6,[F]:{[N]:_(2),[T]:_(10),[Z]:_([11,5]),[P]:[{[N]:"v",[T]:_(7)},{[N]:"i",[T]:_(7)}]}}],[E]:[{[A]:228,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:"T",[Z]:_([12]),[P]:[{[N]:_(6),[T]:_(7)},{[N]:_(8),[T]:_(7)}],[I]:_(["T",2,1,0])}}],[_(13)]:_(["T"]),[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  name: "vertex/instanced.wgsl",
  code: _(["@infer ",T," T;\r\n\r\n@",5," fn ",0,"(",6,": u32, ",8,": u32) -> @",4," T;\r\n@",5," fn ",1,"(i: u32) { };\r\n\r\n@",11," @",5," fn ",2,"(v: u32, i: u32) -> ",10," { return ",10,"(i, i); };\r\n\r\n@",12," fn ",3,"(",6,": u32, ",8,": u32) -> T {\r\n  var ",16,": u32;\r\n\r\n  if (HAS_INSTANCES) {\r\n    let ",17," = ",2,"(",6,", ",8,");\r\n    ",16," = ",17,".x;\r\n\r\n    let uniformIndex = ",17,".y;\r\n    ",1,"(uniformIndex);\r\n  }\r\n  else {\r\n    ",16," = ",8,";\r\n  }\r\n\r\n  return ",0,"(",6,", ",16,");\r\n};\n"]).join(''),
  hash: 0xf889c81086e39,
  table,
  shake: [[0,[0,1,4]],[18,[1,4]],[92,[2,4]],[130,[3,4]],[228,[4]]],
  tree: decompressAST([[1,0,14],[1,18,89],[1,74,107],[4,38,131,3],[1,0,9],[1,10,15],[2,9,26],[0,79,492],[1,0,7],[2,11,29],[2,60,61],[2,79,96],[2,128,140],[2,95,104]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getInstancedVertex = getSymbol("getInstancedVertex");
