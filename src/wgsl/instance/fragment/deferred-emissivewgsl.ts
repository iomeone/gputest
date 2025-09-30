/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getEmissive getDeferredEmissiveFragment link vec2<f32> export coord index u32".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:C,[Z]:_([2]),[P]:[{[N]:"uv",[T]:_(3)}]}}],[E]:[{[A]:53,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:C,[Z]:_([4]),[P]:[{[N]:"uv",[T]:_(3)},{[N]:_(5),[T]:C},{[N]:_(6),[T]:_(7)}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "fragment/deferred-emissive.wgsl",
  code: _(["@",2," fn ",0,"(uv: ",3,") -> ",C,";\r\n\r\n@",4," fn ",1,"(\r\n  uv: ",3,",\r\n  ",5,": ",C,",\r\n  ",6,": u32,\r\n) -> ",C," {\r\n  return ",0,"(uv);\r\n}\n"]).join(''),
  hash: 0x1f78422382f055,
  table,
  shake: [[0,[0,1]],[53,[1]]],
  tree: decompressAST([[1,0,48],[0,53,194],[1,0,7],[2,11,38],[2,111,122]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getDeferredEmissiveFragment = getSymbol("getDeferredEmissiveFragment");
