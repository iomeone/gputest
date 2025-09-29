import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getIndex"],"visibles":["getIndex"],"exports":[{"at":0,"symbol":"getIndex","flags":1,"func":{"name":"getIndex","type":"u32","attr":["export"],"parameters":[{"name":"i","type":"u32"}]}}]}; const data = {
  "name": "identity",
  "code": "@export fn getIndex(i: u32) -> u32 { return i; }",
  "hash": 1344717481719576,
  "table": t,
  "shake": [[0,[0]]],
  "tree": decompressAST([[0,0,48],[1,0,7],[2,11,19],[2,9,10],[2,24,25]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getIndex = getSymbol("getIndex");
/* __WGSL_LOADER_GENERATED */