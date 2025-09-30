/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
import m0 from "../../wgsl/use/typeswgsl";
import m1 from "../../wgsl/codec/octahedralwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("sampleShadow applyPointShadow ../../wgsl/use/types Light SurfaceFragment ../../wgsl/codec/octahedral encodeOctahedral f32 optional link vec2<f32> index u32 level export light surface sampleShadow surface shadowBias shadowUV SHADOW_PAGE".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[O]:[{[A]:0,[N]:_(2),[S]:_([3,4]),[K]:[{[N]:_(3),[J]:_(3)},{[N]:_(4),[J]:_(4)}]},{[A]:0,[N]:_(5),[S]:_([6]),[K]:[{[N]:_(6),[J]:_(6)}]}],[X]:[{[A]:117,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:_(7),[Z]:_([8,9]),[P]:[{[N]:"uv",[T]:_(10)},{[N]:_(11),[T]:_(12)},{[N]:_(13),[T]:_(7)}]}}],[E]:[{[A]:214,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(7),[Z]:_([14]),[P]:[{[N]:_(15),[T]:_(3)},{[N]:_(16),[T]:_(4)}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "shadow/point.wgsl",
  code: _(["use '",2,"'::{ ",3,", ",4," };\r\nuse '",5,"'::{ ",6," };\r\n\r\n@",8," @",9," fn ",0,"(uv: ",10,", ",11,": u32, ",13,": f32) -> f32 { return 1.0; }\r\n\r\n@",14," fn ",1,"(\r\n  ",15,": ",3,",\r\n  ",16,": ",4,",\r\n) -> f32 {\r\n  let ",11," = u32(",15,".shadowMap);\r\n\r\n  let pos = ",15,".into * ",C,"(",16,".position.xyz + ",16,".normal.xyz * ",15,".",19,".z, 1.0);\r\n  let dir = normalize(pos.xyz);\r\n\r\n  let n = dot(",16,".normal.xyz, dir);\r\n  let slope = (1.0 - abs(n));\r\n\r\n  let a = abs(pos.xyz);\r\n  let z = max(max(a.x, a.y), a.z) * (1.0 - ",15,".",19,".x) - slope * ",15,".",19,".y;\r\n\r\n  let depth = dot(",10,"(1.0, 1.0/z), ",15,".shadowDepth);\r\n\r\n  let blur = ",15,".shadowBlur;\r\n\r\n  let size = (",15,".",20,".zw - ",15,".",20,".xy) * ",21,";\r\n  let uvm = (",6,"(dir) * (size - f32(blur) * 2.0) / size) *.5 + .5;\r\n  let uv = mix(",15,".",20,".xy, ",15,".",20,".zw, uvm);\r\n\r\n  var s = 0.0;\r\n  if (blur >= 4) {\r\n    for (var y = -1.5; y <= 1.5; y += 1.0) {\r\n      for (var x = -1.5; x <= 1.5; x += 1.0) {\r\n        s += ",0,"(uv + ",10,"(x, y) / ",21,", ",11,", depth);\r\n      }\r\n    }\r\n    s /= 16.0;\r\n  }\r\n  else if (blur == 3) {\r\n    for (var y = -1.0; y <= 1.0; y += 1.0) {\r\n      for (var x = -1.0; x <= 1.0; x += 1.0) {\r\n        s += ",0,"(uv + ",10,"(x, y) / ",21,", ",11,", depth);\r\n      }\r\n    }\r\n    s /= 9.0;\r\n  }\r\n  else if (blur == 2) {\r\n    for (var y = -0.5; y <= 0.5; y += 1.0) {\r\n      for (var x = -0.5; x <= 0.5; x += 1.0) {\r\n        s += ",0,"(uv + ",10,"(x, y) / ",21,", ",11,", depth);\r\n      }\r\n    }\r\n    s /= 4.0;\r\n  }\r\n  else {\r\n    s += ",0,"(uv, ",11,", depth);\r\n  }\r\n\r\n  return s;\r\n};\n"]).join(''),
  hash: 0xe804f1c8fff18,
  table,
  shake: [[117,[0,1]],[214,[1]]],
  tree: decompressAST([[1,0,54],[1,57,112],[4,60,153,0],[1,0,9],[1,10,15],[2,9,21],[0,78,1635],[1,0,7],[2,11,27],[2,28,33],[2,19,34],[2,585,601],[2,273,285],[2,234,246],[2,233,245],[2,120,132]], table[S]),
};

const libs = {"../../wgsl/use/types": m0, "../../wgsl/codec/octahedral": m1};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const applyPointShadow = getSymbol("applyPointShadow");
