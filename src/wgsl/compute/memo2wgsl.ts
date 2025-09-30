/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/use/arraywgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSize getSample setSample memoSample ../../wgsl/use/array packIndex2 sizeToModulus2 vec2<u32> link u32 void infer(T) compute export globalId vec3<u32> builtin(global_invocation_id)".split(' '));
const table = {[S]:_([0,"T",1,2,3]),[W]:_([3]),[O]:[{[A]:0,[N]:_(4),[S]:_([5,6]),[K]:[{[N]:_(5),[J]:_(5)},{[N]:_(6),[J]:_(6)}]}],[X]:[{[A]:63,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(7),[Z]:_([8])}},{[A]:118,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:"T",[Z]:_([8]),[P]:[{[N]:"i",[T]:_(9)}],[I]:_(["T"])}},{[A]:152,[R]:_(2),[G]:2,[F]:{[N]:_(2),[T]:_(10),[Z]:_([8]),[P]:[{[N]:"i",[T]:_(9)},{[N]:"v",[T]:"T",[Z]:_([11])}],[I]:_(["T"]),[H]:[{[N]:"T",[A]:1}]}}],[E]:[{[A]:199,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(10),[Z]:_([12,"workgroup_size(8, 8)",13]),[P]:[{[N]:_(14),[T]:_(15),[Z]:_([16])}],[I]:_([0,2,1])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  name: "compute/memo2.wgsl",
  code: _(["use '",4,"'::{ ",5,", ",6," };\r\n\r\n@",8," fn ",0,"() -> ",7," {};\r\n\r\n@infer ",T," T;\r\n@",8," fn ",1,"(i: u32) -> T;\r\n@",8," fn ",2,"(i: u32, @",11," v: T);\r\n\r\n@",12," @workgroup_size(8, 8)\r\n@",13," fn ",3,"(\r\n  @",16," ",14,": ",15,",\r\n) {\r\n  let size = ",0,"();\r\n  let xy = ",7,"(",14,".xy);\r\n  if (any(xy >= size)) { return; }\r\n\r\n  let m = ",6,"(size);\r\n  let i = ",5,"(xy, m);\r\n  ",2,"(i, ",1,"(i));\r\n}\n"]).join(''),
  hash: 0x10ccd0314a8e8e,
  table,
  shake: [[63,[0,4]],[102,[1,2,4,3]],[118,[2,4]],[152,[3,4]],[199,[4]]],
  tree: decompressAST([[1,0,58],[1,63,97],[1,39,53],[1,16,47],[1,34,76],[0,47,357],[3,0,8],[3,9,30],[1,23,30],[2,11,21],[3,15,45],[2,71,78],[2,96,110],[2,33,43],[2,22,31],[2,13,22]], table[S]),
};

const libs = {"../../wgsl/use/array": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const memoSample = getSymbol("memoSample");
