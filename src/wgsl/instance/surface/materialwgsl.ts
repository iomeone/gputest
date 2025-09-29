import {decompressAST, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../use/typeswgsl";
const t = {"symbols":["T","getMaterial","getMaterialSurface"],"visibles":["getMaterialSurface"],"modules":[{"at":0,"name":"../../../wgsl/use/types","symbols":["SurfaceFragment"],"imports":[{"name":"SurfaceFragment","imported":"SurfaceFragment"}]}],"externals":[{"at":75,"symbol":"getMaterial","flags":2,"func":{"name":"getMaterial","type":{"name":"T","attr":["infer(T)"]},"attr":["link"],"parameters":[{"name":"color","type":"vec4<f32>"},{"name":"mapUV","type":"vec4<f32>"},{"name":"mapST","type":"vec4<f32>"}],"inferred":[{"name":"T","at":-1}]}}],"exports":[{"at":184,"symbol":"getMaterialSurface","flags":1,"func":{"name":"getMaterialSurface","type":"SurfaceFragment","attr":["export"],"parameters":[{"name":"color","type":"vec4<f32>"},{"name":"uv","type":"vec4<f32>"},{"name":"st","type":"vec4<f32>"},{"name":"normal","type":"vec4<f32>"},{"name":"tangent","type":"vec4<f32>"},{"name":"position","type":"vec4<f32>"}],"identifiers":["getMaterial"]}}],"linkable":{"getMaterial":true}}; const data = {
  "name": "material",
  "code": "use '../../../wgsl/use/types'::{ SurfaceFragment };\r\n\r\n@infer type T = T;\r\n@link fn getMaterial(\r\n  color: vec4<f32>,\r\n  mapUV: vec4<f32>,\r\n  mapST: vec4<f32>,\r\n) -> @infer(T) T {}\r\n\r\n@export fn getMaterialSurface(\r\n  color: vec4<f32>,\r\n  uv: vec4<f32>,\r\n  st: vec4<f32>,\r\n  normal: vec4<f32>,\r\n  tangent: vec4<f32>,\r\n  position: vec4<f32>,\r\n) -> SurfaceFragment {\r\n\r\n  let params = getMaterial(color, uv, st);\r\n\r\n  return SurfaceFragment(\r\n    position,\r\n    normal,\r\n    params.albedo,\r\n    params.emissive,\r\n    params.material,\r\n    params.occlusion,\r\n    0.0,\r\n  );\r\n}\r\n",
  "hash": 5678167309503776,
  "table": t,
  "shake": [[55,[0]],[75,[1,2]],[184,[2]]],
  "tree": decompressAST([[1,0,50],[1,55,73],[1,20,125],[0,109,498],[1,0,7],[2,11,29],[2,23,28],[2,21,23],[2,18,20],[2,18,24],[2,22,29],[2,23,31],[2,27,42],[2,27,33],[2,9,20],[2,12,17],[2,7,9],[2,4,6],[2,17,32],[2,22,30],[2,15,21],[2,13,19],[2,7,13],[2,13,19],[2,7,15],[2,15,21],[2,7,15],[2,15,21],[2,7,16]], t.symbols),
};
const libs = {"../../../wgsl/use/types": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getMaterialSurface = getSymbol("getMaterialSurface");
/* __WGSL_LOADER_GENERATED */