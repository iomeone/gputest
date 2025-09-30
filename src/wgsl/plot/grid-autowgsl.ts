/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
import m0 from "../../wgsl/use/viewwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("transformPosition getGridAutoState ../../wgsl/use/view getViewPosition optional link bool export base shift transformPosition".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[O]:[{[A]:0,[N]:_(2),[S]:_([3]),[K]:[{[N]:_(3),[J]:_(3)}]}],[X]:[{[A]:51,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:C,[Z]:_([4,5]),[P]:[{[N]:"p",[T]:C}]}}],[E]:[{[A]:133,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(6),[Z]:_([7]),[P]:[{[N]:_(8),[T]:C},{[N]:_(9),[T]:C}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "plot/grid-auto.wgsl",
  code: _(["use '",2,"'::{ ",3," };\r\n\r\n@",4," @",5," fn ",0,"(p: ",C,") -> ",C," { return p; };\r\n\r\n@",7," fn ",1,"(",8,": ",C,", ",9,": ",C,") -> ",6," {\r\n  let v = ",3,"().xyz;\r\n\r\n  let p1 = ",0,"(",8,").xyz;\r\n  let p2 = ",0,"(",8," + ",9," * 0.001).xyz;\r\n\r\n  let n = p2 - p1;\r\n  let d = dot(v - p1, n);\r\n  return d > 0;\r\n}\n"]).join(''),
  hash: 0x16ba6dbd0ae3bb,
  table,
  shake: [[51,[0,1]],[133,[1]]],
  tree: decompressAST([[1,0,46],[4,51,128,0],[1,0,9],[1,10,15],[2,9,26],[0,63,338],[1,0,7],[2,11,27],[2,73,88],[2,37,54],[2,41,58]], table[S]),
};

const libs = {"../../wgsl/use/view": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getGridAutoState = getSymbol("getGridAutoState");
