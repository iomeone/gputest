import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getID","getIndex","getPickingID"],"visibles":["getPickingID"],"externals":[{"at":0,"symbol":"getID","flags":6,"func":{"name":"getID","type":"u32","attr":["optional","link"],"parameters":[{"name":"i","type":"u32"}]}},{"at":57,"symbol":"getIndex","flags":6,"func":{"name":"getIndex","type":"u32","attr":["optional","link"],"parameters":[{"name":"i","type":"u32"}]}}],"exports":[{"at":119,"symbol":"getPickingID","flags":1,"func":{"name":"getPickingID","type":"vec2<u32>","attr":["export"],"parameters":[{"name":"index","type":"u32"}],"identifiers":["getID","getIndex"]}}],"linkable":{"getID":true,"getIndex":true}}; const data = {
  "name": "pick",
  "code": "@optional @link fn getID(i: u32) -> u32 { return 0u; };\r\n@optional @link fn getIndex(i: u32) -> u32 { return 0u; };\r\n\r\n@export fn getPickingID(index: u32) -> vec2<u32> {\r\n  return vec2<u32>(getID(index), getIndex(index));\r\n}\r\n",
  "hash": 2651489830979140,
  "table": t,
  "shake": [[0,[0,2]],[57,[1,2]],[119,[2]]],
  "tree": decompressAST([[4,0,54,0],[1,0,9],[1,10,15],[2,9,14],[2,6,7],[4,32,89,1],[1,0,9],[1,10,15],[2,9,17],[2,9,10],[0,34,139],[1,0,7],[2,11,23],[2,13,18],[2,47,52],[2,6,11],[2,8,16],[2,9,14]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getPickingID = getSymbol("getPickingID");
/* __WGSL_LOADER_GENERATED */