/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getAxisStep getAxisOrigin getAxisPosition link export index u32".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:C,[Z]:_([3])}},{[A]:38,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:C,[Z]:_([3])}}],[E]:[{[A]:80,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:C,[Z]:_([4]),[P]:[{[N]:_(5),[T]:_(6)}],[I]:_([0,1])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "plot/axis.wgsl",
  code: _(["@",3," fn ",0,"() -> ",C,";\r\n@",3," fn ",1,"() -> ",C,";\r\n\r\n@",4," fn ",2,"(",5,": u32) -> ",C," {\r\n  return ",0,"() * f32(",5,") + ",1,"();\r\n}\n"]).join(''),
  hash: 0x199d5a945baab1,
  table,
  shake: [[0,[0,2]],[38,[1,2]],[80,[2]]],
  tree: decompressAST([[1,0,35],[1,38,75],[0,42,154],[1,0,7],[2,11,26],[2,53,64],[2,29,42]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getAxisPosition = getSymbol("getAxisPosition");
