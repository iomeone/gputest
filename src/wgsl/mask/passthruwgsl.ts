/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getPassThruColor export color".split(' '));
const table = {[S]:_([0]),[W]:_([0]),[E]:[{[A]:0,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:C,[Z]:_([1]),[P]:[{[N]:_(2),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C}]}}]};
const data = {
  name: "mask/passthru.wgsl",
  code: _(["@",1," fn ",0,"(",2,": ",C,", uv: ",C,", st: ",C,") -> ",C," {\r\n  if (HAS_ALPHA_TO_COVERAGE) {\r\n    return ",C,"(",2,".xyz, ",2,".a);\r\n  }\r\n  else {\r\n    return ",C,"(",2,".xyz * ",2,".a, ",2,".a);\r\n  }\r\n}\n"]).join(''),
  hash: 0x132cac2d62b1f1,
  table,
  shake: [[0,[0]]],
  tree: decompressAST([[0,0,241],[1,0,7],[2,11,27]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getPassThruColor = getSymbol("getPassThruColor");
