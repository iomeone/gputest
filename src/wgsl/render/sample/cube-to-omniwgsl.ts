import {decompressAST, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../codec/octahedralwgsl";
const t = {"symbols":["getTexture","getScale","getCubeToOmniSample"],"visibles":["getCubeToOmniSample"],"modules":[{"at":0,"name":"../../../wgsl/codec/octahedral","symbols":["decodeOctahedral","wrapOctahedral"],"imports":[{"name":"decodeOctahedral","imported":"decodeOctahedral"},{"name":"wrapOctahedral","imported":"wrapOctahedral"}]}],"externals":[{"at":79,"symbol":"getTexture","flags":2,"func":{"name":"getTexture","type":"vec4<f32>","attr":["link"],"parameters":[{"name":"uvw","type":"vec3<f32>"}]}},{"at":130,"symbol":"getScale","flags":6,"func":{"name":"getScale","type":"vec2<f32>","attr":["optional","link"]}}],"exports":[{"at":204,"symbol":"getCubeToOmniSample","flags":1,"func":{"name":"getCubeToOmniSample","type":"vec4<f32>","attr":["export"],"parameters":[{"name":"outColor","type":"vec4<f32>"},{"name":"uv","type":"vec4<f32>"},{"name":"st","type":"vec4<f32>"}],"identifiers":["getScale","getTexture"]}}],"linkable":{"getTexture":true,"getScale":true}}; const data = {
  "name": "cube-to-omni",
  "code": "use '../../../wgsl/codec/octahedral'::{ decodeOctahedral, wrapOctahedral };\r\n\r\n@link fn getTexture(uvw: vec3<f32>) -> vec4<f32>;\r\n@optional @link fn getScale() -> vec2<f32> { return vec2<f32>(1.0); };\r\n\r\n@export fn getCubeToOmniSample(outColor: vec4<f32>, uv: vec4<f32>, st: vec4<f32>) -> vec4<f32> {\r\n  let oct = wrapOctahedral((uv.xy * 2.0 - 1.0) * getScale());\r\n  let uvw: vec3<f32> = decodeOctahedral(oct);\r\n  return getTexture(uvw);\r\n}\r\n",
  "hash": 6550709863495300,
  "table": t,
  "shake": [[79,[0,2]],[130,[1,2]],[204,[2]]],
  "tree": decompressAST([[1,0,74],[1,79,127],[4,51,120,1],[1,0,9],[1,10,15],[2,9,17],[0,55,291],[1,0,7],[2,11,30],[2,20,28],[2,21,23],[2,15,17],[2,37,40],[2,6,20],[2,16,18],[2,3,5],[2,18,26],[2,20,23],[2,17,33],[2,17,20],[2,16,26],[2,11,14]], t.symbols),
};
const libs = {"../../../wgsl/codec/octahedral": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getCubeToOmniSample = getSymbol("getCubeToOmniSample");
/* __WGSL_LOADER_GENERATED */