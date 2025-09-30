/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
import m0 from "../../../wgsl/use/typeswgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getVertex toColorSpace VertexOutput main ../../../wgsl/use/types ShadedVertex link u32 optional vertex vertexIndex builtin(vertex_index) instanceIndex builtin(instance_index) position builtin(position) fragColor location(0) fragUV location(1) fragST location(2) fragNormal location(3) fragTangent location(4) fragPosition location(5) fragScissor location(6) locals VertexOutput builtin position location".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([3]),[O]:[{[A]:0,[N]:_(4),[S]:_([5]),[K]:[{[N]:_(5),[J]:_(5)}]}],[X]:[{[A]:52,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(5),[Z]:_([6]),[P]:[{[N]:"v",[T]:_(7)},{[N]:"i",[T]:_(7)}]}},{[A]:108,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:C,[Z]:_([8,6]),[P]:[{[N]:"c",[T]:C}]}}],[E]:[{[A]:524,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(2),[Z]:_([9]),[P]:[{[N]:_(10),[T]:_(7),[Z]:_([11])},{[N]:_(12),[T]:_(7),[Z]:_([13])}],[I]:_([2,0,2,1])}}],[_(30)]:[{[A]:180,[R]:_(2),[G]:0,[U]:{[N]:_(2),[M]:[{[N]:_(14),[T]:C,[Z]:_([15])},{[N]:_(16),[T]:C,[Z]:_([17])},{[N]:_(18),[T]:C,[Z]:_([19])},{[N]:_(20),[T]:C,[Z]:_([21])},{[N]:_(22),[T]:C,[Z]:_([23])},{[N]:_(24),[T]:C,[Z]:_([25])},{[N]:_(26),[T]:C,[Z]:_([27])},{[N]:_(28),[T]:C,[Z]:_([29])}]}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "vertex/virtual-shaded.wgsl",
  code: _(["use '",4,"'::{ ",5," };\r\n\r\n@",6," fn ",0,"(v: u32, i: u32) -> ",5," {};\r\n@",8," @",6," fn ",1,"(c: ",C,") -> ",C," { return c; }\r\n\r\n",U," ",2," {\r\n  @",32,"(",14,") ",14,": ",C,",\r\n  @",17," ",16,": ",C,",\r\n  @",19," ",18,": ",C,",\r\n  @",21," ",20,": ",C,",\r\n  @",23," ",22,": ",C,",\r\n  @",25," ",24,": ",C,",\r\n  @",27," ",26,": ",C,",\r\n  @",29," ",28,": ",C,",\r\n};\r\n\r\n@",9,"\r\nfn ",3,"(\r\n  @",32,"(",9,"_index) ",9,"Index: u32,\r\n  @",13," ",12,": u32,\r\n) -> ",2," {\r\n  let v = ",0,"(",9,"Index, ",12,");\r\n\r\n  return ",2,"(\r\n    v.",14,",\r\n    ",1,"(v.color),\r\n    v.uv,\r\n    v.st,\r\n    v.normal,\r\n    v.tangent,\r\n    v.world,\r\n    v.scissor,\r\n  );\r\n}\n"]).join(''),
  hash: 0x1ace2ea28caaee,
  table,
  shake: [[52,[0,3]],[108,[1,3]],[180,[2,3]],[524,[3]]],
  tree: decompressAST([[1,0,47],[1,52,105],[4,56,128,1],[1,0,9],[1,10,15],[2,9,21],[0,53,392],[2,11,23],[3,18,36],[3,43,55],[3,38,50],[3,35,47],[3,35,47],[3,39,51],[3,40,52],[3,41,53],[0,44,387],[3,0,7],[2,12,16],[3,9,31],[3,44,68],[2,51,63],[2,26,35],[2,51,63],[2,36,48]], table[S]),
};

const libs = {"../../../wgsl/use/types": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
