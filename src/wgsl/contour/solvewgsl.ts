/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("approx3x3 eps orthogonalize3x3 export system mat3x4<f32> system maxAxis return orthogonalize3x3 matrix projected maxAbs".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([0]),[E]:[{[A]:0,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:D,[Z]:_([3]),[P]:[{[N]:_(4),[T]:_(5)}],[I]:_([2])}}]};
const data = {
  name: "contour/solve.wgsl",
  code: _(["@",3," fn ",0,"(",4,": ",5,") -> ",D," {\r\n  let trace = abs(",D,"(",4,"[0][0], ",4,"[1][1], ",4,"[2][2]));\r\n  let ",7," = max(trace.x, max(trace.y, trace.z));\r\n\r\n  if (",7," == trace.x) {\r\n    if (trace.y > trace.z) {\r\n      ",8," ",2,"(",4,", 0u, 1u, 2u);\r\n    }\r\n    else {\r\n      ",8," ",2,"(",4,", 0u, 2u, 1u);\r\n    }\r\n  }\r\n  else if (",7," == trace.y) {\r\n    if (trace.x > trace.z) {\r\n      ",8," ",2,"(",4,", 1u, 0u, 2u);\r\n    }\r\n    else {\r\n      ",8," ",2,"(",4,", 1u, 2u, 0u);\r\n    }\r\n  }\r\n  else {\r\n    if (trace.x > trace.y) {\r\n      ",8," ",2,"(",4,", 2u, 0u, 1u);\r\n    }\r\n    else {\r\n      ",8," ",2,"(",4,", 2u, 1u, 0u);\r\n    }\r\n  }\r\n}\r\n\r\nconst eps = 1.0e-2;\r\n\r\nfn ",2,"(\r\n  ",10,": ",5,",\r\n  i: u32,\r\n  j: u32,\r\n  k: u32,\r\n) -> ",D," {\r\n  var v1 = ",10,"[i];\r\n  var v2 = ",10,"[j];\r\n  var v3 = ",10,"[k];\r\n\r\n  let id1 = 1.0 / dot(v1.xyz, v1.xyz);\r\n  var ",11," = v1.xyz * (v1.w * id1);\r\n\r\n  v2 = v2 - v1 * (dot(v2.xyz, v1.xyz) * id1);\r\n  v3 = v3 - v1 * (dot(v3.xyz, v1.xyz) * id1);\r\n\r\n  let id2 = 1.0 / dot(v2.xyz, v2.xyz);\r\n  let id3 = 1.0 / dot(v3.xyz, v3.xyz);\r\n  if (id2 < id3) {\r\n    if (id1 / id2 > eps) {\r\n      ",11," += v2.xyz * (v2.w * id2);\r\n\r\n      v3 = v3 - v2 * (dot(v3.xyz, v2.xyz) * id2);\r\n      let id3 = 1.0 / dot(v3.xyz, v3.xyz);\r\n      if (id1 / id3 > eps) {\r\n        ",11," += v3.xyz * (v3.w * id3);\r\n      }\r\n    }\r\n  }\r\n  else {\r\n    if (id1 / id3 > eps) {\r\n      ",11," += v3.xyz * (v3.w * id3);\r\n\r\n      v2 = v2 - v3 * (dot(v2.xyz, v3.xyz) * id3);\r\n      let id2 = 1.0 / dot(v2.xyz, v2.xyz);\r\n      if (id1 / id2 > eps) {\r\n        ",11," += v2.xyz * (v2.w * id2);\r\n      }\r\n    }\r\n  }\r\n\r\n  /*\r\n  let ap = abs(",11,") * 2.0;\r\n  let ",12," = max(ap.x, max(ap.y, ap.z));\r\n  if (",12," > 1.0) { ",8," ",11," / ",12,"; }\r\n  */\r\n  ",8," ",11,";\r\n}\n"]).join(''),
  hash: 0x1b8ce003b6fb94,
  table,
  shake: [[0,[0]],[756,[1,2,0]],[779,[2,0]]],
  tree: decompressAST([[0,0,756],[1,0,7],[2,11,20],[2,248,264],[2,71,87],[2,128,144],[2,71,87],[2,104,120],[2,71,87],[0,52,75],[2,10,13],[0,13,1169],[2,7,23],[2,465,468],[2,170,173],[2,104,107],[2,170,173]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const approx3x3 = getSymbol("approx3x3");
