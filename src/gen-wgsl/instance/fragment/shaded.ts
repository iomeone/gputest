import {decompressAST, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../gen-wgsl/use/view";
import m1 from "../../../gen-wgsl/use/types";
const t = {"symbols":["applyLights","getShadedFragment"],"visibles":["getShadedFragment"],"modules":[{"at":0,"name":"../../../wgsl/use/view","symbols":["getViewPosition"],"imports":[{"name":"getViewPosition","imported":"getViewPosition"}]},{"at":0,"name":"../../../wgsl/use/types","symbols":["SurfaceFragment"],"imports":[{"name":"SurfaceFragment","imported":"SurfaceFragment"}]}],"externals":[{"at":107,"symbol":"applyLights","flags":2,"func":{"name":"applyLights","type":"vec3<f32>","attr":["link"],"parameters":[{"name":"N","type":"vec3<f32>"},{"name":"V","type":"vec3<f32>"},{"name":"surface","type":"SurfaceFragment"}]}}],"exports":[{"at":214,"symbol":"getShadedFragment","flags":1,"func":{"name":"getShadedFragment","type":"vec4<f32>","attr":["export"],"parameters":[{"name":"surface","type":"SurfaceFragment"}],"identifiers":["applyLights"]}}],"linkable":{"applyLights":true}}; const data = {
  "name": "shaded",
  "code": "use '../../../wgsl/use/view'::{ getViewPosition };\r\nuse '../../../wgsl/use/types'::{ SurfaceFragment };\r\n\r\n@link fn applyLights(\r\n  N: vec3<f32>,\r\n  V: vec3<f32>,\r\n  surface: SurfaceFragment,\r\n) -> vec3<f32> {}\r\n\r\n@export fn getShadedFragment(\r\n  surface: SurfaceFragment,\r\n) -> vec4<f32> {\r\n  let viewPosition = getViewPosition().xyz;\r\n  let surfacePosition = surface.position.xyz;\r\n  let toView: vec3<f32> = viewPosition - surfacePosition;\r\n\r\n  let N: vec3<f32> = normalize(surface.normal.xyz);\r\n  let V: vec3<f32> = normalize(toView);\r\n\r\n  let light = surface.emissive.xyz + applyLights(N, V, surface);\r\n\r\n  //return vec4<f32>(color.xyz, 1.0);\r\n  //return vec4<f32>(mix(color.xyz, N * .5 + .5, .5), 1.0); \r\n  //return vec4<f32>(N * .5 + .5, 1.0); \r\n\r\n  let alpha = surface.albedo.a;\r\n\r\n  if (HAS_ALPHA_TO_COVERAGE) {\r\n    return vec4<f32>(light, alpha);\r\n  }\r\n  else {\r\n    return vec4<f32>(light * alpha, alpha);\r\n  }\r\n}\r\n",
  "hash": 641113530190753,
  "table": t,
  "shake": [[107,[0,1]],[214,[1]]],
  "tree": decompressAST([[1,0,49],[1,52,102],[1,55,158],[0,107,817],[1,0,7],[2,11,28],[2,22,29],[2,9,24],[2,42,54],[2,15,30],[2,18,21],[2,12,27],[2,18,25],[2,8,16],[2,9,12],[2,12,18],[2,20,32],[2,15,30],[2,26,27],[2,15,24],[2,10,17],[2,8,14],[2,7,10],[2,13,14],[2,15,24],[2,10,16],[2,18,23],[2,8,15],[2,8,16],[2,9,12],[2,6,17],[2,12,13],[2,3,4],[2,3,10],[2,164,169],[2,8,15],[2,8,14],[2,7,8],[2,12,33],[2,47,52],[2,7,12],[2,45,50],[2,8,13],[2,7,12]], t.symbols),
};
const libs = {"../../../wgsl/use/view": m0, "../../../wgsl/use/types": m1};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getShadedFragment = getSymbol("getShadedFragment");
/* __WGSL_LOADER_GENERATED */