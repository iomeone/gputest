/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/typeswgsl";
import m1 from "../../../wgsl/use/viewwgsl";
import m2 from "../../../wgsl/geometry/quadwgsl";
import m3 from "../../../wgsl/geometry/stripwgsl";
import m4 from "../../../wgsl/geometry/linewgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getVertex getInstanceSize getWireframeStripVertex ../../../wgsl/use/types SolidVertex ../../../wgsl/use/view getViewPixelRatio ../../../wgsl/geometry/quad getQuadIndex ../../../wgsl/geometry/strip getStripIndex ../../../wgsl/geometry/line getLineJoin link u32 export vertexIndex instanceIndex SolidVertex geometry getLineJoin getVertex instanceIndex stripIndex triIndex position lineWidth".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[O]:[{[A]:0,[N]:_(3),[S]:_([4]),[K]:[{[N]:_(4),[J]:_(4)}]},{[A]:0,[N]:_(5),[S]:_([6]),[K]:[{[N]:_(6),[J]:_(6)}]},{[A]:0,[N]:_(7),[S]:_([8]),[K]:[{[N]:_(8),[J]:_(8)}]},{[A]:0,[N]:_(9),[S]:_([10]),[K]:[{[N]:_(10),[J]:_(10)}]},{[A]:0,[N]:_(11),[S]:_([12]),[K]:[{[N]:_(12),[J]:_(12)}]}],[X]:[{[A]:268,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(4),[Z]:_([13]),[P]:[{[N]:"v",[T]:_(14)},{[N]:"i",[T]:_(14)}]}},{[A]:323,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:_(14),[Z]:_([13])}}],[E]:[{[A]:364,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(4),[Z]:_([15]),[P]:[{[N]:_(16),[T]:_(14)},{[N]:_(17),[T]:_(14)}],[I]:_([1,0])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "wireframe/wireframe-strip.wgsl",
  code: _(["use '",3,"'::{ ",4," };\r\nuse '",5,"'::{ ",6," };\r\nuse '",7,"'::{ ",8," };\r\nuse '",9,"'::{ ",10," };\r\nuse '",11,"'::{ ",12," };\r\n\r\n@",13," fn ",0,"(v: u32, i: u32) -> ",4," {};\r\n@",13," fn ",1,"() -> u32 {};\r\n\r\n@",15," fn ",2,"(",16,": u32, ",17,": u32) -> ",4," {\r\n  var ij = ",8,"(",16,");\r\n  var xy = vec2<f32>(ij) * 2.0 - 1.0;\r\n\r\n  var n = ",1,"();\r\n  var f = ",17," % n;\r\n  var i = ",17," / n;\r\n\r\n  var ",23," = ",10,"(f);\r\n  var edgeIndex = ",23,".y;\r\n  var ",24," = ",23,".x;\r\n\r\n  var a = ",0,"(",24,", i);\r\n  var b = ",0,"(",24," + 1u + edgeIndex, i);\r\n\r\n  var left = a.",25,".xyz / a.",25,".w;\r\n  var right = b.",25,".xyz / b.",25,".w;\r\n\r\n  if (a.",25,".w < 0.0 || b.",25,".w < 0.0) {\r\n    return ",4,"(\r\n      ",C,"(0.0),\r\n      ",C,"(0.0),\r\n      ",C,"(0.0),\r\n      ",C,"(0.0),\r\n      ",C,"(0.0),\r\n      0u,\r\n    );\r\n  }\r\n\r\n  let ",26," = ",6,"() * 2.0;\r\n  var join: ",D,";\r\n  if (ij.x > 0u) {\r\n    join = ",12,"(left, left, right, 0.0, xy.y, ",26,", 1, 0);\r\n  }\r\n  else {\r\n    join = ",12,"(left, right, right, 0.0, xy.y, ",26,", 2, 0);\r\n  }\r\n\r\n  return ",4,"(\r\n    ",C,"(join, 1.0),\r\n    ",C,"(1.0),\r\n    ",C,"(0.0),\r\n    ",C,"(0.0),\r\n    ",C,"(1.0),\r\n    0u,\r\n  );\r\n}\n"]).join(''),
  hash: 0x9ad64ca4206a0,
  table,
  shake: [[268,[0,2]],[323,[1,2]],[364,[2]]],
  tree: decompressAST([[1,0,46],[1,49,100],[1,54,105],[1,54,107],[1,56,106],[1,55,107],[1,55,91],[0,41,1215],[1,0,7],[2,11,34],[2,65,76],[2,26,38],[2,79,94],[2,101,114],[2,96,105],[2,35,44],[2,199,210],[2,173,190],[2,83,94],[2,87,98],[2,78,89]], table[S]),
};

const libs = {"../../../wgsl/use/types": m0, "../../../wgsl/use/view": m1, "../../../wgsl/geometry/quad": m2, "../../../wgsl/geometry/strip": m3, "../../../wgsl/geometry/line": m4};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getWireframeStripVertex = getSymbol("getWireframeStripVertex");
