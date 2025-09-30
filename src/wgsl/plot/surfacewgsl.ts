/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
import m0 from "../../wgsl/geometry/stripwgsl";
import m1 from "../../wgsl/use/arraywgsl";
import m2 from "../../wgsl/plot/loopwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSize getSurfaceIndex getSurfaceUV ../../wgsl/geometry/strip getStripIndex ../../wgsl/use/array sizeToModulus3 packIndex3 unpackIndex3 ../../wgsl/plot/loop loopSurface vec3<u32> link u32 export index sizeToModulus3 unpackIndex3 getSize vertex modulus".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([1,2]),[O]:[{[A]:0,[N]:_(3),[S]:_([4]),[K]:[{[N]:_(4),[J]:_(4)}]},{[A]:0,[N]:_(5),[S]:_([6,7,8]),[K]:[{[N]:_(6),[J]:_(6)},{[N]:_(7),[J]:_(7)},{[N]:_(8),[J]:_(8)}]},{[A]:0,[N]:_(9),[S]:_([10]),[K]:[{[N]:_(10),[J]:_(10)}]}],[X]:[{[A]:175,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(11),[Z]:_([12])}}],[E]:[{[A]:263,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(13),[Z]:_([14]),[P]:[{[N]:_(15),[T]:_(13)}],[I]:_([0])}},{[A]:891,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:C,[Z]:_([14]),[P]:[{[N]:_(15),[T]:_(13)}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "plot/surface.wgsl",
  code: _(["use '",3,"'::{ ",4," };\r\nuse '",5,"'::{ ",6,", ",7,", un",7," }\r\nuse '",9,"'::{ ",10," };\r\n\r\n@",12," fn ",0,"() -> ",11," {};\r\n\r\n// Index an [x,y] x [x+1,y+1] quad on a surface\r\n@",14," fn ",1,"(",15,": u32) -> u32 {\r\n  let ",19," = ",15," % 6u;\r\n  let instance = ",15," / 6u;\r\n  let s = ",0,"();\r\n\r\n  var dx = 1u;\r\n  var dy = 1u;\r\n  if (LOOP_X) { dx = 0u; }\r\n  if (LOOP_Y) { dy = 0u; }\r\n\r\n  // Modulus for grid of quads (n - 1 unless looped)\r\n  let size = s - ",11,"(dx, dy, 0u);\r\n  let ",20," = ",6,"(size.xyz);\r\n\r\n  var xy = ",4,"(",19," - (",19," / 3u) * 2u);\r\n  if (",19," < 3u) { xy = xy.yx; }\r\n\r\n  let xyd = ",10,"(un",7,"(instance, ",20,"), s, vec2<i32>(xy));\r\n\r\n  // Modulus for grid of vertices (n)\r\n  return ",7,"(xyd, ",6,"(s.xyz));\r\n}\r\n\r\n@",14," fn ",2,"(",15,": u32) -> ",C," {\r\n  let size = ",0,"();\r\n  let ",20," = ",6,"(size);\r\n\r\n  let xyd = un",7,"(",15,", ",20,");\r\n  return ",C,"(",D,"(xyd) / ",D,"(size - 1), 0.0);\r\n}\n"]).join(''),
  hash: 0x145a5aa6cabda0,
  table,
  shake: [[175,[0,1,2]],[263,[1]],[891,[2]]],
  tree: decompressAST([[1,0,50],[1,53,125],[1,74,117],[1,48,82],[0,88,712],[1,0,7],[2,11,26],[2,106,113],[2,215,229],[2,40,53],[2,95,106],[2,12,24],[2,103,113],[2,16,30],[0,30,256],[1,0,7],[2,11,23],[2,54,61],[2,28,42],[2,37,49]], table[S]),
};

const libs = {"../../wgsl/geometry/strip": m0, "../../wgsl/use/array": m1, "../../wgsl/plot/loop": m2};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getSurfaceIndex = getSymbol("getSurfaceIndex");
export const getSurfaceUV = getSymbol("getSurfaceUV");
