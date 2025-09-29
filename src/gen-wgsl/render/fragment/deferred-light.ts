import {decompressAST, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../gen-wgsl/use/view";
const t = {"symbols":["getFragment","main"],"visibles":["main"],"modules":[{"at":0,"name":"../../../wgsl/use/view","symbols":["getViewResolution"],"imports":[{"name":"getViewResolution","imported":"getViewResolution"}]}],"externals":[{"at":57,"symbol":"getFragment","flags":2,"func":{"name":"getFragment","type":"vec4<f32>","attr":["link"],"parameters":[{"name":"uv","type":"vec2<f32>"}]}}],"exports":[{"at":110,"symbol":"main","flags":1,"func":{"name":"main","type":{"name":"vec4<f32>","attr":["location(0)"]},"attr":["fragment"],"parameters":[{"name":"fragCoord","type":"vec4<f32>","attr":["builtin(position)"]},{"name":"lightIndex","type":"u32","attr":["location(0)","interpolate(flat)"]}],"identifiers":["getFragment"]}}],"linkable":{"getFragment":true}}; const data = {
  "name": "deferred-light",
  "code": "use '../../../wgsl/use/view':: { getViewResolution };\r\n\r\n@link fn getFragment(uv: vec2<f32>) -> vec4<f32>;\r\n\r\n@fragment\r\nfn main(\r\n  @builtin(position) fragCoord: vec4<f32>,\r\n  @location(0) @interpolate(flat) lightIndex: u32,\r\n) -> @location(0) vec4<f32> {\r\n\r\n  var uv = vec2<f32>(fragCoord.xy) * getViewResolution(); \r\n  var outColor = getFragment(uv, lightIndex);\r\n\r\n  return vec4<f32>(outColor.rgb, 1.0);\r\n}\r\n",
  "hash": 1457103222792919,
  "table": t,
  "shake": [[57,[0,1]],[110,[1]]],
  "tree": decompressAST([[1,0,52],[1,57,105],[0,53,353],[3,0,9],[2,1,9],[2,13,17],[3,9,27],[2,1,8],[2,8,16],[2,10,19],[3,25,37],[2,1,9],[3,12,30],[2,1,12],[2,12,16],[2,6,16],[3,23,35],[2,1,9],[2,33,35],[2,15,24],[2,10,12],[2,6,23],[2,29,37],[2,11,22],[2,12,14],[2,4,14],[2,35,43],[2,9,12]], t.symbols),
};
const libs = {"../../../wgsl/use/view": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
/* __WGSL_LOADER_GENERATED */