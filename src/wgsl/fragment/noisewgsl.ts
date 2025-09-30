/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("IGN f32 export vec2<u32> frame u32".split(' '));
const table = {[S]:_([0]),[W]:_([0]),[E]:[{[A]:0,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:_(1),[Z]:_([2]),[P]:[{[N]:"xy",[T]:_(3)},{[N]:_(4),[T]:_(5)}]}}]};
const data = {
  name: "fragment/noise.wgsl",
  code: _(["@",2," fn IGN(xy: ",3,", ",4,": u32) -> f32 {\r\n  let uv = vec2<f32>(xy) + 5.588238 * f32(",4," % 64);\r\n  let f = dot(vec2<f32>(0.06711056, 0.00583715), uv) % 1.0;\r\n  return (52.9829189 * f) % 1.0;\r\n};\n"]).join(''),
  hash: 0x68088aafb407d,
  table,
  shake: [[0,[0]]],
  tree: decompressAST([[0,0,204],[1,0,7],[2,11,14]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const IGN = getSymbol("IGN");
