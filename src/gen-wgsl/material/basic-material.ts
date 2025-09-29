import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getColor","getColorMap","getBasicMaterial"],"visibles":["getBasicMaterial"],"externals":[{"at":0,"symbol":"getColor","flags":6,"func":{"name":"getColor","type":"vec4<f32>","attr":["optional","link"]}},{"at":86,"symbol":"getColorMap","flags":6,"func":{"name":"getColorMap","type":"vec4<f32>","attr":["optional","link"],"parameters":[{"name":"uv","type":"vec2<f32>"}]}}],"exports":[{"at":175,"symbol":"getBasicMaterial","flags":1,"func":{"name":"getBasicMaterial","type":"vec4<f32>","attr":["export"],"parameters":[{"name":"inColor","type":"vec4<f32>"},{"name":"mapUV","type":"vec4<f32>"},{"name":"mapST","type":"vec4<f32>"}],"identifiers":["getColor","getColorMap"]}}],"linkable":{"getColor":true,"getColorMap":true}}; const data = {
  "name": "basic-material",
  "code": "@optional @link fn getColor() -> vec4<f32> { return vec4<f32>(1.0, 1.0, 1.0, 1.0); }\r\n@optional @link fn getColorMap(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.0); }\r\n\r\n@export fn getBasicMaterial(\r\n  inColor: vec4<f32>,\r\n  mapUV: vec4<f32>,\r\n  mapST: vec4<f32>,\r\n) -> vec4<f32> {\r\n  var color: vec4<f32> = inColor * getColor();\r\n\r\n  if (HAS_COLOR_MAP) {\r\n    color *= getColorMap(mapUV.xy);\r\n  }\r\n\r\n  return color;\r\n}\r\n",
  "hash": 1003731417522844,
  "table": t,
  "shake": [[0,[0,2]],[86,[1,2]],[175,[2]]],
  "tree": decompressAST([[4,0,84,0],[1,0,9],[1,10,15],[2,9,17],[4,67,152,1],[1,0,9],[1,10,15],[2,9,20],[2,12,14],[0,58,307],[1,0,7],[2,11,27],[2,21,28],[2,23,28],[2,21,26],[2,43,48],[2,19,26],[2,10,18],[2,21,34],[2,22,27],[2,9,20],[2,12,17],[2,6,8],[2,22,27]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getBasicMaterial = getSymbol("getBasicMaterial");
/* __WGSL_LOADER_GENERATED */