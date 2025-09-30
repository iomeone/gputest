/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getDepth getScissor main infer(T) link alpha f32 position optional color scissor builtin(frag_depth) fragment fragCoord builtin(position) fragAlpha location(0) fragUV location(1) fragST location(2) fragPosition location(3) fragScissor location(4) fragment location outColor".split(' '));
const table = {[S]:_(["T",0,1,2]),[W]:_([2]),[X]:[{[A]:18,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:{[N]:"T",[Z]:_([3])},[Z]:_([4]),[P]:[{[N]:_(5),[T]:_(6)},{[N]:"uv",[T]:C},{[N]:"st",[T]:C},{[N]:_(7),[T]:C}],[I]:_(["T"]),[H]:[{[N]:"T",[A]:-1}]}},{[A]:137,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:C,[Z]:_([8,4]),[P]:[{[N]:_(9),[T]:C},{[N]:_(10),[T]:C}]}}],[E]:[{[A]:239,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:{[N]:_(6),[Z]:_([11])},[Z]:_([12]),[P]:[{[N]:_(13),[T]:C,[Z]:_([14])},{[N]:_(15),[T]:_(6),[Z]:_([16])},{[N]:_(17),[T]:C,[Z]:_([18])},{[N]:_(19),[T]:C,[Z]:_([20])},{[N]:_(21),[T]:C,[Z]:_([22])},{[N]:_(23),[T]:C,[Z]:_([24])}],[I]:_([0,1])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "fragment/depth-frag.wgsl",
  code: _(["@infer ",T," T;\r\n\r\n@",4," fn ",0,"(\r\n  ",5,": f32,\r\n  uv: ",C,",\r\n  st: ",C,",\r\n  ",7,": ",C,",\r\n) -> @",3," T {};\r\n\r\n@",8," @",4," fn ",1,"(",9,": ",C,", ",10,": ",C,") -> ",C," { return ",9,"; }\r\n\r\n@",12,"\r\nfn ",2,"(\r\n  @builtin(",7,") ",13,": ",C,",\r\n  @",16," ",15,": f32,\r\n  @",18," ",17,": ",C,",\r\n  @",20," ",19,": ",C,",\r\n  @",22," ",21,": ",C,",\r\n  @",24," ",23,": ",C,",\r\n) -> @",11," f32 {\r\n\r\n  var ",12," = ",0,"(",15,", ",17,", ",19,", ",21,");\r\n  var ",27," = ",C,"(0.0, 0.0, 0.0, ",12,".",5,");\r\n\r\n  if (HAS_SCISSOR) { ",27," = ",1,"(",27,", ",23,"); }\r\n  if (",27,".a <= 0.0) { discard; }\r\n\r\n  if (",27,".a < 1.0) {\r\n    let bits = vec2<u32>(",13,".xy) % 2;\r\n    let level = (0.5 + f32(bits.x ^ ((bits.x ^ bits.y) << 1))) / 4.0;\r\n    if (",27,".a < level) { discard; }\r\n  }\r\n\r\n  return ",12,".depth;\r\n}\n"]).join(''),
  hash: 0x1d2fb34efc2498,
  table,
  shake: [[0,[0,1,3]],[18,[1,3]],[137,[2,3]],[239,[3]]],
  tree: decompressAST([[1,0,14],[1,18,132],[4,119,217,2],[1,0,9],[1,10,15],[2,9,19],[0,83,827],[3,0,9],[2,14,18],[3,9,27],[3,44,56],[3,32,44],[3,35,47],[3,35,47],[3,41,53],[3,43,63],[2,47,55],[2,146,156]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
