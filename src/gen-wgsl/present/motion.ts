import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getEffect","getDirection","getValue","getLayout","getSlideMotion"],"visibles":["getSlideMotion"],"externals":[{"at":0,"symbol":"getEffect","flags":6,"func":{"name":"getEffect","type":"u32","attr":["optional","link"]}},{"at":54,"symbol":"getDirection","flags":6,"func":{"name":"getDirection","type":"vec4<f32>","attr":["optional","link"]}},{"at":130,"symbol":"getValue","flags":6,"func":{"name":"getValue","type":"f32","attr":["optional","link"]}},{"at":183,"symbol":"getLayout","flags":6,"func":{"name":"getLayout","type":"vec4<f32>","attr":["optional","link"]}}],"exports":[{"at":258,"symbol":"getSlideMotion","flags":1,"func":{"name":"getSlideMotion","type":"vec4<f32>","attr":["export"],"parameters":[{"name":"position","type":"vec4<f32>"}],"identifiers":["getEffect","getDirection","getValue","getLayout"]}}],"linkable":{"getEffect":true,"getDirection":true,"getValue":true,"getLayout":true}}; const data = {
  "name": "motion",
  "code": "@optional @link fn getEffect() -> u32 { return 0; };\r\n@optional @link fn getDirection() -> vec4<f32> { return vec4<f32>(0.0); };\r\n@optional @link fn getValue() -> f32 { return 0; };\r\n@optional @link fn getLayout() -> vec4<f32> { return vec4<f32>(0.0); };\r\n\r\n@export fn getSlideMotion(position: vec4<f32>) -> vec4<f32> {\r\n  let e = getEffect();\r\n  let d = getDirection();\r\n  let v = getValue();\r\n  let l = getLayout();\r\n\r\n  var p = position;\r\n  // Move\r\n  if (e == 3) {\r\n    let direction = getDirection();\r\n    let delta = vec4<f32>(l.zw - l.xy, 1.0, 0.0) * direction;\r\n\r\n    p += delta * p.w * v;\r\n  }\r\n\r\n  return p;\r\n}\r\n",
  "hash": 2104345900318342,
  "table": t,
  "shake": [[0,[0,4]],[54,[1,4]],[130,[2,4]],[183,[3,4]],[258,[4]]],
  "tree": decompressAST([[4,0,51,0],[1,0,9],[1,10,15],[2,9,18],[4,35,108,1],[1,0,9],[1,10,15],[2,9,21],[4,57,107,2],[1,0,9],[1,10,15],[2,9,17],[4,34,104,3],[1,0,9],[1,10,15],[2,9,18],[0,56,418],[1,0,7],[2,11,25],[2,15,23],[2,43,44],[2,4,13],[2,20,21],[2,4,16],[2,23,24],[2,4,12],[2,19,20],[2,4,13],[2,22,23],[2,4,12],[2,28,29],[2,19,28],[2,12,24],[2,25,30],[2,18,19],[2,2,4],[2,5,6],[2,2,4],[2,16,25],[2,18,19],[2,5,10],[2,8,9],[2,2,3],[2,4,5],[2,20,21]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getSlideMotion = getSymbol("getSlideMotion");
/* __WGSL_LOADER_GENERATED */