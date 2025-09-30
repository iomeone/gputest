/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/codec/octahedralwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("GBufferSample getFragment getScissor main ../../../wgsl/codec/octahedral encodeOctahedral optional link color scissor fragment fragCoord builtin(position) fragColor location(0) fragUV location(1) fragST location(2) fragScissor location(3) GBufferSample location return outColor".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([3]),[O]:[{[A]:0,[N]:_(4),[S]:_([5]),[K]:[{[N]:_(5),[J]:_(5)}]}],[X]:[{[A]:237,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:C,[Z]:_([6,7]),[P]:[{[N]:_(8),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C}]}},{[A]:350,[R]:_(2),[G]:6,[F]:{[N]:_(2),[T]:C,[Z]:_([6,7]),[P]:[{[N]:_(8),[T]:C},{[N]:_(9),[T]:C}]}}],[E]:[{[A]:452,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(0),[Z]:_([10]),[P]:[{[N]:_(11),[T]:C,[Z]:_([12])},{[N]:_(13),[T]:C,[Z]:_([14])},{[N]:_(15),[T]:C,[Z]:_([16])},{[N]:_(17),[T]:C,[Z]:_([18])},{[N]:_(19),[T]:C,[Z]:_([20])}],[I]:_([0,1,2,0])}}],[L]:{[_(1)]:true,[_(2)]:true}};
const data = {
  name: "fragment/deferred-solid.wgsl",
  code: _(["use '",4,"'::{ ",5," };\r\n\r\n",U," ",0," {\r\n  @",14," albedo: ",C,",\r\n  @",16," normal: ",C,",\r\n  @",18," material: ",C,",\r\n  @",20," emissive: ",C,",\r\n};\r\n\r\n@",6," @",7," fn ",1,"(",8,": ",C,", uv: ",C,", st: ",C,") -> ",C," { ",23," ",8,"; }\r\n\r\n@",6," @",7," fn ",2,"(",8,": ",C,", ",9,": ",C,") -> ",C," { ",23," ",8,"; }\r\n\r\n@",10,"\r\nfn ",3,"(\r\n  @",12," ",11,": ",C,",\r\n  @",14," ",13,": ",C,",\r\n  @",16," ",15,": ",C,",\r\n  @",18," ",17,": ",C,",\r\n  @",20," ",19,": ",C,",\r\n) -> ",0," {\r\n\r\n  var ",24," = ",1,"(",13,", ",15,", ",17,");\r\n\r\n  if (HAS_SCISSOR) { ",24," = ",2,"(",24,", ",19,"); }\r\n  if (",24,".a <= 0.0) { discard; }\r\n\r\n  if (",24,".a < 1.0) {\r\n    let bits = vec2<u32>(",11,".xy) % 2;\r\n    let level = (0.5 + f32(bits.x ^ ((bits.x ^ bits.y) << 1))) / 4.0;\r\n    if (",24,".a < level) { discard; }\r\n  }\r\n\r\n  ",23," ",0,"(\r\n    ",C,"(0.0),\r\n    ",C,"(",5,"(",D,"(0.0, 0.0, -1.0)), 0.0, 0.0),\r\n    ",C,"(0.0),\r\n    ",C,"(",24,".rgb, 1.0),\r\n  );\r\n}\n"]).join(''),
  hash: 0xbb4d166169ee0,
  table,
  shake: [[59,[0,3]],[237,[1,3]],[350,[2,3]],[452,[3]]],
  tree: decompressAST([[1,0,58],[0,59,232],[2,11,24],[3,19,31],[3,35,47],[3,35,47],[3,37,49],[4,41,150,1],[1,0,9],[1,10,15],[2,9,20],[4,94,192,2],[1,0,9],[1,10,15],[2,9,19],[0,83,863],[3,0,9],[2,14,18],[3,9,27],[3,44,56],[3,38,50],[3,35,47],[3,35,47],[2,43,56],[2,36,47],[2,75,85],[2,280,293],[2,51,67]], table[S]),
};

const libs = {"../../../wgsl/codec/octahedral": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
