/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/typeswgsl";
import m1 from "../../../wgsl/use/colorwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getVertex toColorSpace VertexOutput main ../../../wgsl/use/types SolidVertex ../../../wgsl/use/color premultiply link u32 optional vertex vertexIndex builtin(vertex_index) instanceIndex builtin(instance_index) position builtin(position) fragColor location(0) fragUV location(1) fragST location(2) fragScissor location(3) locals VertexOutput builtin position location".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([3]),[O]:[{[A]:0,[N]:_(4),[S]:_([5]),[K]:[{[N]:_(5),[J]:_(5)}]},{[A]:0,[N]:_(6),[S]:_([7]),[K]:[{[N]:_(7),[J]:_(7)}]}],[X]:[{[A]:100,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(5),[Z]:_([8]),[P]:[{[N]:"v",[T]:_(9)},{[N]:"i",[T]:_(9)}]}},{[A]:155,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:C,[Z]:_([10,8]),[P]:[{[N]:"c",[T]:C}]}}],[E]:[{[A]:451,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(2),[Z]:_([11]),[P]:[{[N]:_(12),[T]:_(9),[Z]:_([13])},{[N]:_(14),[T]:_(9),[Z]:_([15])}],[I]:_([2,0,2,1])}}],[_(26)]:[{[A]:227,[R]:_(2),[G]:0,[U]:{[N]:_(2),[M]:[{[N]:_(16),[T]:C,[Z]:_([17])},{[N]:_(18),[T]:C,[Z]:_([19])},{[N]:_(20),[T]:C,[Z]:_([21])},{[N]:_(22),[T]:C,[Z]:_([23])},{[N]:_(24),[T]:C,[Z]:_([25])}]}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "vertex/virtual-solid.wgsl",
  code: _(["use '",4,"'::{ ",5," };\r\nuse '",6,"'::{ ",7," };\r\n\r\n@",8," fn ",0,"(v: u32, i: u32) -> ",5," {};\r\n@",10," @",8," fn ",1,"(c: ",C,") -> ",C," { return c; }\r\n\r\n",U," ",2," {\r\n  @",28,"(",16,") ",16,": ",C,",\r\n  @",19," ",18,": ",C,",\r\n  @",21," ",20,": ",C,",\r\n  @",23," ",22,": ",C,",\r\n  @",25," ",24,": ",C,",\r\n};\r\n\r\n@",11,"\r\nfn ",3,"(\r\n  @",28,"(",11,"_index) ",11,"Index: u32,\r\n  @",15," ",14,": u32,\r\n) -> ",2," {\r\n  let v = ",0,"(",11,"Index, ",14,");\r\n\r\n  return ",2,"(\r\n    v.",16,",\r\n    ",1,"(v.color),\r\n    v.uv,\r\n    v.st,\r\n    v.scissor,\r\n  );\r\n}\n"]).join(''),
  hash: 0x157e43a0bce0fd,
  table,
  shake: [[100,[0,3]],[155,[1,3]],[227,[2,3]],[451,[3]]],
  tree: decompressAST([[1,0,46],[1,49,95],[1,51,103],[4,55,127,1],[1,0,9],[1,10,15],[2,9,21],[0,53,272],[2,11,23],[3,18,36],[3,43,55],[3,38,50],[3,35,47],[3,35,47],[0,44,342],[3,0,7],[2,12,16],[3,9,31],[3,44,68],[2,51,63],[2,26,35],[2,51,63],[2,36,48]], table[S]),
};

const libs = {"../../../wgsl/use/types": m0, "../../../wgsl/use/color": m1};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
