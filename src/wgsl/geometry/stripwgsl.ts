/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getStripIndex getStripUV vec2<u32> export vertex u32 vec2<f32> vertex".split(' '));
const table = {[S]:_([0,1]),[W]:_([0,1]),[E]:[{[A]:0,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:_(2),[Z]:_([3]),[P]:[{[N]:_(4),[T]:_(5)}]}},{[A]:135,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(6),[Z]:_([3]),[P]:[{[N]:_(4),[T]:_(5)}],[I]:_([0])}}]};
const data = {
  name: "geometry/strip.wgsl",
  code: _(["@",3," fn ",0,"(",4,": u32) -> ",2," {\r\n  var x = ",4," >> 1u;\r\n  var y = ",4," & 1u;\r\n  return ",2,"(x, y);\r\n}\r\n\r\n@",3," fn ",1,"(",4,": u32) -> ",6," {\r\n  return ",6,"(",0,"(",4,"));\r\n}\n"]).join(''),
  hash: 0x18a2d4ee581ab1,
  table,
  shake: [[0,[0,1]],[135,[1]]],
  tree: decompressAST([[0,0,131],[1,0,7],[2,11,24],[0,124,220],[1,0,7],[2,11,21],[2,59,72]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getStripIndex = getSymbol("getStripIndex");
export const getStripUV = getSymbol("getStripUV");
