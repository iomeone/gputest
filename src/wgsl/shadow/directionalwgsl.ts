/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/use/typeswgsl";
const {} = symbolDictionary;
const _ = decompressString("sampleShadow applyDirectionalShadow symbols visibles ../../wgsl/use/types name Light SurfaceFragment imported imports modules symbol flags f32 type optional link attr vec2<f32> index u32 level parameters func externals export light surface identifiers exports linkable sampleShadow return surface normal shadowBias shadowUV SHADOW_PAGE".split(' '));
const t = {[_(2)]:_([0,1]),[_(3)]:_([1]),[_(10)]:[{"at":0,[_(5)]:_(4),[_(2)]:_([6,7]),[_(9)]:[{[_(5)]:_(6),[_(8)]:_(6)},{[_(5)]:_(7),[_(8)]:_(7)}]}],[_(24)]:[{"at":59,[_(11)]:_(0),[_(12)]:6,[_(23)]:{[_(5)]:_(0),[_(14)]:_(13),[_(17)]:_([15,16]),[_(22)]:[{[_(5)]:"uv",[_(14)]:_(18)},{[_(5)]:_(19),[_(14)]:_(20)},{[_(5)]:_(21),[_(14)]:_(13)}]}}],[_(29)]:[{"at":156,[_(11)]:_(1),[_(12)]:1,[_(23)]:{[_(5)]:_(1),[_(14)]:_(13),[_(17)]:_([25]),[_(22)]:[{[_(5)]:_(26),[_(14)]:_(6)},{[_(5)]:_(27),[_(14)]:_(7)}],[_(28)]:_([0])}}],[_(30)]:{[_(0)]:true}};
const data = {
  "name": "shadow/directional",
  "code": _(["use '",4,"'::{ ",6,", ",7," };\r\n\r\n@",15," @",16," fn ",0,"(uv: ",18,", ",19,": u32, ",21,": f32) -> f32 { ",32," 1.0; }\r\n\r\n@",25," fn ",1,"(\r\n  ",26,": ",6,",\r\n  ",27,": ",7,",\r\n) -> f32 {\r\n  let ",19," = u32(",26,".shadowMap);\r\n\r\n  let pos = ",26,".into * vec4<f32>(",27,".position.xyz + ",27,".",34,".xyz * ",26,".",35,".z, 1.0);\r\n  if (abs(pos.x) > 1.0 || abs(pos.y) > 1.0) {\r\n    ",32," 1.0;\r\n  }\r\n\r\n  let n = dot(",27,".",34,".xyz, ",26,".",34,".xyz);\r\n  let slope = (1.0 - abs(n));\r\n\r\n  let depth = pos.z * (1.0 + ",26,".",35,".x) + slope * ",26,".",35,".y;\r\n  let blur = ",26,".shadowBlur;\r\n  var s = 0.0;\r\n\r\n  let res = f32(blur) / (2.0 * (",26,".",36,".zw - ",26,".",36,".xy) * ",37,");\r\n  let uv = clamp(pos.xy * .5 + .5, ",18,"(res), ",18,"(1.0 - res));\r\n  let uvm = mix(",26,".",36,".xy, ",26,".",36,".zw, uv);\r\n\r\n  if (blur >= 4) {\r\n    for (var y = -1.5; y <= 1.5; y += 1.0) {\r\n      for (var x = -1.5; x <= 1.5; x += 1.0) {\r\n        s += ",0,"(uvm + ",18,"(x, y) / ",37,", ",19,", depth);\r\n      }\r\n    }\r\n    s /= 16.0;\r\n  }\r\n  else if (blur == 3) {\r\n    for (var y = -1.0; y <= 1.0; y += 1.0) {\r\n      for (var x = -1.0; x <= 1.0; x += 1.0) {\r\n        s += ",0,"(uvm + ",18,"(x, y) / ",37,", ",19,", depth);\r\n      }\r\n    }\r\n    s /= 9.0;\r\n  }\r\n  else if (blur == 2) {\r\n    for (var y = -0.5; y <= 0.5; y += 1.0) {\r\n      for (var x = -0.5; x <= 0.5; x += 1.0) {\r\n        s += ",0,"(uvm + ",18,"(x, y) / ",37,", ",19,", depth);\r\n      }\r\n    }\r\n    s /= 4.0;\r\n  }\r\n  else {\r\n    s += ",0,"(uvm, ",19,", depth);\r\n  }\r\n\r\n  ",32," s;\r\n};"]).join(''),
  "hash": 4357162787706317,
  "table": t,
  "shake": [[59,[0,1]],[156,[1]]],
  "tree": decompressAST([[1,0,54],[4,59,152,0],[1,0,9],[1,10,15],[2,9,21],[0,78,1602],[1,0,7],[2,11,33],[2,34,39],[2,19,34],[2,815,827],[2,235,247],[2,234,246],[2,121,133]], t[S]),
};
const libs = {"../../wgsl/use/types": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const applyDirectionalShadow = getSymbol("applyDirectionalShadow");
