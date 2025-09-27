import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
import m0 from "../../gen-wgsl/fragment/pbr";
const data = {
    "name": "pbr-apply",
    "code": "use '../../wgsl/fragment/pbr'::{ PBR, PBRParams };\r\n\r\n@export fn applyPBRMaterial(\r\n  N: vec3<f32>,\r\n  L: vec3<f32>,\r\n  V: vec3<f32>,\r\n  radiance: vec3<f32>,\r\n  params: PBRParams,\r\n) -> vec3<f32> {\r\n  return PBR(N, L, V, radiance, params.albedo, params.metalness, params.roughness);\r\n}\r\n",
    "hash": 2977110850086693,
    "table": {"symbols":["applyPBRMaterial"],"visibles":["applyPBRMaterial"],"modules":[{"at":0,"name":"../../wgsl/fragment/pbr","symbols":["PBR","PBRParams"],"imports":[{"name":"PBR","imported":"PBR"},{"name":"PBRParams","imported":"PBRParams"}]}],"exports":[{"at":54,"symbol":"applyPBRMaterial","flags":1,"func":{"name":"applyPBRMaterial","type":{"name":"vec3","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"N","type":{"name":"vec3","args":[{"name":"f32"}]}},{"name":"L","type":{"name":"vec3","args":[{"name":"f32"}]}},{"name":"V","type":{"name":"vec3","args":[{"name":"f32"}]}},{"name":"radiance","type":{"name":"vec3","args":[{"name":"f32"}]}},{"name":"params","type":{"name":"PBRParams"}}],"identifiers":[]}}],"declarations":[{"at":54,"symbol":"applyPBRMaterial","flags":1,"func":{"name":"applyPBRMaterial","type":{"name":"vec3","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"N","type":{"name":"vec3","args":[{"name":"f32"}]}},{"name":"L","type":{"name":"vec3","args":[{"name":"f32"}]}},{"name":"V","type":{"name":"vec3","args":[{"name":"f32"}]}},{"name":"radiance","type":{"name":"vec3","args":[{"name":"f32"}]}},{"name":"params","type":{"name":"PBRParams"}}],"identifiers":[]}}]},
    "shake": [[54,["applyPBRMaterial"]]],
    "tree": decompressAST([["Skip",0,49],["Shake",54,285],["Skip",54,61],["Id",65,81],["Id",86,87],["Id",103,104],["Id",120,121],["Id",137,145],["Id",161,167],["Id",169,178],["Id",208,211],["Id",212,213],["Id",215,216],["Id",218,219],["Id",221,229],["Id",231,237],["Id",238,244],["Id",246,252],["Id",253,262],["Id",264,270],["Id",271,280]]),
  };
const libs = {"../../wgsl/fragment/pbr": m0};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const applyPBRMaterial = getSymbol("applyPBRMaterial");
/* __WGSL_LOADER_GENERATED */