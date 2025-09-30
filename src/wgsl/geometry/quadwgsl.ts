/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getQuadIndex getQuadUV vec2<u32> export vertex u32 vec2<f32> vertex".split(' '));
const table = {[S]:_([0,1]),[W]:_([0,1]),[E]:[{[A]:0,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:_(2),[Z]:_([3]),[P]:[{[N]:_(4),[T]:_(5)}]}},{[A]:113,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(6),[Z]:_([3]),[P]:[{[N]:_(4),[T]:_(5)}],[I]:_([0])}}]};
const data = {
  name: "geometry/quad.wgsl",
  code: _(["@",3," fn ",0,"(",4,": u32) -> ",2," {\r\n  return ",2,"(",4," & 1u, (",4," & 2u) >> 1u);\r\n}\r\n\r\n@",3," fn ",1,"(",4,": u32) -> ",6," {\r\n  return ",6,"(",0,"(",4,"));\r\n}\n"]).join(''),
  hash: 0x1d3ce598d660ad,
  table,
  shake: [[0,[0,1]],[113,[1]]],
  tree: decompressAST([[0,0,109],[1,0,7],[2,11,23],[0,102,196],[1,0,7],[2,11,20],[2,58,70]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getQuadIndex = getSymbol("getQuadIndex");
export const getQuadUV = getSymbol("getQuadUV");
