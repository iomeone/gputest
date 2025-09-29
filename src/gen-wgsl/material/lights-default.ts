import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../gen-wgsl/use/types";
const t = {"symbols":["T","applyLight","applyLights"],"visibles":["applyLights"],"modules":[{"at":0,"name":"../../wgsl/use/types","symbols":["Light"],"imports":[{"name":"Light","imported":"Light"}]}],"externals":[{"at":58,"symbol":"applyLight","flags":2,"func":{"name":"applyLight","type":"f32","attr":["link"],"parameters":[{"name":"N","type":"vec3<f32>"},{"name":"V","type":"vec3<f32>"},{"name":"light","type":"Light"},{"name":"surface","type":"T","attr":["infer(T)"]}],"inferred":[{"name":"T","at":3}]}}],"exports":[{"at":171,"symbol":"applyLights","flags":1,"func":{"name":"applyLights","type":"vec3<f32>","attr":["export"],"parameters":[{"name":"N","type":"vec3<f32>"},{"name":"V","type":"vec3<f32>"},{"name":"surface","type":"T"}],"identifiers":["applyLight"]}}],"linkable":{"applyLight":true}}; const data = {
  "name": "lights-default",
  "code": "use '../../wgsl/use/types'::{ Light };\r\n\r\n@infer type T;\r\n@link fn applyLight(\r\n  N: vec3<f32>,\r\n  V: vec3<f32>,\r\n  light: Light,\r\n  @infer(T) surface: T,\r\n) -> f32 {}\r\n\r\n@export fn applyLights(\r\n  N: vec3<f32>,\r\n  V: vec3<f32>,\r\n  surface: T,\r\n) -> vec3<f32> {\r\n\r\n  var radiance: vec3<f32> = vec3<f32>(0.0);\r\n\r\n  var light = Light(\r\n    mat4x4<f32>(),\r\n    vec4<f32>(0.0),\r\n    vec4<f32>(-0.267, -3*0.267, -2*0.267, 0.0),\r\n    vec4<f32>(1.0),\r\n    vec4<f32>(0.0),\r\n    2.0,\r\n    0.0,\r\n    1,\r\n    -1,\r\n    0,\r\n    vec2<f32>(0.0),\r\n    vec2<f32>(0.0),\r\n    vec4<f32>(0.0),\r\n  );\r\n\r\n  return 0.05 * surface.occlusion * surface.albedo.rgb + applyLight(N, V, light, surface);\r\n}\r\n",
  "hash": 312898958607738,
  "table": t,
  "shake": [[42,[0]],[58,[1,2]],[171,[2]]],
  "tree": decompressAST([[1,0,37],[1,42,56],[1,16,125],[0,113,617],[1,0,7],[2,11,22],[2,16,17],[2,17,18],[2,17,24],[2,9,10],[2,30,38],[2,47,52],[2,8,13],[2,272,279],[2,8,17],[2,12,19],[2,8,14],[2,7,10],[2,6,16],[2,11,12],[2,3,4],[2,3,8],[2,7,14]], t.symbols),
};
const libs = {"../../wgsl/use/types": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const applyLights = getSymbol("applyLights");
/* __WGSL_LOADER_GENERATED */