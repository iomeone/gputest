import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getOffset","getScrolledPosition"],"visibles":["getScrolledPosition"],"externals":[{"at":0,"symbol":"getOffset","flags":2,"func":{"name":"getOffset","type":"vec2<f32>","attr":["link"]}}],"exports":[{"at":38,"symbol":"getScrolledPosition","flags":1,"func":{"name":"getScrolledPosition","type":"vec4<f32>","attr":["export"],"parameters":[{"name":"position","type":"vec4<f32>"}],"identifiers":["getOffset"]}}],"linkable":{"getOffset":true}}; const data = {
  "name": "scroll",
  "code": "@link fn getOffset() -> vec2<f32>;\r\n\r\n@export fn getScrolledPosition(position: vec4<f32>) -> vec4<f32> {\r\n  return vec4<f32>(position.xy + getOffset(), position.zw);\r\n}\r\n",
  "hash": 7331352413196467,
  "table": t,
  "shake": [[0,[0,1]],[38,[1]]],
  "tree": decompressAST([[1,0,33],[0,38,168],[1,0,7],[2,11,30],[2,20,28],[2,56,64],[2,9,11],[2,5,14],[2,13,21],[2,9,11]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getScrolledPosition = getSymbol("getScrolledPosition");
/* __WGSL_LOADER_GENERATED */