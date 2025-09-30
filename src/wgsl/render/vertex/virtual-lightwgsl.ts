/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/typeswgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getVertex VertexOutput main ../../../wgsl/use/types LightVertex link u32 vertex vertexIndex builtin(vertex_index) instanceIndex builtin(instance_index) position builtin(position) lightIndex location(0) interpolate(flat) locals VertexOutput builtin position".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[O]:[{[A]:0,[N]:_(3),[S]:_([4]),[K]:[{[N]:_(4),[J]:_(4)}]}],[X]:[{[A]:51,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(4),[Z]:_([5]),[P]:[{[N]:"i",[T]:_(6)}]}}],[E]:[{[A]:300,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(1),[Z]:_([7]),[P]:[{[N]:_(8),[T]:_(6),[Z]:_([9])},{[N]:_(10),[T]:_(6),[Z]:_([11])}],[I]:_([1,0,1])}}],[_(17)]:[{[A]:96,[R]:_(1),[G]:0,[U]:{[N]:_(1),[M]:[{[N]:_(12),[T]:C,[Z]:_([13])},{[N]:_(14),[T]:_(6),[Z]:_([15,16])}]}}],[L]:{[_(0)]:true}};
const data = {
  name: "vertex/virtual-light.wgsl",
  code: _(["use '",3,"'::{ ",4," };\r\n\r\n@",5," fn ",0,"(i: u32) -> ",4," {};\r\n//@optional @",5," fn toColorSpace(c: ",C,") -> ",C," { return c; }\r\n\r\n",U," ",1," {\r\n  @",19,"(",12,") ",12,": ",C,",\r\n  @",15," @",16," ",14,": u32,\r\n};\r\n\r\n@",7,"\r\nfn ",2,"(\r\n  @",19,"(",7,"_index) ",7,"Index: u32,\r\n  @",11," ",10,": u32,\r\n) -> ",1," {\r\n  let v = ",0,"(",7,"Index, ",10,");\r\n  let p = v.",12,";\r\n\r\n  return ",1,"(\r\n    p,\r\n    v.index,\r\n  );\r\n}\n"]).join(''),
  hash: 0x17037bb9291d60,
  table,
  shake: [[51,[0,2]],[96,[1,2]],[300,[2]]],
  tree: decompressAST([[1,0,46],[1,51,95],[0,45,244],[2,87,99],[3,18,36],[3,43,55],[3,13,31],[0,43,303],[3,0,7],[2,12,16],[3,9,31],[3,44,68],[2,51,63],[2,26,35],[2,74,86]], table[S]),
};

const libs = {"../../../wgsl/use/types": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
