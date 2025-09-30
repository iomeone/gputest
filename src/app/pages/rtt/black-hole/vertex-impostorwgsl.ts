/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getPosition getCenter getSize getImpostorVertex link u32 export".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([3]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:C,[Z]:_([4]),[P]:[{[N]:"i",[T]:_(5)}]}},{[A]:44,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:D,[Z]:_([4])}},{[A]:80,[R]:_(2),[G]:2,[F]:{[N]:_(2),[T]:D,[Z]:_([4])}}],[E]:[{[A]:183,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:C,[Z]:_([6]),[P]:[{[N]:"i",[T]:_(5)}],[I]:_([0,1,2])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  name: "black-hole/vertex-impostor.wgsl",
  code: _(["@",4," fn ",0,"(i: u32) -> ",C,";\r\n@",4," fn ",1,"() -> ",D,";\r\n@",4," fn ",2,"() -> ",D,";\r\n\r\n// Transform a unit size impostor (-1..1) to the right dimensions\r\n@",6," fn ",3,"(i: u32) -> ",C," {\r\n  let p = ",0,"(i);\r\n  let c = ",1,"();\r\n  let s = ",2,"();\r\n\r\n  return ",C,"(p.xyz * s + c, 1.0);\r\n};\n"]).join(''),
  hash: 0x796da3667de65,
  table,
  shake: [[0,[0,3]],[44,[1,3]],[80,[2,3]],[183,[3]]],
  tree: decompressAST([[1,0,41],[1,44,77],[1,36,67],[0,103,273],[1,0,7],[2,11,28],[2,52,63],[2,27,36],[2,24,31]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getImpostorVertex = getSymbol("getImpostorVertex");
