import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../use/arraywgsl";
const t = {"symbols":["getSize","unpackIndex","packIndex"],"visibles":["unpackIndex","packIndex"],"modules":[{"at":0,"name":"../../wgsl/use/array","symbols":["sizeToModulus4","packIndex4","unpackIndex4"],"imports":[{"name":"sizeToModulus4","imported":"sizeToModulus4"},{"name":"packIndex4","imported":"packIndex4"},{"name":"unpackIndex4","imported":"unpackIndex4"}]}],"externals":[{"at":76,"symbol":"getSize","flags":2,"func":{"name":"getSize","type":"vec4<u32>","attr":["link"]}}],"exports":[{"at":115,"symbol":"unpackIndex","flags":1,"func":{"name":"unpackIndex","type":"vec4<u32>","attr":["export"],"parameters":[{"name":"i","type":"u32"}],"identifiers":["getSize"]}},{"at":261,"symbol":"packIndex","flags":1,"func":{"name":"packIndex","type":"u32","attr":["export"],"parameters":[{"name":"v","type":"vec4<u32>"}],"identifiers":["getSize"]}}],"linkable":{"getSize":true}}; const data = {
  "name": "array",
  "code": "use '../../wgsl/use/array'::{ sizeToModulus4, packIndex4, unpackIndex4 }\r\n\r\n@link fn getSize() -> vec4<u32> {};\r\n\r\n@export fn unpackIndex(i: u32) -> vec4<u32> {\r\n  let s = getSize();\r\n  let modulus = sizeToModulus4(s);\r\n  return unpackIndex4(i, modulus);\r\n}\r\n\r\n@export fn packIndex(v: vec4<u32>) -> u32 {\r\n  let s = getSize();\r\n  let modulus = sizeToModulus4(s);\r\n  return packIndex4(v, modulus);\r\n}\r\n",
  "hash": 7383467441535243,
  "table": t,
  "shake": [[76,[0,1,2]],[115,[1]],[261,[2]]],
  "tree": decompressAST([[1,0,72],[1,76,110],[0,39,181],[1,0,7],[2,11,22],[2,12,13],[2,30,31],[2,4,11],[2,18,25],[2,10,24],[2,15,16],[2,14,26],[2,13,14],[2,3,10],[0,16,154],[1,0,7],[2,11,20],[2,10,11],[2,30,31],[2,4,11],[2,18,25],[2,10,24],[2,15,16],[2,14,24],[2,11,12],[2,3,10]], t.symbols),
};
const libs = {"../../wgsl/use/array": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const unpackIndex = getSymbol("unpackIndex");
export const packIndex = getSymbol("packIndex");
/* __WGSL_LOADER_GENERATED */