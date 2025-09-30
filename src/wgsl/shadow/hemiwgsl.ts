/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
import m0 from "../../wgsl/use/typeswgsl";
import m1 from "../../wgsl/codec/octahedralwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("sampleShadow applyHemiShadow ../../wgsl/use/types Light SurfaceFragment ../../wgsl/codec/octahedral encodeOctahedral encodeHemiOctahedral f32 optional link vec2<f32> index u32 level export light surface sampleShadow surface shadowBias shadowUV SHADOW_PAGE".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[O]:[{[A]:0,[N]:_(2),[S]:_([3,4]),[K]:[{[N]:_(3),[J]:_(3)},{[N]:_(4),[J]:_(4)}]},{[A]:0,[N]:_(5),[S]:_([6,7]),[K]:[{[N]:_(6),[J]:_(6)},{[N]:_(7),[J]:_(7)}]}],[X]:[{[A]:139,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:_(8),[Z]:_([9,10]),[P]:[{[N]:"uv",[T]:_(11)},{[N]:_(12),[T]:_(13)},{[N]:_(14),[T]:_(8)}]}}],[E]:[{[A]:236,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(8),[Z]:_([15]),[P]:[{[N]:_(16),[T]:_(3)},{[N]:_(17),[T]:_(4)}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "shadow/hemi.wgsl",
  code: _(["use '",2,"'::{ ",3,", ",4," };\r\nuse '",5,"'::{ ",6,", ",7," };\r\n\r\n@",9," @",10," fn ",0,"(uv: ",11,", ",12,": u32, ",14,": f32) -> f32 { return 1.0; }\r\n\r\n@",15," fn ",1,"(\r\n  ",16,": ",3,",\r\n  ",17,": ",4,",\r\n) -> f32 {\r\n  let ",12," = u32(",16,".shadowMap);\r\n\r\n  let pos = ",16,".into * ",C,"(",17,".position.xyz + ",17,".normal.xyz * ",16,".",20,".z, 1.0);\r\n  let dir = normalize(pos.xyz);\r\n\r\n  let n = dot(",17,".normal.xyz, dir);\r\n  let slope = (1.0 - abs(n));\r\n\r\n  let a = abs(pos.xyz);\r\n  let z = max(max(a.x, a.y), a.z) * (1.0 - ",16,".",20,".x) - slope * ",16,".",20,".y;\r\n\r\n  let depth = dot(",11,"(1.0, 1.0/z), ",16,".shadowDepth);\r\n\r\n  let blur = ",16,".shadowBlur;\r\n\r\n  let size = (",16,".",21,".zw - ",16,".",21,".xy) * ",22,";\r\n  let uvm = (",7,"(dir.zxy) * (size - f32(blur) * 2.0) / size) *.5 + .5;\r\n  let uv = mix(",16,".",21,".xy, ",16,".",21,".zw, uvm);\r\n\r\n  var s = 0.0;\r\n  if (blur >= 4) {\r\n    for (var y = -1.5; y <= 1.5; y += 1.0) {\r\n      for (var x = -1.5; x <= 1.5; x += 1.0) {\r\n        s += ",0,"(uv + ",11,"(x, y) / ",22,", ",12,", depth);\r\n      }\r\n    }\r\n    s /= 16.0;\r\n  }\r\n  else if (blur == 3) {\r\n    for (var y = -1.0; y <= 1.0; y += 1.0) {\r\n      for (var x = -1.0; x <= 1.0; x += 1.0) {\r\n        s += ",0,"(uv + ",11,"(x, y) / ",22,", ",12,", depth);\r\n      }\r\n    }\r\n    s /= 9.0;\r\n  }\r\n  else if (blur == 2) {\r\n    for (var y = -0.5; y <= 0.5; y += 1.0) {\r\n      for (var x = -0.5; x <= 0.5; x += 1.0) {\r\n        s += ",0,"(uv + ",11,"(x, y) / ",22,", ",12,", depth);\r\n      }\r\n    }\r\n    s /= 4.0;\r\n  }\r\n  else {\r\n    s += ",0,"(uv, ",12,", depth);\r\n  }\r\n\r\n  return s;\r\n};\n"]).join(''),
  hash: 0x81072be2640b6,
  table,
  shake: [[139,[0,1]],[236,[1]]],
  tree: decompressAST([[1,0,54],[1,57,134],[4,82,175,0],[1,0,9],[1,10,15],[2,9,21],[0,78,1642],[1,0,7],[2,11,26],[2,27,32],[2,19,34],[2,585,605],[2,281,293],[2,234,246],[2,233,245],[2,120,132]], table[S]),
};

const libs = {"../../wgsl/use/types": m0, "../../wgsl/codec/octahedral": m1};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const applyHemiShadow = getSymbol("applyHemiShadow");
