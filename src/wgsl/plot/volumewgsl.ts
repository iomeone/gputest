/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
import m0 from "../../wgsl/geometry/stripwgsl";
import m1 from "../../wgsl/use/arraywgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSize getPosition getVolumeGradient offsetIndex ../../wgsl/geometry/strip getStripIndex ../../wgsl/use/array sizeToModulus4 packIndex4 unpackIndex4 vec4<u32> link u32 optional index export packIndex4 getPosition return modulus offsetIndex offset".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([2]),[O]:[{[A]:0,[N]:_(4),[S]:_([5]),[K]:[{[N]:_(5),[J]:_(5)}]},{[A]:0,[N]:_(6),[S]:_([7,8,9]),[K]:[{[N]:_(7),[J]:_(7)},{[N]:_(8),[J]:_(8)},{[N]:_(9),[J]:_(9)}]}],[X]:[{[A]:129,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(10),[Z]:_([11]),[P]:[{[N]:"i",[T]:_(12)}]}},{[A]:172,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:C,[Z]:_([13,11]),[P]:[{[N]:_(14),[T]:_(12)}]}}],[E]:[{[A]:273,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:D,[Z]:_([15]),[P]:[{[N]:_(14),[T]:_(12)}],[I]:_([0,3,1])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "plot/volume.wgsl",
  code: _(["use '",4,"'::{ ",5," };\r\nuse '",6,"'::{ ",7,", ",8,", un",8," }\r\n\r\n@",11," fn ",0,"(i: u32) -> ",10," {};\r\n@",13," @",11," fn ",1,"(",14,": u32) -> ",C," { ",18," ",C,"(0.0, 0.0, 0.0, 0.0); }\r\n\r\n@",15," fn ",2,"(",14,": u32) -> ",D," {\r\n  let size = ",0,"();\r\n  let ",19," = ",7,"(size);\r\n\r\n  let xyzd = un",8,"(",14,", ",19,");\r\n\r\n  let left   = ",8,"(",3,"(xyzd, size, vec3<i32>(-1,  0,  0)), ",19,");\r\n  let right  = ",8,"(",3,"(xyzd, size, vec3<i32>( 1,  0,  0)), ",19,");\r\n  let top    = ",8,"(",3,"(xyzd, size, vec3<i32>( 0, -1,  0)), ",19,");\r\n  let bottom = ",8,"(",3,"(xyzd, size, vec3<i32>( 0,  1,  0)), ",19,");\r\n  let front  = ",8,"(",3,"(xyzd, size, vec3<i32>( 0,  0, -1)), ",19,");\r\n  let back   = ",8,"(",3,"(xyzd, size, vec3<i32>( 0,  0,  1)), ",19,");\r\n\r\n  let dx = ",1,"(right) - ",1,"(left);\r\n  let dy = ",1,"(bottom) - ",1,"(top);\r\n  let dz = ",1,"(back) - ",1,"(front);\r\n\r\n  let normal = ",D,"(dx, dy, dz);\r\n  ",18," normal;\r\n}\r\n\r\nfn ",3,"(",14,": ",10,", size: ",10,", ",21,": vec3<i32>) -> ",10," {\r\n  var sx = i32(",14,".x) + ",21,".x;\r\n  if (LOOP_X) {\r\n    if (sx < 0) { sx = sx + i32(size.x); }\r\n    if (sx >= i32(size.x)) { sx = sx - i32(size.x); }\r\n  }\r\n  else {\r\n    if (sx < 0) { sx = 0; }\r\n    if (sx >= i32(size.x)) { sx = i32(size.x) - 1; }\r\n  }\r\n\r\n  var sy = i32(",14,".y) + ",21,".y;\r\n  if (LOOP_Y) {\r\n    if (sy < 0) { sy = sy + i32(size.y); }\r\n    if (sy >= i32(size.y)) { sy = sy - i32(size.y); }\r\n  }\r\n  else {\r\n    if (sy < 0) { sy = 0; }\r\n    if (sy >= i32(size.y)) { sy = i32(size.y) - 1; }\r\n  }\r\n\r\n  var sz = i32(",14,".z) + ",21,".z;\r\n  if (LOOP_Z) {\r\n    if (sz < 0) { sz = sz + i32(size.z); }\r\n    if (sz >= i32(size.z)) { sz = sz - i32(size.z); }\r\n  }\r\n  else {\r\n    if (sz < 0) { sz = 0; }\r\n    if (sz >= i32(size.z)) { sz = i32(size.z) - 1; }\r\n  }\r\n\r\n  ",18," ",10,"(u32(sx), u32(sy), u32(sz), ",14,".w);\r\n}\n"]).join(''),
  hash: 0x161d0684e6916b,
  table,
  shake: [[129,[0,2]],[172,[1,2]],[273,[2]],[1170,[3,2]]],
  tree: decompressAST([[1,0,50],[1,53,125],[1,76,116],[4,43,140,1],[1,0,9],[1,10,15],[2,9,20],[0,82,979],[1,0,7],[2,11,28],[2,59,66],[2,28,42],[2,38,50],[2,48,58],[2,11,22],[2,74,84],[2,11,22],[2,74,84],[2,11,22],[2,74,84],[2,11,22],[2,74,84],[2,11,22],[2,74,84],[2,11,22],[2,72,83],[2,21,32],[2,31,42],[2,22,33],[2,30,41],[2,20,31],[0,81,1002],[2,7,18]], table[S]),
};

const libs = {"../../wgsl/geometry/strip": m0, "../../wgsl/use/array": m1};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getVolumeGradient = getSymbol("getVolumeGradient");
