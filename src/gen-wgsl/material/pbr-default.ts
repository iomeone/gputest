import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
import m0 from "../../gen-wgsl/fragment/pbr";
const data = {
    "name": "pbr-default",
    "code": "use '../../wgsl/fragment/pbr'::{ PBRParams };\r\n\r\n@export fn getDefaultPBRMaterial(\r\n  materialColor: vec3<f32>,\r\n  mapUV: vec4<f32>,\r\n  mapST: vec4<f32>,\r\n) -> PBRParams {\r\n  var albedo: vec3<f32> = materialColor;\r\n  var roughness: f32 = 0.5;\r\n  var metalness: f32 = 0.0;\r\n\r\n  return PBRParams(albedo, metalness, roughness);\r\n}\r\n",
    "hash": 355448105347360,
    "table": {"symbols":["getDefaultPBRMaterial"],"visibles":["getDefaultPBRMaterial"],"modules":[{"at":0,"name":"../../wgsl/fragment/pbr","symbols":["PBRParams"],"imports":[{"name":"PBRParams","imported":"PBRParams"}]}],"exports":[{"at":49,"symbol":"getDefaultPBRMaterial","flags":1,"func":{"name":"getDefaultPBRMaterial","type":{"name":"PBRParams"},"attributes":[{"name":"export"}],"parameters":[{"name":"materialColor","type":{"name":"vec3","args":[{"name":"f32"}]}},{"name":"mapUV","type":{"name":"vec4","args":[{"name":"f32"}]}},{"name":"mapST","type":{"name":"vec4","args":[{"name":"f32"}]}}],"identifiers":[]}}],"declarations":[{"at":49,"symbol":"getDefaultPBRMaterial","flags":1,"func":{"name":"getDefaultPBRMaterial","type":{"name":"PBRParams"},"attributes":[{"name":"export"}],"parameters":[{"name":"materialColor","type":{"name":"vec3","args":[{"name":"f32"}]}},{"name":"mapUV","type":{"name":"vec4","args":[{"name":"f32"}]}},{"name":"mapST","type":{"name":"vec4","args":[{"name":"f32"}]}}],"identifiers":[]}}]},
    "shake": [[49,["getDefaultPBRMaterial"]]],
    "tree": decompressAST([["Skip",0,44],["Shake",49,327],["Skip",49,56],["Id",60,81],["Id",86,99],["Id",115,120],["Id",136,141],["Id",160,169],["Id",179,185],["Id",199,212],["Id",221,230],["Id",250,259],["Id",284,293],["Id",294,300],["Id",302,311],["Id",313,322]]),
  };
const libs = {"../../wgsl/fragment/pbr": m0};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getDefaultPBRMaterial = getSymbol("getDefaultPBRMaterial");
/* __WGSL_LOADER_GENERATED */