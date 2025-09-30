/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("approx3x3 eps orthogonalize3x3 symbols visibles symbol flags name vec3<f32> type export attr system mat3x4<f32> parameters identifiers func exports system maxAxis return orthogonalize3x3 matrix projected maxAbs".split(' '));
const t = {[_(3)]:_([0,1,2]),[_(4)]:_([0]),[_(17)]:[{"at":0,[_(5)]:_(0),[_(6)]:1,[_(16)]:{[_(7)]:_(0),[_(9)]:_(8),[_(11)]:_([10]),[_(14)]:[{[_(7)]:_(12),[_(9)]:_(13)}],[_(15)]:_([2])}}]};
const data = {
  "name": "contour/solve",
  "code": _(["@",10," fn ",0,"(",12,": ",13,") -> ",8," {\r\n  let trace = abs(",8,"(",12,"[0][0], ",12,"[1][1], ",12,"[2][2]));\r\n  let ",19," = max(trace.x, max(trace.y, trace.z));\r\n\r\n  if (",19," == trace.x) {\r\n    if (trace.y > trace.z) {\r\n      ",20," ",2,"(",12,", 0u, 1u, 2u);\r\n    }\r\n    else {\r\n      ",20," ",2,"(",12,", 0u, 2u, 1u);\r\n    }\r\n  }\r\n  else if (",19," == trace.y) {\r\n    if (trace.x > trace.z) {\r\n      ",20," ",2,"(",12,", 1u, 0u, 2u);\r\n    }\r\n    else {\r\n      ",20," ",2,"(",12,", 1u, 2u, 0u);\r\n    }\r\n  }\r\n  else {\r\n    if (trace.x > trace.y) {\r\n      ",20," ",2,"(",12,", 2u, 0u, 1u);\r\n    }\r\n    else {\r\n      ",20," ",2,"(",12,", 2u, 1u, 0u);\r\n    }\r\n  }\r\n}\r\n\r\nconst eps = 1.0e-2;\r\n\r\nfn ",2,"(\r\n  ",22,": ",13,",\r\n  i: u32,\r\n  j: u32,\r\n  k: u32,\r\n) -> ",8," {\r\n  var v1 = ",22,"[i];\r\n  var v2 = ",22,"[j];\r\n  var v3 = ",22,"[k];\r\n\r\n  let id1 = 1.0 / dot(v1.xyz, v1.xyz);\r\n  var ",23," = v1.xyz * (v1.w * id1);\r\n\r\n  v2 = v2 - v1 * (dot(v2.xyz, v1.xyz) * id1);\r\n  v3 = v3 - v1 * (dot(v3.xyz, v1.xyz) * id1);\r\n\r\n  let id2 = 1.0 / dot(v2.xyz, v2.xyz);\r\n  let id3 = 1.0 / dot(v3.xyz, v3.xyz);\r\n  if (id2 < id3) {\r\n    if (id1 / id2 > eps) {\r\n      ",23," += v2.xyz * (v2.w * id2);\r\n\r\n      v3 = v3 - v2 * (dot(v3.xyz, v2.xyz) * id2);\r\n      let id3 = 1.0 / dot(v3.xyz, v3.xyz);\r\n      if (id1 / id3 > eps) {\r\n        ",23," += v3.xyz * (v3.w * id3);\r\n      }\r\n    }\r\n  }\r\n  else {\r\n    if (id1 / id3 > eps) {\r\n      ",23," += v3.xyz * (v3.w * id3);\r\n\r\n      v2 = v2 - v3 * (dot(v2.xyz, v3.xyz) * id3);\r\n      let id2 = 1.0 / dot(v2.xyz, v2.xyz);\r\n      if (id1 / id2 > eps) {\r\n        ",23," += v2.xyz * (v2.w * id2);\r\n      }\r\n    }\r\n  }\r\n\r\n  /*\r\n  let ap = abs(",23,") * 2.0;\r\n  let ",24," = max(ap.x, max(ap.y, ap.z));\r\n  if (",24," > 1.0) { ",20," ",23," / ",24,"; }\r\n  */\r\n  ",20," ",23,";\r\n}"]).join(''),
  "hash": 3775389967392646,
  "table": t,
  "shake": [[0,[0]],[756,[1,2,0]],[779,[2,0]]],
  "tree": decompressAST([[0,0,756],[1,0,7],[2,11,20],[2,248,264],[2,71,87],[2,128,144],[2,71,87],[2,104,120],[2,71,87],[0,52,75],[2,10,13],[0,13,1169],[2,7,23],[2,465,468],[2,170,173],[2,104,107],[2,170,173]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const approx3x3 = getSymbol("approx3x3");
