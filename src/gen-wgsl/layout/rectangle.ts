import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["applyTransform","transformRectangle"],"visibles":["transformRectangle"],"externals":[{"at":0,"symbol":"applyTransform","flags":6,"func":{"name":"applyTransform","type":"vec4<f32>","attr":["optional","link"],"parameters":[{"name":"p","type":"vec4<f32>"}]}}],"exports":[{"at":78,"symbol":"transformRectangle","flags":1,"func":{"name":"transformRectangle","type":"vec4<f32>","attr":["export"],"parameters":[{"name":"rect","type":"vec4<f32>"}],"identifiers":["applyTransform"]}}],"linkable":{"applyTransform":true}}; const data = {
  "name": "rectangle",
  "code": "@optional @link fn applyTransform(p: vec4<f32>) -> vec4<f32> { return p; }\r\n\r\n@export fn transformRectangle(rect: vec4<f32>) -> vec4<f32> {\r\n  let ul = applyTransform(vec4<f32>(rect.xy, 0.5, 1.0));\r\n  let br = applyTransform(vec4<f32>(rect.zw, 0.5, 1.0));\r\n\r\n  return vec4<f32>(ul.xy, br.xy);\r\n}\r\n",
  "hash": 1440747822916161,
  "table": t,
  "shake": [[0,[0,1]],[78,[1]]],
  "tree": decompressAST([[4,0,74,0],[1,0,9],[1,10,15],[2,9,23],[2,15,16],[2,36,37],[0,8,225],[1,0,7],[2,11,29],[2,19,23],[2,39,41],[2,5,19],[2,25,29],[2,5,7],[2,23,25],[2,5,19],[2,25,29],[2,5,7],[2,38,40],[2,3,5],[2,4,6],[2,3,5]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const transformRectangle = getSymbol("transformRectangle");
/* __WGSL_LOADER_GENERATED */