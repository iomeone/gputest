/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getInstanceIndex getInstanceLookupIndex u32 link vec2<u32> export vertexIndex instanceIndex instanceIndex elementIndex uniformIndex".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(2),[Z]:_([3]),[P]:[{[N]:"i",[T]:_(2)}]}}],[E]:[{[A]:48,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(4),[Z]:_([5]),[P]:[{[N]:_(6),[T]:_(2)},{[N]:_(7),[T]:_(2)}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "index/lookup.wgsl",
  code: _(["@",3," fn ",0,"(i: u32) -> u32 {};\r\n\r\n@",5," fn ",1,"(",6,": u32, ",7,": u32) -> ",4," {\r\n  var ",9,": u32;\r\n  var ",10,": u32;\r\n\r\n  ",9," = ",7,";\r\n  ",10," = ",0,"(",7,");\r\n\r\n  return ",4,"(",9,", ",10,");\r\n};\n"]).join(''),
  hash: 0x18d0e7495703b0,
  table,
  shake: [[0,[0,1]],[48,[1]]],
  tree: decompressAST([[1,0,43],[0,48,326],[1,0,7],[2,11,33],[2,181,197]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getInstanceLookupIndex = getSymbol("getInstanceLookupIndex");
