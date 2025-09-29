import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../fragment/pbrwgsl";
const t = {"symbols":["roughness","metalness","getDefaultPBRMaterial"],"visibles":["getDefaultPBRMaterial"],"modules":[{"at":0,"name":"../../wgsl/fragment/pbr","symbols":["PBRParams"],"imports":[{"name":"PBRParams","imported":"PBRParams"}]}],"exports":[{"at":109,"symbol":"getDefaultPBRMaterial","flags":1,"func":{"name":"getDefaultPBRMaterial","type":"PBRParams","attr":["export"],"parameters":[{"name":"color","type":"vec4<f32>"},{"name":"mapUV","type":"vec4<f32>"},{"name":"mapST","type":"vec4<f32>"}],"identifiers":["metalness","roughness"]}}]}; const data = {
  "name": "pbr-default",
  "code": "use '../../wgsl/fragment/pbr'::{ PBRParams };\r\n\r\nconst roughness: f32 = 0.5;\r\nconst metalness: f32 = 0.0;\r\n\r\n@export fn getDefaultPBRMaterial(\r\n  color: vec4<f32>,\r\n  mapUV: vec4<f32>,\r\n  mapST: vec4<f32>,\r\n) -> PBRParams {\r\n  var albedo = color;\r\n  var emissive = vec4<f32>(0.0);\r\n  var material = vec4<f32>(metalness, roughness, 0.0, 0.0);\r\n\r\n  return PBRParams(albedo, emissive, material, 1.0);\r\n}\r\n",
  "hash": 1204889713960948,
  "table": t,
  "shake": [[45,[0,2]],[76,[1,2]],[109,[2]]],
  "tree": decompressAST([[1,0,44],[0,45,76],[2,10,19],[0,21,50],[2,8,17],[0,25,316],[1,0,7],[2,11,32],[2,26,31],[2,21,26],[2,21,26],[2,24,33],[2,19,25],[2,9,14],[2,14,22],[2,34,42],[2,21,30],[2,11,20],[2,34,43],[2,10,16],[2,8,16],[2,10,18]], t.symbols),
};
const libs = {"../../wgsl/fragment/pbr": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getDefaultPBRMaterial = getSymbol("getDefaultPBRMaterial");
/* __WGSL_LOADER_GENERATED */