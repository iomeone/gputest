/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("ONE_TWO bayer2x2 bayer4x4 bayer2x2f bayer4x4f u32 export vec2<u32> f32 ONE_TWO export return".split(' '));
const table = {[S]:_([0,1,2,3,4]),[W]:_([1,2,3,4]),[E]:[{[A]:36,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(5),[Z]:_([6]),[P]:[{[N]:"ij",[T]:_(7)}]}},{[A]:199,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(5),[Z]:_([6]),[P]:[{[N]:"ij",[T]:_(7)}],[I]:_([0])}},{[A]:480,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(8),[Z]:_([6]),[P]:[{[N]:"ij",[T]:_(7)}],[I]:_([1])}},{[A]:574,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:_(8),[Z]:_([6]),[P]:[{[N]:"ij",[T]:_(7)}],[I]:_([2])}}]};
const data = {
  name: "fragment/bayer.wgsl",
  code: _(["const ",0," = ",7,"(1, 2);\r\n\r\n@",6," fn ",1,"(ij: ",7,") -> u32 {\r\n  let ij2 = ij & ",7,"(0x1u);\r\n\r\n  let x = ij2.x;\r\n  let xor = ij2.x ^ ij2.y;\r\n\r\n  ",11," (x | (xor << 1));\r\n}\r\n\r\n@",6," fn ",2,"(ij: ",7,") -> u32 {\r\n  let ij4 = ij & ",7,"(0x3u);\r\n\r\n  let x = ij4.x;\r\n  let xor = ij4.x ^ ij4.y;\r\n\r\n  let x12 = ",7,"(x) & ",0,";\r\n  let xor12 = ",7,"(xor) & ",0,";\r\n\r\n  ",11," (xor12.x << 3) | (x12.x << 2) | xor12.y | (x12.y >> 1);\r\n}\r\n\r\n@",6," fn ",1,"f(ij: ",7,") -> f32 {\r\n  ",11," (0.5 + f32(",1,"(ij))) / 4.0;\r\n}\r\n\r\n@",6," fn ",2,"f(ij: ",7,") -> f32 {\r\n  ",11," (0.5 + f32(",2,"(ij))) / 16.0;\r\n}\n"]).join(''),
  hash: 0xd7c8a67cc0ed8,
  table,
  shake: [[0,[0,2,4]],[36,[1,3]],[199,[2,4]],[480,[3]],[574,[4]]],
  tree: decompressAST([[0,0,32],[2,6,13],[0,30,189],[1,0,7],[2,11,19],[0,152,429],[1,0,7],[2,11,19],[2,146,153],[2,41,48],[0,83,173],[1,0,7],[2,11,20],[2,55,63],[0,28,119],[1,0,7],[2,11,20],[2,55,63]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const bayer2x2 = getSymbol("bayer2x2");
export const bayer4x4 = getSymbol("bayer4x4");
export const bayer2x2f = getSymbol("bayer2x2f");
export const bayer4x4f = getSymbol("bayer4x4f");
