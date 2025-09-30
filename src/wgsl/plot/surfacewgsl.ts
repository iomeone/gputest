/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/geometry/stripwgsl";
import m1 from "../../wgsl/use/arraywgsl";
import m2 from "../../wgsl/plot/loopwgsl";
const {} = symbolDictionary;
const _ = decompressString("getSize getSurfaceIndex getSurfaceUV symbols visibles ../../wgsl/geometry/strip name getStripIndex imported imports ../../wgsl/use/array sizeToModulus3 packIndex3 unpackIndex3 ../../wgsl/plot/loop loopSurface modules symbol flags vec3<u32> type link attr func externals u32 export index parameters identifiers vec4<f32> exports linkable sizeToModulus3 unpackIndex3 getSize vertex modulus".split(' '));
const t = {[_(3)]:_([0,1,2]),[_(4)]:_([1,2]),[_(16)]:[{"at":0,[_(6)]:_(5),[_(3)]:_([7]),[_(9)]:[{[_(6)]:_(7),[_(8)]:_(7)}]},{"at":0,[_(6)]:_(10),[_(3)]:_([11,12,13]),[_(9)]:[{[_(6)]:_(11),[_(8)]:_(11)},{[_(6)]:_(12),[_(8)]:_(12)},{[_(6)]:_(13),[_(8)]:_(13)}]},{"at":0,[_(6)]:_(14),[_(3)]:_([15]),[_(9)]:[{[_(6)]:_(15),[_(8)]:_(15)}]}],[_(24)]:[{"at":175,[_(17)]:_(0),[_(18)]:2,[_(23)]:{[_(6)]:_(0),[_(20)]:_(19),[_(22)]:_([21])}}],[_(31)]:[{"at":263,[_(17)]:_(1),[_(18)]:1,[_(23)]:{[_(6)]:_(1),[_(20)]:_(25),[_(22)]:_([26]),[_(28)]:[{[_(6)]:_(27),[_(20)]:_(25)}],[_(29)]:_([0])}},{"at":891,[_(17)]:_(2),[_(18)]:1,[_(23)]:{[_(6)]:_(2),[_(20)]:_(30),[_(22)]:_([26]),[_(28)]:[{[_(6)]:_(27),[_(20)]:_(25)}],[_(29)]:_([0])}}],[_(32)]:{[_(0)]:true}};
const data = {
  "name": "plot/surface",
  "code": _(["use '",5,"'::{ ",7," };\r\nuse '",10,"'::{ ",11,", ",12,", un",12," }\r\nuse '",14,"'::{ ",15," };\r\n\r\n@",21," fn ",0,"() -> ",19," {};\r\n\r\n// Index an [x,y] x [x+1,y+1] quad on a surface\r\n@",26," fn ",1,"(",27,": u32) -> u32 {\r\n  let ",36," = ",27," % 6u;\r\n  let instance = ",27," / 6u;\r\n  let s = ",0,"();\r\n\r\n  var dx = 1u;\r\n  var dy = 1u;\r\n  if (LOOP_X) { dx = 0u; }\r\n  if (LOOP_Y) { dy = 0u; }\r\n\r\n  // Modulus for grid of quads (n - 1 unless looped)\r\n  let size = s - ",19,"(dx, dy, 0u);\r\n  let ",37," = ",11,"(size.xyz);\r\n\r\n  var xy = ",7,"(",36," - (",36," / 3u) * 2u);\r\n  if (",36," < 3u) { xy = xy.yx; }\r\n\r\n  let xyd = ",15,"(un",12,"(instance, ",37,"), s, vec2<i32>(xy));\r\n\r\n  // Modulus for grid of vertices (n)\r\n  return ",12,"(xyd, ",11,"(s.xyz));\r\n}\r\n\r\n@",26," fn ",2,"(",27,": u32) -> ",30," {\r\n  let size = ",0,"();\r\n  let ",37," = ",11,"(size);\r\n\r\n  let xyd = un",12,"(",27,", ",37,");\r\n  return ",30,"(vec3<f32>(xyd) / vec3<f32>(size - 1), 0.0);\r\n}"]).join(''),
  "hash": 5279560550449295,
  "table": t,
  "shake": [[175,[0,1,2]],[263,[1]],[891,[2]]],
  "tree": decompressAST([[1,0,50],[1,53,125],[1,74,117],[1,48,82],[0,88,712],[1,0,7],[2,11,26],[2,106,113],[2,215,229],[2,40,53],[2,95,106],[2,12,24],[2,103,113],[2,16,30],[0,30,256],[1,0,7],[2,11,23],[2,54,61],[2,28,42],[2,37,49]], t[S]),
};
const libs = {"../../wgsl/geometry/strip": m0, "../../wgsl/use/array": m1, "../../wgsl/plot/loop": m2};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getSurfaceIndex = getSymbol("getSurfaceIndex");
export const getSurfaceUV = getSymbol("getSurfaceUV");
