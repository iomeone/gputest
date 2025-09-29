import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getOffset","getShiftedRectangle"],"visibles":["getShiftedRectangle"],"externals":[{"at":0,"symbol":"getOffset","flags":2,"func":{"name":"getOffset","type":"vec2<f32>","attr":["link"]}}],"exports":[{"at":38,"symbol":"getShiftedRectangle","flags":1,"func":{"name":"getShiftedRectangle","type":"vec4<f32>","attr":["export"],"parameters":[{"name":"rectangle","type":"vec4<f32>"}],"identifiers":["getOffset"]}}],"linkable":{"getOffset":true}}; const data = {
  "name": "shift",
  "code": "@link fn getOffset() -> vec2<f32>;\r\n\r\n@export fn getShiftedRectangle(rectangle: vec4<f32>) -> vec4<f32> {\r\n  let offset = getOffset();\r\n  return vec4<f32>(rectangle.xy + offset, rectangle.zw + offset);\r\n}\r\n",
  "hash": 6207417059934953,
  "table": t,
  "shake": [[0,[0,1]],[38,[1]]],
  "tree": decompressAST([[1,0,33],[0,38,204],[1,0,7],[2,11,30],[2,20,29],[2,44,50],[2,9,18],[2,33,42],[2,10,12],[2,5,11],[2,8,17],[2,10,12],[2,5,11]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getShiftedRectangle = getSymbol("getShiftedRectangle");
/* __WGSL_LOADER_GENERATED */