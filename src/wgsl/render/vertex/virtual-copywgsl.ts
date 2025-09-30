/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
import m0 from "../../../wgsl/use/typeswgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getVertex VertexOutput main ../../../wgsl/use/types SolidVertex Vertex link u32 vertex vertexIndex builtin(vertex_index) instanceIndex builtin(instance_index) position builtin(position) fragUV vec2<f32> location(0) locals VertexOutput builtin position".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[O]:[{[A]:0,[N]:_(3),[S]:_([4]),[K]:[{[N]:_(4),[J]:_(4)}]}],[X]:[{[A]:51,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(5),[Z]:_([6]),[P]:[{[N]:"v",[T]:_(7)},{[N]:"i",[T]:_(7)}]}}],[E]:[{[A]:210,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(1),[Z]:_([8]),[P]:[{[N]:_(9),[T]:_(7),[Z]:_([10])},{[N]:_(11),[T]:_(7),[Z]:_([12])}],[I]:_([1,0,1])}}],[_(18)]:[{[A]:99,[R]:_(1),[G]:0,[U]:{[N]:_(1),[M]:[{[N]:_(13),[T]:C,[Z]:_([14])},{[N]:_(15),[T]:_(16),[Z]:_([17])}]}}],[L]:{[_(0)]:true}};
const data = {
  name: "vertex/virtual-copy.wgsl",
  code: _(["use '",3,"'::{ ",4," };\r\n\r\n@",6," fn ",0,"(v: u32, i: u32) -> ",5," {};\r\n\r\n",U," ",1," {\r\n  @",20,"(",13,") ",13,": ",C,",\r\n  @",17," ",15,": ",16,",\r\n};\r\n\r\n@",8,"\r\nfn ",2,"(\r\n  @",20,"(",8,"_index) ",8,"Index: u32,\r\n  @",12," ",11,": u32,\r\n) -> ",1," {\r\n  let v = ",0,"(",8,"Index, ",11,");\r\n\r\n  return ",1,"(\r\n    v.",13,",\r\n    v.uv.xy,\r\n  );\r\n}\n"]).join(''),
  hash: 0xcde3af9c311e9,
  table,
  shake: [[51,[0,2]],[99,[1,2]],[210,[2]]],
  tree: decompressAST([[1,0,46],[1,51,98],[0,48,154],[2,11,23],[3,18,36],[3,43,55],[0,39,285],[3,0,7],[2,12,16],[3,9,31],[3,44,68],[2,51,63],[2,26,35],[2,51,63]], table[S]),
};

const libs = {"../../../wgsl/use/types": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
