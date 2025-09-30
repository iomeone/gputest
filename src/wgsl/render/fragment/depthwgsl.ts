/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getFragment getScissor main infer(T) link color optional scissor void fragment frontFacing bool builtin(front_facing) fragCoord builtin(position) fragAlpha f32 location(0) fragUV location(1) fragST location(2) fragScissor location(3) location outColor".split(' '));
const table = {[S]:_(["T",0,1,2]),[W]:_([2]),[X]:[{[A]:18,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:{[N]:"T",[Z]:_([3])},[Z]:_([4]),[P]:[{[N]:_(5),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C}],[I]:_(["T"]),[H]:[{[N]:"T",[A]:-1}]}},{[A]:122,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:C,[Z]:_([6,4]),[P]:[{[N]:_(5),[T]:C},{[N]:_(7),[T]:C}]}}],[E]:[{[A]:224,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(8),[Z]:_([9]),[P]:[{[N]:_(10),[T]:_(11),[Z]:_([12])},{[N]:_(13),[T]:C,[Z]:_([14])},{[N]:_(15),[T]:_(16),[Z]:_([17])},{[N]:_(18),[T]:C,[Z]:_([19])},{[N]:_(20),[T]:C,[Z]:_([21])},{[N]:_(22),[T]:C,[Z]:_([23])}],[I]:_([0,1])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "fragment/depth.wgsl",
  code: _(["@infer ",T," T;\r\n\r\n@",4," fn ",0,"(\r\n  ",5,": ",C,",\r\n  uv: ",C,",\r\n  st: ",C,",\r\n) -> @",3," T {};\r\n\r\n@",6," @",4," fn ",1,"(",5,": ",C,", ",7,": ",C,") -> ",C," { return ",5,"; }\r\n\r\n@",9,"\r\nfn ",2,"(\r\n  @",12," ",10,": ",11,",\r\n  @",14," ",13,": ",C,",\r\n  @",17," ",15,": f32,\r\n  @",19," ",18,": ",C,",\r\n  @",21," ",20,": ",C,",\r\n  @",23," ",22,": ",C,",\r\n) {\r\n\r\n  var ",25," = ",C,"(1.0, 1.0, 1.0, ",15,");\r\n  ",25," = ",0,"(",25,", ",18,", ",20,");\r\n\r\n  if (HAS_SCISSOR) { ",25," = ",1,"(",25,", ",22,"); }\r\n  if (",25,".a <= 0.0) { discard; }\r\n\r\n  if (",25,".a < 1.0) {\r\n    let bits = vec2<u32>(",13,".xy) % 2;\r\n    let level = (0.5 + f32(bits.x ^ ((bits.x ^ bits.y) << 1))) / 4.0;\r\n    if (",25,".a < level) { discard; }\r\n  }\r\n}\n"]).join(''),
  hash: 0x3d1355190a0d0,
  table,
  shake: [[0,[0,1,3]],[18,[1,3]],[122,[2,3]],[224,[3]]],
  tree: decompressAST([[1,0,14],[1,18,117],[4,104,202,2],[1,0,9],[1,10,15],[2,9,19],[0,83,754],[3,0,9],[2,14,18],[3,9,31],[3,45,63],[3,44,56],[3,32,44],[3,35,47],[3,35,47],[2,113,124],[2,74,84]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
