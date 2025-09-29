import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getFlip","getOffset","getLayoutPosition"],"visibles":["getLayoutPosition"],"externals":[{"at":0,"symbol":"getFlip","flags":2,"func":{"name":"getFlip","type":"vec2<f32>","attr":["link"]}},{"at":34,"symbol":"getOffset","flags":2,"func":{"name":"getOffset","type":"vec2<f32>","attr":["link"]}}],"exports":[{"at":72,"symbol":"getLayoutPosition","flags":1,"func":{"name":"getLayoutPosition","type":"vec4<f32>","attr":["export"],"parameters":[{"name":"position","type":"vec4<f32>"}],"identifiers":["getFlip","getOffset"]}}],"linkable":{"getFlip":true,"getOffset":true}}; const data = {
  "name": "layout",
  "code": "@link fn getFlip() -> vec2<f32>;\r\n@link fn getOffset() -> vec2<f32>;\r\n\r\n@export fn getLayoutPosition(position: vec4<f32>) -> vec4<f32> {\r\n  let flip = getFlip();\r\n  let offset = getOffset();\r\n\r\n  var xy = select(position.xy, flip - position.xy, flip > vec2<f32>(0.0));\r\n  return vec4<f32>(xy + offset, position.zw);\r\n}\r\n",
  "hash": 722113086455302,
  "table": t,
  "shake": [[0,[0,2]],[34,[1,2]],[72,[2]]],
  "tree": decompressAST([[1,0,31],[1,34,67],[0,38,284],[1,0,7],[2,11,28],[2,18,26],[2,43,47],[2,7,14],[2,18,24],[2,9,18],[2,22,24],[2,5,11],[2,7,15],[2,9,11],[2,4,8],[2,7,15],[2,9,11],[2,4,8],[2,44,46],[2,5,11],[2,8,16],[2,9,11]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getLayoutPosition = getSymbol("getLayoutPosition");
/* __WGSL_LOADER_GENERATED */