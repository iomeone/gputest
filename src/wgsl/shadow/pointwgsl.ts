/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/use/typeswgsl";
import m1 from "../../wgsl/codec/octahedralwgsl";
const {} = symbolDictionary;
const _ = decompressString("sampleShadow applyPointShadow symbols visibles ../../wgsl/use/types name Light SurfaceFragment imported imports ../../wgsl/codec/octahedral encodeOctahedral modules symbol flags f32 type optional link attr vec2<f32> index u32 level parameters func externals export light surface identifiers exports linkable sampleShadow surface shadowBias shadowUV SHADOW_PAGE".split(' '));
const t = {[_(2)]:_([0,1]),[_(3)]:_([1]),[_(12)]:[{"at":0,[_(5)]:_(4),[_(2)]:_([6,7]),[_(9)]:[{[_(5)]:_(6),[_(8)]:_(6)},{[_(5)]:_(7),[_(8)]:_(7)}]},{"at":0,[_(5)]:_(10),[_(2)]:_([11]),[_(9)]:[{[_(5)]:_(11),[_(8)]:_(11)}]}],[_(26)]:[{"at":117,[_(13)]:_(0),[_(14)]:6,[_(25)]:{[_(5)]:_(0),[_(16)]:_(15),[_(19)]:_([17,18]),[_(24)]:[{[_(5)]:"uv",[_(16)]:_(20)},{[_(5)]:_(21),[_(16)]:_(22)},{[_(5)]:_(23),[_(16)]:_(15)}]}}],[_(31)]:[{"at":214,[_(13)]:_(1),[_(14)]:1,[_(25)]:{[_(5)]:_(1),[_(16)]:_(15),[_(19)]:_([27]),[_(24)]:[{[_(5)]:_(28),[_(16)]:_(6)},{[_(5)]:_(29),[_(16)]:_(7)}],[_(30)]:_([0])}}],[_(32)]:{[_(0)]:true}};
const data = {
  "name": "shadow/point",
  "code": _(["use '",4,"'::{ ",6,", ",7," };\r\nuse '",10,"'::{ ",11," };\r\n\r\n@",17," @",18," fn ",0,"(uv: ",20,", ",21,": u32, ",23,": f32) -> f32 { return 1.0; }\r\n\r\n@",27," fn ",1,"(\r\n  ",28,": ",6,",\r\n  ",29,": ",7,",\r\n) -> f32 {\r\n  let ",21," = u32(",28,".shadowMap);\r\n\r\n  let pos = ",28,".into * vec4<f32>(",29,".position.xyz + ",29,".normal.xyz * ",28,".",35,".z, 1.0);\r\n  let dir = normalize(pos.xyz);\r\n\r\n  let n = dot(",29,".normal.xyz, dir);\r\n  let slope = (1.0 - abs(n));\r\n\r\n  let a = abs(pos.xyz);\r\n  let z = max(max(a.x, a.y), a.z) * (1.0 - ",28,".",35,".x) - slope * ",28,".",35,".y;\r\n\r\n  let depth = dot(",20,"(1.0, 1.0/z), ",28,".shadowDepth);\r\n\r\n  let blur = ",28,".shadowBlur;\r\n  var s = 0.0;\r\n\r\n  let size = (",28,".",36,".zw - ",28,".",36,".xy) * ",37,";\r\n  let uvm = (",11,"(dir) * (size - f32(blur) * 2.0) / size) *.5 + .5;\r\n  let uv = mix(",28,".",36,".xy, ",28,".",36,".zw, uvm);\r\n\r\n  if (blur >= 4) {\r\n    for (var y = -1.5; y <= 1.5; y += 1.0) {\r\n      for (var x = -1.5; x <= 1.5; x += 1.0) {\r\n        s += ",0,"(uv + ",20,"(x, y) / ",37,", ",21,", depth);\r\n      }\r\n    }\r\n    s /= 16.0;\r\n  }\r\n  else if (blur == 3) {\r\n    for (var y = -1.0; y <= 1.0; y += 1.0) {\r\n      for (var x = -1.0; x <= 1.0; x += 1.0) {\r\n        s += ",0,"(uv + ",20,"(x, y) / ",37,", ",21,", depth);\r\n      }\r\n    }\r\n    s /= 9.0;\r\n  }\r\n  else if (blur == 2) {\r\n    for (var y = -0.5; y <= 0.5; y += 1.0) {\r\n      for (var x = -0.5; x <= 0.5; x += 1.0) {\r\n        s += ",0,"(uv + ",20,"(x, y) / ",37,", ",21,", depth);\r\n      }\r\n    }\r\n    s /= 4.0;\r\n  }\r\n  else {\r\n    s += ",0,"(uv, ",21,", depth);\r\n  }\r\n\r\n  return s;\r\n};"]).join(''),
  "hash": 5064558313661135,
  "table": t,
  "shake": [[117,[0,1]],[214,[1]]],
  "tree": decompressAST([[1,0,54],[1,57,112],[4,60,153,0],[1,0,9],[1,10,15],[2,9,21],[0,78,1635],[1,0,7],[2,11,27],[2,28,33],[2,19,34],[2,601,617],[2,257,269],[2,234,246],[2,233,245],[2,120,132]], t[S]),
};
const libs = {"../../wgsl/use/types": m0, "../../wgsl/codec/octahedral": m1};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const applyPointShadow = getSymbol("applyPointShadow");
