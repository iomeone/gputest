/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/use/arraywgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSize unpackIndex packIndex ../../wgsl/use/array sizeToModulus4 packIndex4 unpackIndex4 vec4<u32> link export u32 sizeToModulus4 getSize modulus".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([1,2]),[O]:[{[A]:0,[N]:_(3),[S]:_([4,5,6]),[K]:[{[N]:_(4),[J]:_(4)},{[N]:_(5),[J]:_(5)},{[N]:_(6),[J]:_(6)}]}],[X]:[{[A]:76,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(7),[Z]:_([8])}}],[E]:[{[A]:115,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(7),[Z]:_([9]),[P]:[{[N]:"i",[T]:_(10)}],[I]:_([0])}},{[A]:261,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(10),[Z]:_([9]),[P]:[{[N]:"v",[T]:_(7)}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "plot/array.wgsl",
  code: _(["use '",3,"'::{ ",4,", ",2,"4, ",1,"4 }\r\n\r\n@",8," fn ",0,"() -> ",7," {};\r\n\r\n@",9," fn ",1,"(i: u32) -> ",7," {\r\n  let s = ",0,"();\r\n  let ",13," = ",4,"(s);\r\n  return ",1,"4(i, ",13,");\r\n}\r\n\r\n@",9," fn ",2,"(v: ",7,") -> u32 {\r\n  let s = ",0,"();\r\n  let ",13," = ",4,"(s);\r\n  return ",2,"4(v, ",13,");\r\n}\n"]).join(''),
  hash: 0xed73591f72104,
  table,
  shake: [[76,[0,1,2]],[115,[1]],[261,[2]]],
  tree: decompressAST([[1,0,72],[1,76,110],[0,39,181],[1,0,7],[2,11,22],[2,46,53],[2,28,42],[2,29,41],[0,32,170],[1,0,7],[2,11,20],[2,44,51],[2,28,42],[2,29,39]], table[S]),
};

const libs = {"../../wgsl/use/array": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const unpackIndex = getSymbol("unpackIndex");
export const packIndex = getSymbol("packIndex");
