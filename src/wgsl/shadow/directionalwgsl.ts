/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
import m0 from "../../wgsl/use/typeswgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("sampleShadow applyDirectionalShadow ../../wgsl/use/types Light SurfaceFragment f32 optional link vec2<f32> index u32 level export light surface sampleShadow return surface normal shadowBias shadowUV SHADOW_PAGE".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[O]:[{[A]:0,[N]:_(2),[S]:_([3,4]),[K]:[{[N]:_(3),[J]:_(3)},{[N]:_(4),[J]:_(4)}]}],[X]:[{[A]:59,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:_(5),[Z]:_([6,7]),[P]:[{[N]:"uv",[T]:_(8)},{[N]:_(9),[T]:_(10)},{[N]:_(11),[T]:_(5)}]}}],[E]:[{[A]:156,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(5),[Z]:_([12]),[P]:[{[N]:_(13),[T]:_(3)},{[N]:_(14),[T]:_(4)}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "shadow/directional.wgsl",
  code: _(["use '",2,"'::{ ",3,", ",4," };\r\n\r\n@",6," @",7," fn ",0,"(uv: ",8,", ",9,": u32, ",11,": f32) -> f32 { ",16," 1.0; }\r\n\r\n@",12," fn ",1,"(\r\n  ",13,": ",3,",\r\n  ",14,": ",4,",\r\n) -> f32 {\r\n  let ",9," = u32(",13,".shadowMap);\r\n\r\n  let pos = ",13,".into * ",C,"(",14,".position.xyz + ",14,".",18,".xyz * ",13,".",19,".z, 1.0);\r\n  if (abs(pos.x) > 1.0 || abs(pos.y) > 1.0) {\r\n    ",16," 1.0;\r\n  }\r\n\r\n  let n = dot(",14,".",18,".xyz, ",13,".",18,".xyz);\r\n  let slope = (1.0 - abs(n));\r\n\r\n  let depth = pos.z * (1.0 + ",13,".",19,".x) + slope * ",13,".",19,".y;\r\n  let blur = ",13,".shadowBlur;\r\n\r\n  let res = f32(blur) / (2.0 * (",13,".",20,".zw - ",13,".",20,".xy) * ",21,");\r\n  let uvm = clamp(pos.xy * .5 + .5, ",8,"(res), ",8,"(1.0 - res));\r\n  let uv = mix(",13,".",20,".xy, ",13,".",20,".zw, uvm);\r\n\r\n  var s = 0.0;\r\n  if (blur >= 4) {\r\n    for (var y = -1.5; y <= 1.5; y += 1.0) {\r\n      for (var x = -1.5; x <= 1.5; x += 1.0) {\r\n        s += ",0,"(uv + ",8,"(x, y) / ",21,", ",9,", depth);\r\n      }\r\n    }\r\n    s /= 16.0;\r\n  }\r\n  else if (blur == 3) {\r\n    for (var y = -1.0; y <= 1.0; y += 1.0) {\r\n      for (var x = -1.0; x <= 1.0; x += 1.0) {\r\n        s += ",0,"(uv + ",8,"(x, y) / ",21,", ",9,", depth);\r\n      }\r\n    }\r\n    s /= 9.0;\r\n  }\r\n  else if (blur == 2) {\r\n    for (var y = -0.5; y <= 0.5; y += 1.0) {\r\n      for (var x = -0.5; x <= 0.5; x += 1.0) {\r\n        s += ",0,"(uv + ",8,"(x, y) / ",21,", ",9,", depth);\r\n      }\r\n    }\r\n    s /= 4.0;\r\n  }\r\n  else {\r\n    s += ",0,"(uv, ",9,", depth);\r\n  }\r\n\r\n  ",16," s;\r\n};\n"]).join(''),
  hash: 0xa5831fd4affb,
  table,
  shake: [[59,[0,1]],[156,[1]]],
  tree: decompressAST([[1,0,54],[4,59,152,0],[1,0,9],[1,10,15],[2,9,21],[0,78,1599],[1,0,7],[2,11,33],[2,34,39],[2,19,34],[2,816,828],[2,234,246],[2,233,245],[2,120,132]], table[S]),
};

const libs = {"../../wgsl/use/types": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const applyDirectionalShadow = getSymbol("applyDirectionalShadow");
