import {decompressAST, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../gen-wgsl/use/view";
import m1 from "../../../gen-wgsl/use/types";
const t = {"symbols":["getSolidFragment"],"visibles":["getSolidFragment"],"modules":[{"at":0,"name":"../../../wgsl/use/view","symbols":["getViewPosition"],"imports":[{"name":"getViewPosition","imported":"getViewPosition"}]},{"at":0,"name":"../../../wgsl/use/types","symbols":["SurfaceFragment"],"imports":[{"name":"SurfaceFragment","imported":"SurfaceFragment"}]}],"exports":[{"at":107,"symbol":"getSolidFragment","flags":1,"func":{"name":"getSolidFragment","type":"vec4<f32>","attr":["export"],"parameters":[{"name":"surface","type":"SurfaceFragment"}]}}]}; const data = {
  "name": "solid",
  "code": "use '../../../wgsl/use/view'::{ getViewPosition };\r\nuse '../../../wgsl/use/types'::{ SurfaceFragment };\r\n\r\n@export fn getSolidFragment(\r\n  surface: SurfaceFragment,\r\n) -> vec4<f32> {\r\n  let rgb = surface.albedo.rgb + surface.emissive.rgb;\r\n  let a = surface.albedo.a;\r\n  if (HAS_ALPHA_TO_COVERAGE) {\r\n    return vec4<f32>(rgb, a);\r\n  }\r\n  else {\r\n    return vec4<f32>(rgb * a, a);\r\n  }\r\n}\r\n",
  "hash": 7021408212432876,
  "table": t,
  "shake": [[107,[0]]],
  "tree": decompressAST([[1,0,49],[1,52,102],[0,55,336],[1,0,7],[2,11,27],[2,21,28],[2,9,24],[2,42,45],[2,6,13],[2,8,14],[2,7,10],[2,6,13],[2,8,16],[2,9,12],[2,12,13],[2,4,11],[2,8,14],[2,7,8],[2,10,31],[2,47,50],[2,5,6],[2,41,44],[2,6,7],[2,3,4]], t.symbols),
};
const libs = {"../../../wgsl/use/view": m0, "../../../wgsl/use/types": m1};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getSolidFragment = getSymbol("getSolidFragment");
/* __WGSL_LOADER_GENERATED */