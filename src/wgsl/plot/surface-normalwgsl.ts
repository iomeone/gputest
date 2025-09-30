/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/geometry/stripwgsl";
import m1 from "../../wgsl/use/arraywgsl";
import m2 from "../../wgsl/plot/loopwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSize getPosition getSurfaceNormal ../../wgsl/geometry/strip getStripIndex ../../wgsl/use/array sizeToModulus3 packIndex3 unpackIndex3 ../../wgsl/plot/loop loopSurface vec3<u32> link optional index u32 export packIndex3 loopSurface getPosition modulus".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[O]:[{[A]:0,[N]:_(3),[S]:_([4]),[K]:[{[N]:_(4),[J]:_(4)}]},{[A]:0,[N]:_(5),[S]:_([6,7,8]),[K]:[{[N]:_(6),[J]:_(6)},{[N]:_(7),[J]:_(7)},{[N]:_(8),[J]:_(8)}]},{[A]:0,[N]:_(9),[S]:_([10]),[K]:[{[N]:_(10),[J]:_(10)}]}],[X]:[{[A]:175,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(11),[Z]:_([12])}},{[A]:212,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:C,[Z]:_([13,12]),[P]:[{[N]:_(14),[T]:_(15)}]}}],[E]:[{[A]:313,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:C,[Z]:_([16]),[P]:[{[N]:_(14),[T]:_(15)}],[I]:_([0,1])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "plot/surface-normal.wgsl",
  code: _(["use '",3,"'::{ ",4," };\r\nuse '",5,"'::{ ",6,", ",7,", un",7," }\r\nuse '",9,"'::{ ",10," };\r\n\r\n@",12," fn ",0,"() -> ",11," {};\r\n@",13," @",12," fn ",1,"(",14,": u32) -> ",C," { return ",C,"(0.0, 0.0, 0.0, 0.0); }\r\n\r\n@",16," fn ",2,"(",14,": u32) -> ",C," {\r\n  let size = ",0,"();\r\n  let ",20," = ",6,"(size);\r\n\r\n  let xyd = un",7,"(",14,", ",20,");\r\n\r\n  let left   = ",7,"(",10,"(xyd, size, vec2<i32>(-1, 0)), ",20,");\r\n  let right  = ",7,"(",10,"(xyd, size, vec2<i32>(1, 0)), ",20,");\r\n  let top    = ",7,"(",10,"(xyd, size, vec2<i32>(0, -1)), ",20,");\r\n  let bottom = ",7,"(",10,"(xyd, size, vec2<i32>(0, 1)), ",20,");\r\n\r\n  let dx = ",1,"(right) - ",1,"(left);\r\n  let dy = ",1,"(bottom) - ",1,"(top);\r\n\r\n  let normal = ",C,"(normalize(cross(dx.xyz, dy.xyz)), 0.0);\r\n  return normal;\r\n}\n"]).join(''),
  hash: 0x131faf062de8e,
  table,
  shake: [[175,[0,2]],[212,[1,2]],[313,[2]]],
  tree: decompressAST([[1,0,50],[1,53,125],[1,74,117],[1,48,82],[4,37,134,1],[1,0,9],[1,10,15],[2,9,20],[0,82,756],[1,0,7],[2,11,27],[2,58,65],[2,28,42],[2,37,49],[2,48,58],[2,11,22],[2,68,78],[2,11,22],[2,67,77],[2,11,22],[2,68,78],[2,11,22],[2,65,76],[2,21,32],[2,31,42],[2,22,33]], table[S]),
};

const libs = {"../../wgsl/geometry/strip": m0, "../../wgsl/use/array": m1, "../../wgsl/plot/loop": m2};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getSurfaceNormal = getSymbol("getSurfaceNormal");
