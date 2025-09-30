/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/typeswgsl";
import m1 from "../../../wgsl/geometry/quadwgsl";
import m2 from "../../../wgsl/use/viewwgsl";
const {} = symbolDictionary;
const _ = decompressString("getFullScreenVertex symbols visibles ../../../wgsl/use/types name SolidVertex imported imports ../../../wgsl/geometry/quad getQuadUV ../../../wgsl/use/view getViewSize modules symbol flags type export attr vertexIndex u32 instanceIndex parameters func exports SolidVertex".split(' '));
const t = {[_(1)]:_([0]),[_(2)]:_([0]),[_(12)]:[{"at":0,[_(4)]:_(3),[_(1)]:_([5]),[_(7)]:[{[_(4)]:_(5),[_(6)]:_(5)}]},{"at":0,[_(4)]:_(8),[_(1)]:_([9]),[_(7)]:[{[_(4)]:_(9),[_(6)]:_(9)}]},{"at":0,[_(4)]:_(10),[_(1)]:_([11]),[_(7)]:[{[_(4)]:_(11),[_(6)]:_(11)}]}],[_(23)]:[{"at":303,[_(13)]:_(0),[_(14)]:1,[_(22)]:{[_(4)]:_(0),[_(15)]:_(5),[_(17)]:_([16]),[_(21)]:[{[_(4)]:_(18),[_(15)]:_(19)},{[_(4)]:_(20),[_(15)]:_(19)}]}}]};
const data = {
  "name": "vertex/full-screen",
  "code": _(["use '",3,"'::{ ",5," };\r\nuse '",8,"'::{ ",9," };\r\nuse '",10,"'::{ ",11," };\r\n\r\n//  0        1      2\r\n//    +------.------/\r\n//    |      .    /\r\n//    |      .  /\r\n//  1 ......../\r\n//    |     /\r\n//    |   /\r\n//    | /\r\n//  2 /\r\n\r\n@",16," fn ",0,"(",18,": u32, ",20,": u32) -> ",5," {\r\n  var c = ",11,"(); // Ensure view uniforms are used\r\n\r\n  var uv = ",9,"(",18,");\r\n  var xy = uv * 2.0 - 1.0;\r\n\r\n  return ",5,"(\r\n    vec4<f32>(xy.x * 2.0 + 1.0, -(xy.y * 2.0 + 1.0), 0.5, 1.0),\r\n    vec4<f32>(1.0, 1.0, 1.0, 1.0),\r\n    vec4<f32>(uv * 2.0, 0.0, 0.0),\r\n    vec4<f32>(0.0),\r\n    vec4<f32>(1.0),\r\n    ",20,",\r\n  );\r\n}"]).join(''),
  "hash": 965742278974346,
  "table": t,
  "shake": [[303,[0]]],
  "tree": decompressAST([[1,0,46],[1,49,97],[1,51,96],[0,203,646],[1,0,7],[2,11,30],[2,61,72],[2,25,36],[2,62,71],[2,64,75]], t[S]),
};
const libs = {"../../../wgsl/use/types": m0, "../../../wgsl/geometry/quad": m1, "../../../wgsl/use/view": m2};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getFullScreenVertex = getSymbol("getFullScreenVertex");
