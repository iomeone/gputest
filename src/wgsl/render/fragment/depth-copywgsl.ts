/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getDepth main optional link color f32 builtin(frag_depth) fragment frontFacing bool builtin(front_facing) fragAlpha location(0) fragUV location(1) fragST location(2) fragScissor location(3) location".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[X]:[{[A]:0,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:C,[Z]:_([2,3]),[P]:[{[N]:_(4),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C}]}}],[E]:[{[A]:132,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:{[N]:_(5),[Z]:_([6])},[Z]:_([7]),[P]:[{[N]:_(8),[T]:_(9),[Z]:_([10])},{[N]:_(11),[T]:_(5),[Z]:_([12])},{[N]:_(13),[T]:C,[Z]:_([14])},{[N]:_(15),[T]:C,[Z]:_([16])},{[N]:_(17),[T]:C,[Z]:_([18])}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "fragment/depth-copy.wgsl",
  code: _(["@",2," @",3," fn ",0,"(\r\n  ",4,": ",C,",\r\n  uv: ",C,",\r\n  st: ",C,",\r\n) -> ",C," { return ",C,"(0.0); }\r\n\r\n@",7,"\r\nfn ",1,"(\r\n  @",10," ",8,": ",9,",\r\n  @",12," ",11,": f32,\r\n  @",14," ",13,": ",C,",\r\n  @",16," ",15,": ",C,",\r\n  @",18," ",17,": ",C,",\r\n) -> @",6," f32 {\r\n\r\n  var outColor = ",C,"(1.0, 1.0, 1.0, ",11,");\r\n  return ",0,"(outColor, ",13,", ",15,").r;\r\n}\n"]).join(''),
  hash: 0x1bf08ee2677830,
  table,
  shake: [[0,[0,1]],[132,[1]]],
  tree: decompressAST([[4,0,128,0],[1,0,9],[1,10,15],[2,9,17],[0,113,460],[3,0,9],[2,14,18],[3,9,31],[3,45,57],[3,32,44],[3,35,47],[3,35,47],[3,43,63],[2,94,102]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
