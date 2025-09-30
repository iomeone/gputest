/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/typeswgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getVertex VertexOutput VertexOutputWithDepth main mainWithDepth ../../../wgsl/use/types SolidVertex link u32 vertex vertexIndex builtin(vertex_index) instanceIndex builtin(instance_index) export position builtin(position) fragAlpha f32 location(0) fragUV location(1) fragST location(2) fragScissor location(3) fragPosition location(4) locals getVertex VertexOutput builtin position location VertexOutputWithDepth vertexIndex instanceIndex".split(' '));
const table = {[S]:_([0,1,2,3,4]),[W]:_([3,4]),[O]:[{[A]:0,[N]:_(5),[S]:_([6]),[K]:[{[N]:_(6),[J]:_(6)}]}],[X]:[{[A]:51,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(6),[Z]:_([7]),[P]:[{[N]:"v",[T]:_(8)},{[N]:"i",[T]:_(8)}]}}],[E]:[{[A]:586,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(1),[Z]:_([9]),[P]:[{[N]:_(10),[T]:_(8),[Z]:_([11])},{[N]:_(12),[T]:_(8),[Z]:_([13])}],[I]:_([1,0,1])}},{[A]:876,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:_(2),[Z]:_([9,14]),[P]:[{[N]:_(10),[T]:_(8),[Z]:_([11])},{[N]:_(12),[T]:_(8),[Z]:_([13])}],[I]:_([2,0,2])}}],[_(28)]:[{[A]:104,[R]:_(1),[G]:0,[U]:{[N]:_(1),[M]:[{[N]:_(15),[T]:C,[Z]:_([16])},{[N]:_(17),[T]:_(18),[Z]:_([19])},{[N]:_(20),[T]:C,[Z]:_([21])},{[N]:_(22),[T]:C,[Z]:_([23])},{[N]:_(24),[T]:C,[Z]:_([25])}]}},{[A]:318,[R]:_(2),[G]:0,[U]:{[N]:_(2),[M]:[{[N]:_(15),[T]:C,[Z]:_([16])},{[N]:_(17),[T]:_(18),[Z]:_([19])},{[N]:_(20),[T]:C,[Z]:_([21])},{[N]:_(22),[T]:C,[Z]:_([23])},{[N]:_(26),[T]:C,[Z]:_([25])},{[N]:_(24),[T]:C,[Z]:_([27])}]}}],[L]:{[_(0)]:true}};
const data = {
  name: "vertex/virtual-depth.wgsl",
  code: _(["use '",5,"'::{ ",6," };\r\n\r\n@",7," fn ",0,"(v: u32, i: u32) -> ",6," {};\r\n\r\n",U," ",1," {\r\n  @",31,"(",15,") ",15,": ",C,",\r\n  @",19," ",17,": f32,\r\n  @",21," ",20,": ",C,",\r\n  @",23," ",22,": ",C,",\r\n  @",25," ",24,": ",C,",\r\n};\r\n\r\n",U," ",1,"WithDepth {\r\n  @",31,"(",15,") ",15,": ",C,",\r\n  @",19," ",17,": f32,\r\n  @",21," ",20,": ",C,",\r\n  @",23," ",22,": ",C,",\r\n  @",25," ",26,": ",C,",\r\n  @",27," ",24,": ",C,",\r\n};\r\n\r\n@",9,"\r\nfn ",3,"(\r\n  @",31,"(",9,"_index) ",9,"Index: u32,\r\n  @",13," ",12,": u32,\r\n) -> ",1," {\r\n  let v = ",0,"(",9,"Index, ",12,");\r\n\r\n  return ",1,"(\r\n    v.",15,",\r\n    v.color.a,\r\n    v.uv,\r\n    v.st,\r\n    v.scissor,\r\n  );\r\n}\r\n\r\n@",9,"\r\n@",14," fn ",3,"WithDepth(\r\n  @",31,"(",9,"_index) ",9,"Index: u32,\r\n  @",13," ",12,": u32,\r\n) -> ",1,"WithDepth {\r\n  let v = ",0,"(",9,"Index, ",12,");\r\n\r\n  return ",1,"WithDepth(\r\n    v.",15,",\r\n    v.color.a,\r\n    v.uv,\r\n    v.st,\r\n    v.world,\r\n    v.scissor,\r\n  );\r\n}\n"]).join(''),
  hash: 0x32fe3538191ec,
  table,
  shake: [[51,[0,3,4]],[104,[1,3]],[318,[2,4]],[586,[3]],[876,[4]]],
  tree: decompressAST([[1,0,46],[1,51,103],[0,53,266],[2,11,23],[3,18,36],[3,43,55],[3,32,44],[3,35,47],[3,35,47],[0,40,303],[2,11,32],[3,27,45],[3,43,55],[3,32,44],[3,35,47],[3,35,47],[3,41,53],[0,44,330],[3,0,7],[2,12,16],[3,9,31],[3,44,68],[2,51,63],[2,26,35],[2,51,63],[0,97,432],[3,0,7],[1,9,16],[2,11,24],[3,18,40],[3,44,68],[2,51,72],[2,35,44],[2,51,72]], table[S]),
};

const libs = {"../../../wgsl/use/types": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
export const mainWithDepth = getSymbol("mainWithDepth");
