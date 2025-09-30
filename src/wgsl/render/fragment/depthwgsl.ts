/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
import m0 from "../../../wgsl/fragment/bayerwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getFragment getScissor main ../../../wgsl/fragment/bayer bayer4x4f infer(T) link color optional scissor void fragment fragCoord builtin(position) fragAlpha f32 location(0) fragUV location(1) fragST location(2) fragScissor location(3) infers location outColor".split(' '));
const table = {[S]:_(["T",0,1,2]),[W]:_([2]),[O]:[{[A]:0,[N]:_(3),[S]:_([4]),[K]:[{[N]:_(4),[J]:_(4)}]}],[X]:[{[A]:72,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:{[N]:"T",[Z]:_([5])},[Z]:_([6]),[P]:[{[N]:_(7),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C}],[I]:_(["T"]),[H]:[{[N]:"T",[A]:-1}]}},{[A]:176,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:C,[Z]:_([8,6]),[P]:[{[N]:_(7),[T]:C},{[N]:_(9),[T]:C}]}}],[E]:[{[A]:278,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(10),[Z]:_([11]),[P]:[{[N]:_(12),[T]:C,[Z]:_([13])},{[N]:_(14),[T]:_(15),[Z]:_([16])},{[N]:_(17),[T]:C,[Z]:_([18])},{[N]:_(19),[T]:C,[Z]:_([20])},{[N]:_(21),[T]:C,[Z]:_([22])}],[I]:_([0,1])}}],[_(23)]:_(["T"]),[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "fragment/depth.wgsl",
  code: _(["use '",3,"'::{ ",4," };\r\n\r\n@infer ",T," T;\r\n\r\n@",6," fn ",0,"(\r\n  ",7,": ",C,",\r\n  uv: ",C,",\r\n  st: ",C,",\r\n) -> @",5," T {};\r\n\r\n@",8," @",6," fn ",1,"(",7,": ",C,", ",9,": ",C,") -> ",C," { return ",7,"; }\r\n\r\n@",11,"\r\nfn ",2,"(\r\n  @",13," ",12,": ",C,",\r\n  @",16," ",14,": f32,\r\n  @",18," ",17,": ",C,",\r\n  @",20," ",19,": ",C,",\r\n  @",22," ",21,": ",C,",\r\n) {\r\n  var ",25," = ",C,"(1.0, 1.0, 1.0, ",14,");\r\n  ",25," = ",0,"(",25,", ",17,", ",19,");\r\n\r\n  if (HAS_SCISSOR) { ",25," = ",1,"(",25,", ",21,"); }\r\n  if (HAS_ALPHA_TO_DISCARD) { if (",25,".a <= 0.0) { discard; } }\r\n\r\n  if (",25,".a < 1.0) {\r\n    let xy = vec2<u32>(",12,".xy);\r\n    if (",25,".a < ",4,"(xy)) { discard; }\r\n  }\r\n}\n"]).join(''),
  hash: 0x9bd6cf8b77c79,
  table,
  shake: [[54,[0,1,3]],[72,[1,3]],[176,[2,3]],[278,[3]]],
  tree: decompressAST([[1,0,49],[1,54,68],[1,18,117],[4,104,202,2],[1,0,9],[1,10,15],[2,9,19],[0,83,668],[3,0,9],[2,14,18],[3,9,27],[3,44,56],[3,32,44],[3,35,47],[3,35,47],[2,111,122],[2,74,84],[2,196,205]], table[S]),
};

const libs = {"../../../wgsl/fragment/bayer": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
