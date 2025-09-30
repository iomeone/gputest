/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getFragment getScissor main optional link color scissor location(0) fragment fragColor fragUV location(1) fragST location(2) fragScissor location(3) return location outColor".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[X]:[{[A]:0,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:C,[Z]:_([3,4]),[P]:[{[N]:_(5),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C}]}},{[A]:111,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:C,[Z]:_([3,4]),[P]:[{[N]:_(5),[T]:C},{[N]:_(6),[T]:C}]}}],[E]:[{[A]:213,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:{[N]:C,[Z]:_([7])},[Z]:_([8]),[P]:[{[N]:_(9),[T]:C,[Z]:_([7])},{[N]:_(10),[T]:C,[Z]:_([11])},{[N]:_(12),[T]:C,[Z]:_([13])},{[N]:_(14),[T]:C,[Z]:_([15])}],[I]:_([0,1])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "fragment/solid.wgsl",
  code: _(["@",3," @",4," fn ",0,"(",5,": ",C,", uv: ",C,", st: ",C,") -> ",C," { ",16," ",5,"; }\r\n@",3," @",4," fn ",1,"(",5,": ",C,", ",6,": ",C,") -> ",C," { ",16," ",5,"; }\r\n\r\n@",8,"\r\nfn ",2,"(\r\n  @",7," ",9,": ",C,",\r\n  @",11," ",10,": ",C,",\r\n  @",13," ",12,": ",C,",\r\n  @",15," ",14,": ",C,",\r\n) -> @",7," ",C," {\r\n  var ",18," = ",9,";\r\n  ",18," = ",0,"(",18,", ",10,", ",12,");\r\n\r\n  if (HAS_SCISSOR) { ",18," = ",1,"(",18,", ",14,"); }\r\n  if (HAS_ALPHA_TO_DISCARD) { if (",18,".a <= 0.0) { discard; } }\r\n\r\n  ",16," ",18,";\r\n}\n"]).join(''),
  hash: 0x1bb14ece806d27,
  table,
  shake: [[0,[0,2]],[111,[1,2]],[213,[2]]],
  tree: decompressAST([[4,0,109,0],[1,0,9],[1,10,15],[2,9,20],[4,92,190,1],[1,0,9],[1,10,15],[2,9,19],[0,83,529],[3,0,9],[2,14,18],[3,9,21],[3,38,50],[3,35,47],[3,35,47],[3,43,55],[2,68,79],[2,74,84]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
