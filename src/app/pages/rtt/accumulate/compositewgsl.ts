/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getAccumulateTexture getFrameCount compositeShader link vec2<f32> u32 export".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:C,[Z]:_([3]),[P]:[{[N]:"uv",[T]:_(4)}]}},{[A]:60,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:_(5),[Z]:_([3])}}],[E]:[{[A]:99,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:C,[Z]:_([6]),[P]:[{[N]:"uv",[T]:_(4)}],[I]:_([0,1])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "accumulate/composite.wgsl",
  code: _(["@",3," fn ",0,"(uv: ",4,") -> ",C,";\r\n@",3," fn ",1,"() -> u32 {};\r\n\r\n@",6," fn ",2,"(uv: ",4,") -> ",C," {\r\n  let sample = ",0,"(uv);\r\n  let norm = f32(",1,"());\r\n\r\n  return ",C,"(sample.xyz / norm, 1.0);\r\n};\n"]).join(''),
  hash: 0x17e89e9d83eb5e,
  table,
  shake: [[0,[0,2]],[60,[1,2]],[99,[2]]],
  tree: decompressAST([[1,0,57],[1,60,94],[0,39,223],[1,0,7],[2,11,26],[2,62,82],[2,44,57]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const compositeShader = getSymbol("compositeShader");
