/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/typeswgsl";
import m1 from "../../../wgsl/use/viewwgsl";
import m2 from "../../../wgsl/geometry/quadwgsl";
import m3 from "../../../wgsl/geometry/stripwgsl";
import m4 from "../../../wgsl/geometry/linewgsl";
const {} = symbolDictionary;
const _ = decompressString("getVertex getInstanceSize getWireframeListVertex symbols visibles ../../../wgsl/use/types name SolidVertex imported imports ../../../wgsl/use/view getViewPixelRatio ../../../wgsl/geometry/quad getQuadIndex ../../../wgsl/geometry/strip getStripIndex ../../../wgsl/geometry/line getLineJoin modules symbol flags type link attr u32 parameters func externals export vertexIndex instanceIndex identifiers exports linkable SolidVertex geometry getLineJoin getVertex instanceIndex position lineWidth".split(' '));
const t = {[_(3)]:_([0,1,2]),[_(4)]:_([2]),[_(18)]:[{"at":0,[_(6)]:_(5),[_(3)]:_([7]),[_(9)]:[{[_(6)]:_(7),[_(8)]:_(7)}]},{"at":0,[_(6)]:_(10),[_(3)]:_([11]),[_(9)]:[{[_(6)]:_(11),[_(8)]:_(11)}]},{"at":0,[_(6)]:_(12),[_(3)]:_([13]),[_(9)]:[{[_(6)]:_(13),[_(8)]:_(13)}]},{"at":0,[_(6)]:_(14),[_(3)]:_([15]),[_(9)]:[{[_(6)]:_(15),[_(8)]:_(15)}]},{"at":0,[_(6)]:_(16),[_(3)]:_([17]),[_(9)]:[{[_(6)]:_(17),[_(8)]:_(17)}]}],[_(27)]:[{"at":268,[_(19)]:_(0),[_(20)]:2,[_(26)]:{[_(6)]:_(0),[_(21)]:_(7),[_(23)]:_([22]),[_(25)]:[{[_(6)]:"v",[_(21)]:_(24)},{[_(6)]:"i",[_(21)]:_(24)}]}},{"at":323,[_(19)]:_(1),[_(20)]:2,[_(26)]:{[_(6)]:_(1),[_(21)]:_(24),[_(23)]:_([22])}}],[_(32)]:[{"at":364,[_(19)]:_(2),[_(20)]:1,[_(26)]:{[_(6)]:_(2),[_(21)]:_(7),[_(23)]:_([28]),[_(25)]:[{[_(6)]:_(29),[_(21)]:_(24)},{[_(6)]:_(30),[_(21)]:_(24)}],[_(31)]:_([1,0])}}],[_(33)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "wireframe/wireframe-list",
  "code": _(["use '",5,"'::{ ",7," };\r\nuse '",10,"'::{ ",11," };\r\nuse '",12,"'::{ ",13," };\r\nuse '",14,"'::{ ",15," };\r\nuse '",16,"'::{ ",17," };\r\n\r\n@",22," fn ",0,"(v: u32, i: u32) -> ",7," {};\r\n@",22," fn ",1,"() -> u32 {};\r\n\r\n@",28," fn ",2,"(",29,": u32, ",30,": u32) -> ",7," {\r\n  var ij = ",15,"(",29,");\r\n  var xy = vec2<f32>(ij) * 2.0 - 1.0;\r\n\r\n  var n = ",1,"();\r\n  var f = ",30," % n;\r\n  var i = ",30," / n;\r\n\r\n  var v = u32(f) % 3u;\r\n  var t = u32(f) - v;\r\n\r\n  var ia: u32;\r\n  var ib: u32;\r\n  var ic: u32;\r\n  if (v == 0u) {\r\n    ia = t;\r\n    ib = t + 1u;\r\n    ic = t + 2u;\r\n  }\r\n  else if (v == 1u) {\r\n    ia = t + 1u;\r\n    ib = t + 2u;\r\n    ic = t;\r\n  }\r\n  else if (v == 2u) {\r\n    ia = t + 2u;\r\n    ib = t;\r\n    ic = t + 1u;\r\n  }\r\n\r\n  var a = ",0,"(ia, i);\r\n  var b = ",0,"(ib, i);\r\n  var c = ",0,"(ic, i);\r\n\r\n  if (a.",39,".w < 0.0 || b.",39,".w < 0.0 || c.",39,".w < 0.0) {\r\n    return ",7,"(\r\n      vec4<f32>(0.0),\r\n      vec4<f32>(0.0),\r\n      vec4<f32>(0.0),\r\n      vec4<f32>(0.0),\r\n      vec4<f32>(0.0),\r\n      0u,\r\n    );\r\n  }\r\n\r\n  var left  = a.",39,".xyz / a.",39,".w;\r\n  var right = b.",39,".xyz / b.",39,".w;\r\n  var other = c.",39,".xyz / c.",39,".w;\r\n\r\n  let ",40," = ",11,"() * 2.0;\r\n  var join: vec3<f32>;\r\n  if (ij.x > 0u) {\r\n    join = ",17,"(left, right, other, f32(ij.x) - 1.0, xy.y, ",40,", 3, 0);\r\n  }\r\n  else {\r\n    join = ",17,"(other, left, right, 1.0, xy.y, ",40,", 3, 0);\r\n  }\r\n\r\n  return ",7,"(\r\n    vec4<f32>(join, 1.0),\r\n    vec4<f32>(1.0),\r\n    vec4<f32>(0.0),\r\n    vec4<f32>(0.0),\r\n    vec4<f32>(1.0),\r\n    0u,\r\n  );\r\n}"]).join(''),
  "hash": 862385638206259,
  "table": t,
  "shake": [[268,[0,2]],[323,[1,2]],[364,[2]]],
  "tree": decompressAST([[1,0,46],[1,49,100],[1,54,105],[1,54,107],[1,56,106],[1,55,107],[1,55,91],[0,41,1517],[1,0,7],[2,11,33],[2,64,75],[2,26,39],[2,80,95],[2,417,426],[2,29,38],[2,29,38],[2,105,116],[2,313,330],[2,83,94],[2,100,111],[2,78,89]], t[S]),
};
const libs = {"../../../wgsl/use/types": m0, "../../../wgsl/use/view": m1, "../../../wgsl/geometry/quad": m2, "../../../wgsl/geometry/strip": m3, "../../../wgsl/geometry/line": m4};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getWireframeListVertex = getSymbol("getWireframeListVertex");
