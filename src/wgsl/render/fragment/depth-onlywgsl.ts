/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/fragment/bayerwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getDepth getScissor main ../../../wgsl/fragment/bayer bayer4x4f infer(T) link alpha f32 position optional color scissor builtin(frag_depth) fragment fragCoord builtin(position) fragAlpha location(0) fragUV location(1) fragST location(2) fragPosition location(3) fragScissor location(4) infers fragment location outColor".split(' '));
const table = {[S]:_(["T",0,1,2]),[W]:_([2]),[O]:[{[A]:0,[N]:_(3),[S]:_([4]),[K]:[{[N]:_(4),[J]:_(4)}]}],[X]:[{[A]:72,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:{[N]:"T",[Z]:_([5])},[Z]:_([6]),[P]:[{[N]:_(7),[T]:_(8)},{[N]:"uv",[T]:C},{[N]:"st",[T]:C},{[N]:_(9),[T]:C}],[I]:_(["T"]),[H]:[{[N]:"T",[A]:-1}]}},{[A]:191,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:C,[Z]:_([10,6]),[P]:[{[N]:_(11),[T]:C},{[N]:_(12),[T]:C}]}}],[E]:[{[A]:293,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:{[N]:_(8),[Z]:_([13])},[Z]:_([14]),[P]:[{[N]:_(15),[T]:C,[Z]:_([16])},{[N]:_(17),[T]:_(8),[Z]:_([18])},{[N]:_(19),[T]:C,[Z]:_([20])},{[N]:_(21),[T]:C,[Z]:_([22])},{[N]:_(23),[T]:C,[Z]:_([24])},{[N]:_(25),[T]:C,[Z]:_([26])}],[I]:_([0,1])}}],[_(27)]:_(["T"]),[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "fragment/depth-only.wgsl",
  code: _(["use '",3,"'::{ ",4," };\r\n\r\n@infer ",T," T;\r\n\r\n@",6," fn ",0,"(\r\n  ",7,": f32,\r\n  uv: ",C,",\r\n  st: ",C,",\r\n  ",9,": ",C,",\r\n) -> @",5," T {};\r\n\r\n@",10," @",6," fn ",1,"(",11,": ",C,", ",12,": ",C,") -> ",C," { return ",11,"; }\r\n\r\n@",14,"\r\nfn ",2,"(\r\n  @builtin(",9,") ",15,": ",C,",\r\n  @",18," ",17,": f32,\r\n  @",20," ",19,": ",C,",\r\n  @",22," ",21,": ",C,",\r\n  @",24," ",23,": ",C,",\r\n  @",26," ",25,": ",C,",\r\n) -> @",13," f32 {\r\n\r\n  var ",14," = ",0,"(",17,", ",19,", ",21,", ",23,");\r\n  var ",30," = ",C,"(0.0, 0.0, 0.0, ",14,".",7,");\r\n\r\n  if (HAS_SCISSOR) { ",30," = ",1,"(",30,", ",25,"); }\r\n  if (HAS_ALPHA_TO_DISCARD) { if (",30,".a <= 0.0) { discard; } }\r\n\r\n  if (",30,".a < 1.0) {\r\n    let xy = vec2<u32>(",15,".xy);\r\n    if (",30,".a < ",4,"(xy)) { discard; }\r\n  }\r\n\r\n  return ",14,".depth;\r\n}\n"]).join(''),
  hash: 0x96d3d47935fa6,
  table,
  shake: [[54,[0,1,3]],[72,[1,3]],[191,[2,3]],[293,[3]]],
  tree: decompressAST([[1,0,49],[1,54,68],[1,18,132],[4,119,217,2],[1,0,9],[1,10,15],[2,9,19],[0,83,788],[3,0,9],[2,14,18],[3,9,27],[3,44,56],[3,32,44],[3,35,47],[3,35,47],[3,41,53],[3,43,63],[2,47,55],[2,146,156],[2,196,205]], table[S]),
};

const libs = {"../../../wgsl/fragment/bayer": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
