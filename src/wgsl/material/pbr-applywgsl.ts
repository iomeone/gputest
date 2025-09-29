import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../fragment/pbrwgsl";
import m1 from "../use/typeswgsl";
const t = {"symbols":["applyPBRMaterial"],"visibles":["applyPBRMaterial"],"modules":[{"at":0,"name":"../../wgsl/fragment/pbr","symbols":["PBR"],"imports":[{"name":"PBR","imported":"PBR"}]},{"at":0,"name":"../../wgsl/use/types","symbols":["SurfaceFragment"],"imports":[{"name":"SurfaceFragment","imported":"SurfaceFragment"}]}],"exports":[{"at":93,"symbol":"applyPBRMaterial","flags":1,"func":{"name":"applyPBRMaterial","type":"vec3<f32>","attr":["export"],"parameters":[{"name":"N","type":"vec3<f32>"},{"name":"L","type":"vec3<f32>"},{"name":"V","type":"vec3<f32>"},{"name":"surface","type":"SurfaceFragment"}]}}]}; const data = {
  "name": "pbr-apply",
  "code": "use '../../wgsl/fragment/pbr'::{ PBR };\r\nuse '../../wgsl/use/types'::{ SurfaceFragment };\r\n\r\n@export fn applyPBRMaterial(\r\n  N: vec3<f32>,\r\n  L: vec3<f32>,\r\n  V: vec3<f32>,\r\n  surface: SurfaceFragment,\r\n) -> vec3<f32> {\r\n  return PBR(N, L, V, surface.albedo.xyz, surface.material.x, surface.material.y);\r\n}\r\n",
  "hash": 1361127290280639,
  "table": t,
  "shake": [[93,[0]]],
  "tree": decompressAST([[1,0,38],[1,41,88],[0,52,265],[1,0,7],[2,11,27],[2,21,22],[2,17,18],[2,17,18],[2,17,24],[2,9,24],[2,45,48],[2,4,5],[2,3,4],[2,3,4],[2,3,10],[2,8,14],[2,7,10],[2,5,12],[2,8,16],[2,9,10],[2,3,10],[2,8,16],[2,9,10]], t.symbols),
};
const libs = {"../../wgsl/fragment/pbr": m0, "../../wgsl/use/types": m1};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const applyPBRMaterial = getSymbol("applyPBRMaterial");
/* __WGSL_LOADER_GENERATED */