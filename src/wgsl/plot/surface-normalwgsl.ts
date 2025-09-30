/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/geometry/stripwgsl";
import m1 from "../../wgsl/use/arraywgsl";
import m2 from "../../wgsl/plot/loopwgsl";
const {} = symbolDictionary;
const _ = decompressString("getSize getPosition getSurfaceNormal symbols visibles ../../wgsl/geometry/strip name getStripIndex imported imports ../../wgsl/use/array sizeToModulus3 packIndex3 unpackIndex3 ../../wgsl/plot/loop loopSurface modules symbol flags vec3<u32> type link attr func vec4<f32> optional index u32 parameters externals export identifiers exports linkable packIndex3 loopSurface getPosition modulus".split(' '));
const t = {[_(3)]:_([0,1,2]),[_(4)]:_([2]),[_(16)]:[{"at":0,[_(6)]:_(5),[_(3)]:_([7]),[_(9)]:[{[_(6)]:_(7),[_(8)]:_(7)}]},{"at":0,[_(6)]:_(10),[_(3)]:_([11,12,13]),[_(9)]:[{[_(6)]:_(11),[_(8)]:_(11)},{[_(6)]:_(12),[_(8)]:_(12)},{[_(6)]:_(13),[_(8)]:_(13)}]},{"at":0,[_(6)]:_(14),[_(3)]:_([15]),[_(9)]:[{[_(6)]:_(15),[_(8)]:_(15)}]}],[_(29)]:[{"at":175,[_(17)]:_(0),[_(18)]:2,[_(23)]:{[_(6)]:_(0),[_(20)]:_(19),[_(22)]:_([21])}},{"at":212,[_(17)]:_(1),[_(18)]:6,[_(23)]:{[_(6)]:_(1),[_(20)]:_(24),[_(22)]:_([25,21]),[_(28)]:[{[_(6)]:_(26),[_(20)]:_(27)}]}}],[_(32)]:[{"at":313,[_(17)]:_(2),[_(18)]:1,[_(23)]:{[_(6)]:_(2),[_(20)]:_(24),[_(22)]:_([30]),[_(28)]:[{[_(6)]:_(26),[_(20)]:_(27)}],[_(31)]:_([0,1])}}],[_(33)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "plot/surface-normal",
  "code": _(["use '",5,"'::{ ",7," };\r\nuse '",10,"'::{ ",11,", ",12,", un",12," }\r\nuse '",14,"'::{ ",15," };\r\n\r\n@",21," fn ",0,"() -> ",19," {};\r\n@",25," @",21," fn ",1,"(",26,": u32) -> ",24," { return ",24,"(0.0, 0.0, 0.0, 0.0); }\r\n\r\n@",30," fn ",2,"(",26,": u32) -> ",24," {\r\n  let size = ",0,"();\r\n  let ",37," = ",11,"(size);\r\n\r\n  let xyd = un",12,"(",26,", ",37,");\r\n\r\n  let left   = ",12,"(",15,"(xyd, size, vec2<i32>(-1, 0)), ",37,");\r\n  let right  = ",12,"(",15,"(xyd, size, vec2<i32>(1, 0)), ",37,");\r\n  let top    = ",12,"(",15,"(xyd, size, vec2<i32>(0, -1)), ",37,");\r\n  let bottom = ",12,"(",15,"(xyd, size, vec2<i32>(0, 1)), ",37,");\r\n\r\n  let dx = ",1,"(right) - ",1,"(left);\r\n  let dy = ",1,"(bottom) - ",1,"(top);\r\n\r\n  let normal = ",24,"(normalize(cross(dx.xyz, dy.xyz)), 0.0);\r\n  return normal;\r\n}"]).join(''),
  "hash": 8883743993045754,
  "table": t,
  "shake": [[175,[0,2]],[212,[1,2]],[313,[2]]],
  "tree": decompressAST([[1,0,50],[1,53,125],[1,74,117],[1,48,82],[4,37,134,1],[1,0,9],[1,10,15],[2,9,20],[0,82,756],[1,0,7],[2,11,27],[2,58,65],[2,28,42],[2,37,49],[2,48,58],[2,11,22],[2,68,78],[2,11,22],[2,67,77],[2,11,22],[2,68,78],[2,11,22],[2,65,76],[2,21,32],[2,31,42],[2,22,33]], t[S]),
};
const libs = {"../../wgsl/geometry/strip": m0, "../../wgsl/use/array": m1, "../../wgsl/plot/loop": m2};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getSurfaceNormal = getSymbol("getSurfaceNormal");
