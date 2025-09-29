import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["GAMMA","toLinear","toLinear2","toLinear3","toLinear4","toGamma","toGamma2","toGamma3","toGamma4"],"visibles":["toLinear","toLinear2","toLinear3","toLinear4","toGamma","toGamma2","toGamma3","toGamma4"],"exports":[{"at":22,"symbol":"toLinear","flags":1,"func":{"name":"toLinear","type":"f32","attr":["export"],"parameters":[{"name":"v","type":"f32"}],"identifiers":["GAMMA"]}},{"at":90,"symbol":"toLinear2","flags":1,"func":{"name":"toLinear2","type":"vec2<f32>","attr":["export"],"parameters":[{"name":"v","type":"vec2<f32>"}],"identifiers":["GAMMA"]}},{"at":182,"symbol":"toLinear3","flags":1,"func":{"name":"toLinear3","type":"vec3<f32>","attr":["export"],"parameters":[{"name":"v","type":"vec3<f32>"}],"identifiers":["GAMMA"]}},{"at":274,"symbol":"toLinear4","flags":1,"func":{"name":"toLinear4","type":"vec4<f32>","attr":["export"],"parameters":[{"name":"v","type":"vec4<f32>"}],"identifiers":["toLinear3"]}},{"at":369,"symbol":"toGamma","flags":1,"func":{"name":"toGamma","type":"f32","attr":["export"],"parameters":[{"name":"v","type":"f32"}],"identifiers":["GAMMA"]}},{"at":442,"symbol":"toGamma2","flags":1,"func":{"name":"toGamma2","type":"vec2<f32>","attr":["export"],"parameters":[{"name":"v","type":"vec2<f32>"}],"identifiers":["GAMMA"]}},{"at":539,"symbol":"toGamma3","flags":1,"func":{"name":"toGamma3","type":"vec3<f32>","attr":["export"],"parameters":[{"name":"v","type":"vec3<f32>"}],"identifiers":["GAMMA"]}},{"at":636,"symbol":"toGamma4","flags":1,"func":{"name":"toGamma4","type":"vec4<f32>","attr":["export"],"parameters":[{"name":"v","type":"vec4<f32>"}],"identifiers":["toGamma3"]}}]}; const data = {
  "name": "gamma",
  "code": "const GAMMA = 2.2;\r\n\r\n@export fn toLinear(v: f32) -> f32 {\r\n  return pow(v, GAMMA);\r\n}\r\n\r\n@export fn toLinear2(v: vec2<f32>) -> vec2<f32> {\r\n  return pow(v, vec2<f32>(GAMMA));\r\n}\r\n\r\n@export fn toLinear3(v: vec3<f32>) -> vec3<f32> {\r\n  return pow(v, vec3<f32>(GAMMA));\r\n}\r\n\r\n@export fn toLinear4(v: vec4<f32>) -> vec4<f32> {\r\n  return vec4(toLinear3(v.rgb), v.a);\r\n}\r\n\r\n@export fn toGamma(v: f32) -> f32 {\r\n  return pow(v, 1.0 / GAMMA);\r\n}\r\n\r\n@export fn toGamma2(v: vec2<f32>) -> vec2<f32> {\r\n  return pow(v, vec2<f32>(1.0 / GAMMA));\r\n}\r\n\r\n@export fn toGamma3(v: vec3<f32>) -> vec3<f32> {\r\n  return pow(v, vec3<f32>(1.0 / GAMMA));\r\n}\r\n\r\n@export fn toGamma4(v: vec4<f32>) -> vec4<f32> {\r\n  return vec4<f32>(toGamma3(v.rgb), v.a);\r\n}\r\n",
  "hash": 6433377847951412,
  "table": t,
  "shake": [[0,[0,1,2,3,4,5,6,7,8]],[22,[1]],[90,[2]],[182,[3,4]],[274,[4]],[369,[5]],[442,[6]],[539,[7,8]],[636,[8]]],
  "tree": decompressAST([[0,0,18],[2,6,11],[0,16,80],[1,0,7],[2,11,19],[2,9,10],[2,27,30],[2,4,5],[2,3,8],[0,14,102],[1,0,7],[2,11,20],[2,10,11],[2,39,42],[2,4,5],[2,13,18],[0,15,103],[1,0,7],[2,11,20],[2,10,11],[2,39,42],[2,4,5],[2,13,18],[0,15,106],[1,0,7],[2,11,20],[2,10,11],[2,44,53],[2,10,11],[2,2,5],[2,6,7],[2,2,3],[0,10,79],[1,0,7],[2,11,18],[2,8,9],[2,27,30],[2,4,5],[2,9,14],[0,14,107],[1,0,7],[2,11,19],[2,9,10],[2,39,42],[2,4,5],[2,19,24],[0,15,108],[1,0,7],[2,11,19],[2,9,10],[2,39,42],[2,4,5],[2,19,24],[0,15,109],[1,0,7],[2,11,19],[2,9,10],[2,49,57],[2,9,10],[2,2,5],[2,6,7],[2,2,3]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const toLinear = getSymbol("toLinear");
export const toLinear2 = getSymbol("toLinear2");
export const toLinear3 = getSymbol("toLinear3");
export const toLinear4 = getSymbol("toLinear4");
export const toGamma = getSymbol("toGamma");
export const toGamma2 = getSymbol("toGamma2");
export const toGamma3 = getSymbol("toGamma3");
export const toGamma4 = getSymbol("toGamma4");
/* __WGSL_LOADER_GENERATED */