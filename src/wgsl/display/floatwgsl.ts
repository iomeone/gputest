/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("displayFloat export sample sample".split(' '));
const table = {[S]:_([0]),[W]:_([0]),[E]:[{[A]:0,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:C,[Z]:_([1]),[P]:[{[N]:_(2),[T]:C}]}}]};
const data = {
  name: "display/float.wgsl",
  code: _(["@",1," fn ",0,"(",2,": ",C,") -> ",C," {\r\n  return select(-",2," * .333, ",2,", ",2," > ",C,"(0.0));\r\n};\n"]).join(''),
  hash: 0x662ddeb608257,
  table,
  shake: [[0,[0]]],
  tree: decompressAST([[0,0,127],[1,0,7],[2,11,23]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const displayFloat = getSymbol("displayFloat");
