/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getCubeGridOverlay export uvw".split(' '));
const table = {[S]:_([0]),[W]:_([0]),[E]:[{[A]:0,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:C,[Z]:_([1]),[P]:[{[N]:_(2),[T]:D}]}}]};
const data = {
  name: "display/cube-grid.wgsl",
  code: _(["@",1," fn ",0,"(uvw: ",D,") -> ",C," {\r\n  var tint = ",D,"(0.0, 0.0, 0.0);\r\n\r\n  let a = abs(uvw);\r\n  var b: vec2<f32>;\r\n\r\n  if (a.x > a.y) {\r\n    if (a.x > a.z) {\r\n      b = uvw.yz / a.x;\r\n      if (uvw.x > 0.0) {\r\n        tint.r += 1.0;\r\n      }\r\n      else {\r\n        tint.r += 1.0;\r\n        tint.g += 0.5;\r\n      }\r\n    }\r\n    else {\r\n      b = uvw.xy / a.z;\r\n      if (uvw.z > 0.0) {\r\n        tint.b += 1.0;\r\n        tint.g += 0.25;\r\n      }\r\n      else {\r\n        tint.b += 1.0;\r\n        tint.r += 0.5;\r\n        tint.g += 0.25;\r\n      }\r\n    }\r\n  }\r\n  else {\r\n    if (a.y > a.z) {\r\n      b = uvw.xz / a.y;\r\n      if (uvw.y > 0.0) {\r\n        tint.g += 1.0;\r\n      }\r\n      else {\r\n        tint.g += 1.0;\r\n        tint.b += 0.5;\r\n      }\r\n    }\r\n    else {\r\n      b = uvw.xy / a.z;\r\n      if (uvw.z > 0.0) {\r\n        tint.b += 1.0;\r\n        tint.g += 0.25;\r\n      }\r\n      else {\r\n        tint.b += 1.0;\r\n        tint.r += 0.5;\r\n        tint.g += 0.25;\r\n      }\r\n    }\r\n  }\r\n  let border = clamp(50.0 * (max(abs(b.x), abs(b.y)) - 0.9), 0.0, 1.0);\r\n\r\n  return ",C,"(tint, border);\r\n};\n"]).join(''),
  hash: 0x2032cd4468e9f,
  table,
  shake: [[0,[0]]],
  tree: decompressAST([[0,0,1115],[1,0,7],[2,11,29]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getCubeGridOverlay = getSymbol("getCubeGridOverlay");
