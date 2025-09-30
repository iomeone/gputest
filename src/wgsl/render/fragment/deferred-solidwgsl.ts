/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
import m0 from "../../../wgsl/codec/octahedralwgsl";
import m1 from "../../../wgsl/fragment/bayerwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("GBufferSample getFragment getScissor main ../../../wgsl/codec/octahedral encodeOctahedral ../../../wgsl/fragment/bayer bayer4x4f optional link color scissor fragment fragCoord builtin(position) fragColor location(0) fragUV location(1) fragST location(2) fragScissor location(3) albedo normal material emissive locals GBufferSample location normal return outColor".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([3]),[O]:[{[A]:0,[N]:_(4),[S]:_([5]),[K]:[{[N]:_(5),[J]:_(5)}]},{[A]:0,[N]:_(6),[S]:_([7]),[K]:[{[N]:_(7),[J]:_(7)}]}],[X]:[{[A]:289,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:C,[Z]:_([8,9]),[P]:[{[N]:_(10),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C}]}},{[A]:402,[R]:_(2),[G]:6,[F]:{[N]:_(2),[T]:C,[Z]:_([8,9]),[P]:[{[N]:_(10),[T]:C},{[N]:_(11),[T]:C}]}}],[E]:[{[A]:504,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(0),[Z]:_([12]),[P]:[{[N]:_(13),[T]:C,[Z]:_([14])},{[N]:_(15),[T]:C,[Z]:_([16])},{[N]:_(17),[T]:C,[Z]:_([18])},{[N]:_(19),[T]:C,[Z]:_([20])},{[N]:_(21),[T]:C,[Z]:_([22])}],[I]:_([0,1,2,0])}}],[_(27)]:[{[A]:111,[R]:_(0),[G]:0,[U]:{[N]:_(0),[M]:[{[N]:_(23),[T]:C,[Z]:_([16])},{[N]:_(24),[T]:C,[Z]:_([18])},{[N]:_(25),[T]:C,[Z]:_([20])},{[N]:_(26),[T]:C,[Z]:_([22])}]}}],[L]:{[_(1)]:true,[_(2)]:true}};
const data = {
  name: "fragment/deferred-solid.wgsl",
  code: _(["use '",4,"'::{ ",5," };\r\nuse '",6,"'::{ ",7," };\r\n\r\n",U," ",0," {\r\n  @",16," ",23,": ",C,",\r\n  @",18," ",24,": ",C,",\r\n  @",20," ",25,": ",C,",\r\n  @",22," ",26,": ",C,",\r\n};\r\n\r\n@",8," @",9," fn ",1,"(",10,": ",C,", uv: ",C,", st: ",C,") -> ",C," { ",31," ",10,"; }\r\n\r\n@",8," @",9," fn ",2,"(",10,": ",C,", ",11,": ",C,") -> ",C," { ",31," ",10,"; }\r\n\r\n@",12,"\r\nfn ",3,"(\r\n  @",14," ",13,": ",C,",\r\n  @",16," ",15,": ",C,",\r\n  @",18," ",17,": ",C,",\r\n  @",20," ",19,": ",C,",\r\n  @",22," ",21,": ",C,",\r\n) -> ",0," {\r\n\r\n  var ",32," = ",1,"(",15,", ",17,", ",19,");\r\n\r\n  if (HAS_SCISSOR) { ",32," = ",2,"(",32,", ",21,"); }\r\n  if (HAS_ALPHA_TO_DISCARD) { if (",32,".a <= 0.0) { discard; } }\r\n\r\n  if (",32,".a < 1.0) {\r\n    let xy = vec2<u32>(",13,".xy);\r\n    if (",32,".a < ",7,"(xy)) { discard; }\r\n  }\r\n\r\n  let ",24," = ",5,"(",D,"(0.0, 0.0, -1.0));\r\n\r\n  ",31," ",0,"(\r\n    ",C,"(0.0),\r\n    ",C,"(",24,", ",24,"),\r\n    ",C,"(0.0),\r\n    ",C,"(",32,".rgb, 1.0),\r\n  );\r\n}\n"]).join(''),
  hash: 0xd3bc4de6c7af5,
  table,
  shake: [[111,[0,3]],[289,[1,3]],[402,[2,3]],[504,[3]]],
  tree: decompressAST([[1,0,58],[1,61,110],[0,50,223],[2,11,24],[3,19,31],[3,35,47],[3,35,47],[3,37,49],[4,41,150,1],[1,0,9],[1,10,15],[2,9,20],[4,94,192,2],[1,0,9],[1,10,15],[2,9,19],[0,83,848],[3,0,9],[2,14,18],[3,9,27],[3,44,56],[3,38,50],[3,35,47],[3,35,47],[2,43,56],[2,36,47],[2,75,85],[2,196,205],[2,51,67],[2,57,70]], table[S]),
};

const libs = {"../../../wgsl/codec/octahedral": m0, "../../../wgsl/fragment/bayer": m1};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
