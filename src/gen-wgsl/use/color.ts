import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["premultiply"],"visibles":["premultiply"],"exports":[{"at":0,"symbol":"premultiply","flags":1,"func":{"name":"premultiply","type":"vec4<f32>","attr":["export"],"parameters":[{"name":"color","type":"vec4<f32>"}]}}]}; const data = {
  "name": "color",
  "code": "@export fn premultiply(color: vec4<f32>) -> vec4<f32> {\r\n  return vec4<f32>(color.rgb * color.a, color.a);\r\n}\r\n",
  "hash": 7519904477363491,
  "table": t,
  "shake": [[0,[0]]],
  "tree": decompressAST([[0,0,109],[1,0,7],[2,11,22],[2,12,17],[2,53,58],[2,6,9],[2,6,11],[2,6,7],[2,3,8],[2,6,7]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const premultiply = getSymbol("premultiply");
/* __WGSL_LOADER_GENERATED */