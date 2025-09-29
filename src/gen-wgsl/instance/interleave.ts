import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getOffset","getSize","getIndex"],"visibles":["getIndex"],"externals":[{"at":0,"symbol":"getOffset","flags":6,"func":{"name":"getOffset","type":"u32","attr":["optional","link"]}},{"at":55,"symbol":"getSize","flags":6,"func":{"name":"getSize","type":"u32","attr":["optional","link"]}}],"exports":[{"at":110,"symbol":"getIndex","flags":1,"func":{"name":"getIndex","type":"u32","attr":["export"],"parameters":[{"name":"i","type":"u32"}],"identifiers":["getSize","getOffset"]}}],"linkable":{"getOffset":true,"getSize":true}}; const data = {
  "name": "interleave",
  "code": "@optional @link fn getOffset() -> u32 { return 0u; };\r\n@optional @link fn getSize() -> u32 { return 1u; };\r\n\r\n@export fn getIndex(i: u32) -> u32 {\r\n  return i * getSize() + getOffset();\r\n}\r\n",
  "hash": 5562440158383184,
  "table": t,
  "shake": [[0,[0,2]],[55,[1,2]],[110,[2]]],
  "tree": decompressAST([[4,0,52,0],[1,0,9],[1,10,15],[2,9,18],[4,36,86,1],[1,0,9],[1,10,15],[2,9,16],[0,36,114],[1,0,7],[2,11,19],[2,9,10],[2,27,28],[2,4,11],[2,12,21]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getIndex = getSymbol("getIndex");
/* __WGSL_LOADER_GENERATED */