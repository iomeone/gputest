/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/fragment/bayerwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSurface getScissor main ../../../wgsl/fragment/bayer bayer4x4f infer(T) link color normal tangent position coord optional scissor f32 builtin(frag_depth) fragment export frontFacing bool builtin(front_facing) fragCoord builtin(position) fragColor location(0) fragUV location(1) fragST location(2) fragNormal location(3) fragTangent location(4) fragPosition location(5) fragScissor location(6) infers normal builtin location outColor surface".split(' '));
const table = {[S]:_(["T",0,1,2]),[W]:_([2]),[O]:[{[A]:0,[N]:_(3),[S]:_([4]),[K]:[{[N]:_(4),[J]:_(4)}]}],[X]:[{[A]:72,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:{[N]:"T",[Z]:_([5])},[Z]:_([6]),[P]:[{[N]:_(7),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C},{[N]:_(8),[T]:C},{[N]:_(9),[T]:C},{[N]:_(10),[T]:C},{[N]:_(11),[T]:C}],[I]:_(["T"]),[H]:[{[N]:"T",[A]:-1}]}},{[A]:264,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:C,[Z]:_([12,6]),[P]:[{[N]:_(7),[T]:C},{[N]:_(13),[T]:C}]}}],[E]:[{[A]:366,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:{[N]:_(14),[Z]:_([15])},[Z]:_([16,17]),[P]:[{[N]:_(18),[T]:_(19),[Z]:_([20])},{[N]:_(21),[T]:C,[Z]:_([22])},{[N]:_(23),[T]:C,[Z]:_([24])},{[N]:_(25),[T]:C,[Z]:_([26])},{[N]:_(27),[T]:C,[Z]:_([28])},{[N]:_(29),[T]:C,[Z]:_([30])},{[N]:_(31),[T]:C,[Z]:_([32])},{[N]:_(33),[T]:C,[Z]:_([34])},{[N]:_(35),[T]:C,[Z]:_([36])}],[I]:_([0,1])}}],[_(37)]:_(["T"]),[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "fragment/depth-shaded.wgsl",
  code: _(["use '",3,"'::{ ",4," };\r\n\r\n@infer ",T," T;\r\n\r\n@",6," fn ",0,"(\r\n  ",7,": ",C,",\r\n  uv: ",C,",\r\n  st: ",C,",\r\n  ",8,": ",C,",\r\n  ",9,": ",C,",\r\n  ",10,": ",C,",\r\n  ",11,": ",C,",\r\n) -> @",5," T {}\r\n\r\n@",12," @",6," fn ",1,"(",7,": ",C,", ",13,": ",C,") -> ",C," { return ",7,"; }\r\n\r\n@",16,"\r\n@",17," fn ",2,"(\r\n  @",20," ",18,": ",19,",\r\n  @",39,"(",10,") ",21,": ",C,",\r\n  @",24," ",23,": ",C,",\r\n  @",26," ",25,": ",C,",\r\n  @",28," ",27,": ",C,",\r\n  @",30," ",29,": ",C,",\r\n  @",32," ",31,": ",C,",\r\n  @",34," ",33,": ",C,",\r\n  @",36," ",35,": ",C,",\r\n) -> @",15," f32 {\r\n\r\n  var ",8," = ",29,";\r\n  if (!",18,") { ",8," = ",C,"(-",8,".xyz, ",8,".w); }\r\n\r\n  var ",41," = ",23,";\r\n\r\n  let ",42," = ",0,"(",41,", ",25,", ",27,", ",8,", ",31,", ",33,", ",21,");\r\n  ",41," = ",42,".albedo;\r\n\r\n  if (HAS_SCISSOR) { ",41," = ",1,"(",41,", ",35,"); }\r\n  if (HAS_ALPHA_TO_DISCARD) { if (",41,".a <= 0.0) { discard; } }\r\n\r\n  return ",42,".depth;\r\n}\n"]).join(''),
  hash: 0x1a35d94393de2a,
  table,
  shake: [[54,[0,1,3]],[72,[1,3]],[264,[2,3]],[366,[3]]],
  tree: decompressAST([[1,0,49],[1,54,68],[1,18,206],[4,192,290,2],[1,0,9],[1,10,15],[2,9,19],[0,83,933],[3,0,9],[1,11,18],[2,11,15],[3,9,31],[3,45,63],[3,44,56],[3,38,50],[3,35,47],[3,35,47],[3,39,51],[3,40,52],[3,41,53],[3,43,63],[2,175,185],[2,149,159]], table[S]),
};

const libs = {"../../../wgsl/fragment/bayer": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
