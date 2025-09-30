/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getVertex getFacet VertexOutput main infer(T) link u32 optional index vertex vertexIndex builtin(vertex_index) instanceIndex builtin(instance_index) position builtin(position) fragAlpha f32 location(0) fragUV location(1) fragST location(2) fragNormal location(3) fragTangent location(4) fragPosition location(5) fragScissor location(6) fragFacetId location(7) interpolate(flat) locals infers VertexOutput builtin position location".split(' '));
const table = {[S]:_(["T",0,1,2,3]),[W]:_([3]),[X]:[{[A]:18,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:{[N]:"T",[Z]:_([4])},[Z]:_([5]),[P]:[{[N]:"v",[T]:_(6)},{[N]:"i",[T]:_(6)}],[I]:_(["T"]),[H]:[{[N]:"T",[A]:-1}]}},{[A]:75,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:_(6),[Z]:_([7,5]),[P]:[{[N]:_(8),[T]:_(6)}]}}],[E]:[{[A]:527,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(2),[Z]:_([9]),[P]:[{[N]:_(10),[T]:_(6),[Z]:_([11])},{[N]:_(12),[T]:_(6),[Z]:_([13])}],[I]:_([2,0,2,1])}}],[_(34)]:[{[A]:136,[R]:_(2),[G]:0,[U]:{[N]:_(2),[M]:[{[N]:_(14),[T]:C,[Z]:_([15])},{[N]:_(16),[T]:_(17),[Z]:_([18])},{[N]:_(19),[T]:C,[Z]:_([20])},{[N]:_(21),[T]:C,[Z]:_([22])},{[N]:_(23),[T]:C,[Z]:_([24])},{[N]:_(25),[T]:C,[Z]:_([26])},{[N]:_(27),[T]:C,[Z]:_([28])},{[N]:_(29),[T]:C,[Z]:_([30])},{[N]:_(31),[T]:_(6),[Z]:_([32,33])}]}}],[_(35)]:_(["T"]),[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "vertex/virtual-normal.wgsl",
  code: _(["@infer ",T," T;\r\n\r\n@",5," fn ",0,"(v: u32, i: u32) -> @",4," T {};\r\n\r\n@",7," @",5," fn ",1,"(",8,": u32) -> u32 { return 0; };\r\n\r\n",U," ",2," {\r\n  @",37,"(",14,") ",14,": ",C,",\r\n  @",18," ",16,": f32,\r\n  @",20," ",19,": ",C,",\r\n  @",22," ",21,": ",C,",\r\n  @",24," ",23,": ",C,",\r\n  @",26," ",25,": ",C,",\r\n  @",28," ",27,": ",C,",\r\n  @",30," ",29,": ",C,",\r\n  @",32," @",33," ",31,": u32,\r\n};\r\n\r\n@",9,"\r\nfn ",3,"(\r\n  @",37,"(",9,"_",8,") ",9,"Index: u32,\r\n  @",37,"(instance_",8,") ",12,": u32,\r\n) -> ",2," {\r\n  let v = ",0,"(",9,"Index, ",12,");\r\n\r\n  return ",2,"(\r\n    v.",14,",\r\n    v.color.a,\r\n    v.uv,\r\n    v.st,\r\n    v.normal,\r\n    v.tangent,\r\n    v.world,\r\n    v.scissor,\r\n    ",1,"(v.",8,"),\r\n  );\r\n}\n"]).join(''),
  hash: 0xc57023e33bf0d,
  table,
  shake: [[0,[0,1,4]],[18,[1,4]],[75,[2,4]],[136,[3,4]],[527,[4]]],
  tree: decompressAST([[1,0,14],[1,18,70],[4,57,117,2],[1,0,9],[1,10,15],[2,9,17],[0,42,428],[2,11,23],[3,18,36],[3,43,55],[3,32,44],[3,35,47],[3,35,47],[3,39,51],[3,40,52],[3,41,53],[3,40,52],[3,13,31],[0,44,399],[3,0,7],[2,12,16],[3,9,31],[3,44,68],[2,51,63],[2,26,35],[2,51,63],[2,135,143]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
