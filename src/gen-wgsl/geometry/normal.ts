import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getOrthoVector"],"visibles":["getOrthoVector"],"exports":[{"at":0,"symbol":"getOrthoVector","flags":1,"func":{"name":"getOrthoVector","type":"vec3<f32>","attr":["export"],"parameters":[{"name":"v","type":"vec3<f32>"}]}}]}; const data = {
  "name": "normal",
  "code": "@export fn getOrthoVector(v: vec3<f32>) -> vec3<f32> {\r\n  let a = abs(v);\r\n  if (a.x < a.y) {\r\n    if (a.x < a.z) {\r\n      return vec3<f32>(0.0, -v.z, v.y);\r\n    }\r\n    return vec3<f32>(-v.y, v.x, 0.0);\r\n  }\r\n  else {\r\n    if (a.y < a.z) {\r\n      return vec3<f32>(v.z, 0.0, -v.x);\r\n    }\r\n    return vec3<f32>(-v.y, v.x, 0.0);\r\n  }\r\n}\r\n",
  "hash": 7773074432726442,
  "table": t,
  "shake": [[0,[0]]],
  "tree": decompressAST([[0,0,334],[1,0,7],[2,11,25],[2,15,16],[2,36,37],[2,4,7],[2,4,5],[2,11,12],[2,2,3],[2,4,5],[2,2,3],[2,14,15],[2,2,3],[2,4,5],[2,2,3],[2,35,36],[2,2,3],[2,3,4],[2,2,3],[2,34,35],[2,2,3],[2,3,4],[2,2,3],[2,33,34],[2,2,3],[2,4,5],[2,2,3],[2,29,30],[2,2,3],[2,9,10],[2,2,3],[2,34,35],[2,2,3],[2,3,4],[2,2,3]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getOrthoVector = getSymbol("getOrthoVector");
/* __WGSL_LOADER_GENERATED */