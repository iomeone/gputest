import {decompressAST, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../use/typeswgsl";
const t = {"symbols":["getMaterial","getSolidSurface"],"visibles":["getSolidSurface"],"modules":[{"at":0,"name":"../../../wgsl/use/types","symbols":["SurfaceFragment"],"imports":[{"name":"SurfaceFragment","imported":"SurfaceFragment"}]}],"externals":[{"at":55,"symbol":"getMaterial","flags":2,"func":{"name":"getMaterial","type":"vec4<f32>","attr":["link"],"parameters":[{"name":"color","type":"vec4<f32>"},{"name":"mapUV","type":"vec4<f32>"},{"name":"mapST","type":"vec4<f32>"}]}}],"exports":[{"at":162,"symbol":"getSolidSurface","flags":1,"func":{"name":"getSolidSurface","type":"SurfaceFragment","attr":["export"],"parameters":[{"name":"color","type":"vec4<f32>"},{"name":"uv","type":"vec4<f32>"},{"name":"st","type":"vec4<f32>"},{"name":"normal","type":"vec4<f32>"},{"name":"tangent","type":"vec4<f32>"},{"name":"position","type":"vec4<f32>"}],"identifiers":["getMaterial"]}}],"linkable":{"getMaterial":true}}; const data = {
  "name": "solid",
  "code": "use '../../../wgsl/use/types'::{ SurfaceFragment };\r\n\r\n@link fn getMaterial(\r\n  color: vec4<f32>,\r\n  mapUV: vec4<f32>,\r\n  mapST: vec4<f32>,\r\n) -> vec4<f32> {}\r\n\r\n@export fn getSolidSurface(\r\n  color: vec4<f32>,\r\n  uv: vec4<f32>,\r\n  st: vec4<f32>,\r\n  normal: vec4<f32>,\r\n  tangent: vec4<f32>,\r\n  position: vec4<f32>,\r\n) -> SurfaceFragment {\r\n\r\n  let albedo = getMaterial(color, uv, st);\r\n\r\n  return SurfaceFragment(\r\n    position,\r\n    normal,\r\n    vec4<f32>(0.0, 0.0, 0.0, albedo.a),\r\n    vec4<f32>(albedo.rgb, 0.0),\r\n    vec4<f32>(0.0, 0.0, 0.0, 1.0),\r\n    1.0,\r\n    0.0,\r\n  );\r\n}\r\n",
  "hash": 4083270855759698,
  "table": t,
  "shake": [[55,[0,1]],[162,[1]]],
  "tree": decompressAST([[1,0,50],[1,55,158],[0,107,526],[1,0,7],[2,11,26],[2,20,25],[2,21,23],[2,18,20],[2,18,24],[2,22,29],[2,23,31],[2,27,42],[2,27,33],[2,9,20],[2,12,17],[2,7,9],[2,4,6],[2,17,32],[2,22,30],[2,15,21],[2,38,44],[2,7,8],[2,19,25],[2,7,10]], t.symbols),
};
const libs = {"../../../wgsl/use/types": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getSolidSurface = getSymbol("getSolidSurface");
/* __WGSL_LOADER_GENERATED */