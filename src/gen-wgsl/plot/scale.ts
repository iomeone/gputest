import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getScaleValue","getScaleDirection","getScaleOrigin","STEP","getScalePosition"],"visibles":["getScalePosition"],"externals":[{"at":0,"symbol":"getScaleValue","flags":2,"func":{"name":"getScaleValue","type":"f32","attr":["link"],"parameters":[{"name":"i","type":"u32"}]}},{"at":40,"symbol":"getScaleDirection","flags":2,"func":{"name":"getScaleDirection","type":"i32","attr":["link"]}},{"at":78,"symbol":"getScaleOrigin","flags":2,"func":{"name":"getScaleOrigin","type":"vec4<f32>","attr":["link"]}}],"exports":[{"at":158,"symbol":"getScalePosition","flags":1,"func":{"name":"getScalePosition","type":"vec4<f32>","attr":["export"],"parameters":[{"name":"index","type":"u32"}],"identifiers":["getScaleDirection","STEP","getScaleOrigin","getScaleValue"]}}],"linkable":{"getScaleValue":true,"getScaleDirection":true,"getScaleOrigin":true}}; const data = {
  "name": "scale",
  "code": "@link fn getScaleValue(i: u32) -> f32;\r\n@link fn getScaleDirection() -> i32;\r\n@link fn getScaleOrigin() -> vec4<f32>;\r\n\r\nconst STEP = vec2<f32>(0.0, 1.0);\r\n\r\n@export fn getScalePosition(index: u32) -> vec4<f32> {\r\n  \r\n  let dir = getScaleDirection();\r\n\r\n  var step: vec4<f32>;\r\n  if (dir == 0) { step = STEP.yxxx; }\r\n  if (dir == 1) { step = STEP.xyxx; }\r\n  if (dir == 2) { step = STEP.xxyx; }\r\n  if (dir == 3) { step = STEP.xxxy; }\r\n  \r\n  return getScaleOrigin() + step * getScaleValue(index);\r\n}\r\n",
  "hash": 8822991776264021,
  "table": t,
  "shake": [[0,[0,4]],[40,[1,4]],[78,[2,4]],[117,[3,4]],[158,[4]]],
  "tree": decompressAST([[1,0,37],[1,40,75],[1,38,76],[0,39,76],[2,10,14],[0,31,370],[1,0,7],[2,11,27],[2,17,22],[2,38,41],[2,6,23],[2,30,34],[2,24,27],[2,12,16],[2,7,11],[2,5,9],[2,15,18],[2,12,16],[2,7,11],[2,5,9],[2,15,18],[2,12,16],[2,7,11],[2,5,9],[2,15,18],[2,12,16],[2,7,11],[2,5,9],[2,22,36],[2,19,23],[2,7,20],[2,14,19]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getScalePosition = getSymbol("getScalePosition");
/* __WGSL_LOADER_GENERATED */