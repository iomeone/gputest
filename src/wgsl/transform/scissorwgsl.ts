/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getScissorMin getScissorMax getScissorLoop getScissorLevel link optional export position position select".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([3]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:C,[Z]:_([4])}},{[A]:43,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:C,[Z]:_([4])}},{[A]:86,[R]:_(2),[G]:6,[F]:{[N]:_(2),[T]:C,[Z]:_([5,4])}}],[E]:[{[A]:181,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:C,[Z]:_([6]),[P]:[{[N]:_(7),[T]:C}],[I]:_([0,1,2])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  name: "transform/scissor.wgsl",
  code: _(["@",4," fn ",0,"() -> ",C," {};\r\n@",4," fn ",1,"() -> ",C," {};\r\n@",5," @",4," fn ",2,"() -> ",C," { return ",C,"(0.0, 0.0, 0.0, 0.0); };\r\n\r\n@",6," fn ",3,"(",7,": ",C,") -> ",C," {\r\n\r\n  var smin = ",0,"();\r\n  var smax = ",1,"();\r\n  let sloop = ",2,"();\r\n\r\n  if (HAS_SCISSOR_LOOP) {\r\n    smin = ",9,"(smin, smin + sloop, smin < -sloop);\r\n    smin = ",9,"(smin, smin - sloop, smin > sloop);\r\n    smax = ",9,"(smax, smax + sloop, smax < -sloop);\r\n    smax = ",9,"(smax, smax - sloop, smax > sloop);\r\n  }\r\n\r\n  var pmin = ",7," - smin;\r\n  var pmax = smax - ",7,";\r\n\r\n  if (HAS_SCISSOR_LOOP) {\r\n    pmin = ",9,"(pmin, pmin + sloop, pmin < -sloop);\r\n    pmin = ",9,"(pmin, pmin - sloop, pmin > sloop);\r\n    pmax = ",9,"(pmax, pmax + sloop, pmax < -sloop);\r\n    pmax = ",9,"(pmax, pmax - sloop, pmax > sloop);\r\n  }\r\n\r\n  return ",9,"(pmin, pmax, abs(pmin) > abs(pmax));\r\n};\n"]).join(''),
  hash: 0xbf6ad8c52eeb1,
  table,
  shake: [[0,[0,3]],[43,[1,3]],[86,[2,3]],[181,[3]]],
  tree: decompressAST([[1,0,40],[1,43,83],[4,43,133,2],[1,0,9],[1,10,15],[2,9,23],[0,76,861],[1,0,7],[2,11,26],[2,68,81],[2,31,44],[2,32,46]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getScissorLevel = getSymbol("getScissorLevel");
