/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/typeswgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getVertex getPicking VertexOutput main ../../../wgsl/use/types PickVertex link u32 vec2<u32> optional vertex vertexIndex builtin(vertex_index) instanceIndex builtin(instance_index) position builtin(position) fragScissor location(0) fragUV vec2<f32> location(1) fragId location(2) interpolate(flat) fragIndex location(3) locals VertexOutput builtin position location".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([3]),[O]:[{[A]:0,[N]:_(4),[S]:_([5]),[K]:[{[N]:_(5),[J]:_(5)}]}],[X]:[{[A]:50,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(5),[Z]:_([6]),[P]:[{[N]:"v",[T]:_(7)},{[N]:"i",[T]:_(7)}]}},{[A]:104,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:_(8),[Z]:_([9,6]),[P]:[{[N]:"i",[T]:_(7)}]}}],[E]:[{[A]:435,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(2),[Z]:_([10]),[P]:[{[N]:_(11),[T]:_(7),[Z]:_([12])},{[N]:_(13),[T]:_(7),[Z]:_([14])}],[I]:_([2,0,1,2])}}],[_(27)]:[{[A]:185,[R]:_(2),[G]:0,[U]:{[N]:_(2),[M]:[{[N]:_(15),[T]:C,[Z]:_([16])},{[N]:_(17),[T]:C,[Z]:_([18])},{[N]:_(19),[T]:_(20),[Z]:_([21])},{[N]:_(22),[T]:_(7),[Z]:_([23,24])},{[N]:_(25),[T]:_(7),[Z]:_([26,24])}]}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "vertex/virtual-pick.wgsl",
  code: _(["use '",4,"'::{ ",5," };\r\n\r\n@",6," fn ",0,"(v: u32, i: u32) -> ",5," {};\r\n@",9," @",6," fn ",1,"(i: u32) -> ",8," { return ",8,"(0u, 0u); };\r\n\r\n",U," ",2," {\r\n  @",29,"(",15,") ",15,": ",C,",\r\n  @",18," ",17,": ",C,",\r\n  @",21," ",19,": ",20,",\r\n  @",23," @",24," ",22,": u32,\r\n  @",26," @",24," ",25,": u32,\r\n};\r\n\r\n@",10,"\r\nfn ",3,"(\r\n  @",29,"(",10,"_index) ",10,"Index: u32,\r\n  @",14," ",13,": u32,\r\n) -> ",2," {\r\n  var v = ",0,"(",10,"Index, ",13,");\r\n  var p = ",1,"(v.index);\r\n\r\n  return ",2,"(\r\n    v.",15,",\r\n    v.scissor,\r\n    v.uv.xy,\r\n    p.x,\r\n    p.y,\r\n  );\r\n}\n"]).join(''),
  hash: 0x396b1ece199ab,
  table,
  shake: [[50,[0,3]],[104,[1,3]],[185,[2,3]],[435,[3]]],
  tree: decompressAST([[1,0,45],[1,50,101],[4,54,134,1],[1,0,9],[1,10,15],[2,9,19],[0,62,307],[2,11,23],[3,18,36],[3,43,55],[3,40,52],[3,35,47],[3,13,31],[3,35,47],[3,13,31],[0,42,356],[3,0,7],[2,12,16],[3,9,31],[3,44,68],[2,51,63],[2,26,35],[2,50,60],[2,33,45]], table[S]),
};

const libs = {"../../../wgsl/use/types": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
