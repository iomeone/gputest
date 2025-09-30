/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("tonemapUnreal export color".split(' '));
const table = {[S]:_([0]),[W]:_([0]),[E]:[{[A]:175,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:C,[Z]:_([1]),[P]:[{[N]:_(2),[T]:C}]}}]};
const data = {
  name: "tonemap/unreal.wgsl",
  code: _(["// Unreal 3, Documentation: \"Color Grading\"\r\n// Adapted to be close to Tonemap_ACES, with similar range\r\n// Gamma 2.2 correction is baked in, don't use with sRGB conversion!\r\n@",1," fn ",0,"(",2,": ",C,") -> ",C," {\r\n  return ",2," / (",2," + 0.155) * 1.019;\r\n}\n"]).join(''),
  hash: 0x1f417ac97bb8b9,
  table,
  shake: [[175,[0]]],
  tree: decompressAST([[0,175,278],[1,0,7],[2,11,24]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const tonemapUnreal = getSymbol("tonemapUnreal");
