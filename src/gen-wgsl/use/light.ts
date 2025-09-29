import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../gen-wgsl/use/types";
const t = {"symbols":["LightUniforms","lightUniforms","getLightCount","getLight"],"visibles":["getLightCount","getLight"],"modules":[{"at":0,"name":"../../wgsl/use/types","symbols":["Light"],"imports":[{"name":"Light","imported":"Light"}]}],"exports":[{"at":184,"symbol":"getLightCount","flags":1,"func":{"name":"getLightCount","type":"u32","attr":["export"],"identifiers":["lightUniforms"]}},{"at":251,"symbol":"getLight","flags":1,"func":{"name":"getLight","type":"Light","attr":["export"],"parameters":[{"name":"index","type":"u32"}],"identifiers":["lightUniforms"]}}]}; const data = {
  "name": "light",
  "code": "use '../../wgsl/use/types'::{ Light };\r\n\r\nstruct LightUniforms {\r\n  count: u32,\r\n  lights: array<Light>,\r\n};\r\n\r\n@group(LIGHT) @binding(0) var<storage> lightUniforms: LightUniforms;\r\n\r\n@export fn getLightCount() -> u32 { return lightUniforms.count; }\r\n@export fn getLight(index: u32) -> Light { return lightUniforms.lights[index]; }\r\n",
  "hash": 3579064801037394,
  "table": t,
  "shake": [[38,[0,1,2,3]],[112,[1,2,3]],[184,[2]],[251,[3]]],
  "tree": decompressAST([[1,0,37],[0,38,107],[2,11,24],[2,19,24],[2,15,21],[2,14,19],[0,15,83],[3,0,13],[2,1,6],[2,6,11],[3,7,18],[2,1,8],[2,24,37],[2,15,28],[0,18,83],[1,0,7],[2,11,24],[2,32,45],[2,14,19],[0,10,90],[1,0,7],[2,11,19],[2,9,14],[2,15,20],[2,15,28],[2,14,20],[2,7,12]], t.symbols),
};
const libs = {"../../wgsl/use/types": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getLightCount = getSymbol("getLightCount");
export const getLight = getSymbol("getLight");
/* __WGSL_LOADER_GENERATED */