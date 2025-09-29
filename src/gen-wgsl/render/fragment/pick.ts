import {decompressAST, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../gen-wgsl/mask/scissor";
const t = {"symbols":["main"],"visibles":["main"],"modules":[{"at":0,"name":"../../../wgsl/mask/scissor","symbols":["isScissored"],"imports":[{"name":"isScissored","imported":"isScissored"}]}],"exports":[{"at":55,"symbol":"main","flags":1,"func":{"name":"main","type":{"name":"vec4<u32>","attr":["location(0)"]},"attr":["fragment"],"parameters":[{"name":"fragScissor","type":"vec4<f32>","attr":["location(0)"]},{"name":"fragId","type":"u32","attr":["location(1)","interpolate(flat)"]},{"name":"fragIndex","type":"u32","attr":["location(2)","interpolate(flat)"]}]}}]}; const data = {
  "name": "pick",
  "code": "use '../../../wgsl/mask/scissor':: { isScissored };\r\n\r\n@fragment\r\nfn main(\r\n  @location(0) fragScissor: vec4<f32>,  \r\n  @location(1) @interpolate(flat) fragId: u32,\r\n  @location(2) @interpolate(flat) fragIndex: u32,\r\n) -> @location(0) vec4<u32> {\r\n  if (isScissored(fragScissor)) { discard; }\r\n  return vec4<u32>(fragId, fragIndex, 0u, 0u);\r\n}\r\n\r\n",
  "hash": 1655008978377067,
  "table": t,
  "shake": [[55,[0]]],
  "tree": decompressAST([[1,0,50],[0,55,343],[3,0,9],[2,1,9],[2,13,17],[3,9,21],[2,1,9],[2,12,23],[3,29,41],[2,1,9],[3,12,30],[2,1,12],[2,12,16],[2,6,12],[3,16,28],[2,1,9],[3,12,30],[2,1,12],[2,12,16],[2,6,15],[3,22,34],[2,1,9],[2,31,42],[2,12,23],[2,47,53],[2,8,17]], t.symbols),
};
const libs = {"../../../wgsl/mask/scissor": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
/* __WGSL_LOADER_GENERATED */