/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("displayDepth export depth f32".split(' '));
const table = {[S]:_([0]),[W]:_([0]),[E]:[{[A]:0,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:C,[Z]:_([1]),[P]:[{[N]:_(2),[T]:_(3)}]}}]};
const data = {
  name: "display/depth.wgsl",
  code: _(["@",1," fn ",0,"(",2,": f32) -> ",C," {\r\n  let hasZ = ",2," > 0.0;\r\n  if (!hasZ) { return ",C,"(0.0, 0.0, 0.1, 1.0); }\r\n\r\n  let d = -log(",2,");\r\n  return ",C,"(fract(d), fract(d * 16.0) * .75, fract(d * 256.0), 1.0);\r\n}\n"]).join(''),
  hash: 0x16aa3783e312b8,
  table,
  shake: [[0,[0]]],
  tree: decompressAST([[0,0,239],[1,0,7],[2,11,23]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const displayDepth = getSymbol("displayDepth");
