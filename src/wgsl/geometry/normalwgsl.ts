/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getOrthoVector symbols visibles symbol flags name vec3<f32> type export attr parameters func exports return".split(' '));
const t = {[_(1)]:_([0]),[_(2)]:_([0]),[_(12)]:[{"at":0,[_(3)]:_(0),[_(4)]:1,[_(11)]:{[_(5)]:_(0),[_(7)]:_(6),[_(9)]:_([8]),[_(10)]:[{[_(5)]:"v",[_(7)]:_(6)}]}}]};
const data = {
  "name": "geometry/normal",
  "code": _(["@",8," fn ",0,"(v: ",6,") -> ",6," {\r\n  let a = abs(v);\r\n  if (a.x < a.y) {\r\n    if (a.x < a.z) {\r\n      ",13," ",6,"(0.0, -v.z, v.y);\r\n    }\r\n    ",13," ",6,"(-v.y, v.x, 0.0);\r\n  }\r\n  else {\r\n    if (a.y < a.z) {\r\n      ",13," ",6,"(v.z, 0.0, -v.x);\r\n    }\r\n    ",13," ",6,"(-v.y, v.x, 0.0);\r\n  }\r\n}"]).join(''),
  "hash": 4504382732399445,
  "table": t,
  "shake": [[0,[0]]],
  "tree": decompressAST([[0,0,334],[1,0,7],[2,11,25]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getOrthoVector = getSymbol("getOrthoVector");
