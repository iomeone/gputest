import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getAxisStep","getAxisOrigin","getAxisPosition"],"visibles":["getAxisPosition"],"externals":[{"at":0,"symbol":"getAxisStep","flags":2,"func":{"name":"getAxisStep","type":"vec4<f32>","attr":["link"]}},{"at":38,"symbol":"getAxisOrigin","flags":2,"func":{"name":"getAxisOrigin","type":"vec4<f32>","attr":["link"]}}],"exports":[{"at":80,"symbol":"getAxisPosition","flags":1,"func":{"name":"getAxisPosition","type":"vec4<f32>","attr":["export"],"parameters":[{"name":"index","type":"u32"}],"identifiers":["getAxisStep","getAxisOrigin"]}}],"linkable":{"getAxisStep":true,"getAxisOrigin":true}}; const data = {
  "name": "axis",
  "code": "@link fn getAxisStep() -> vec4<f32>;\r\n@link fn getAxisOrigin() -> vec4<f32>;\r\n\r\n@export fn getAxisPosition(index: u32) -> vec4<f32> {\r\n  return getAxisStep() * f32(index) + getAxisOrigin();\r\n}\r\n",
  "hash": 8181468173629466,
  "table": t,
  "shake": [[0,[0,2]],[38,[1,2]],[80,[2]]],
  "tree": decompressAST([[1,0,35],[1,38,75],[0,42,154],[1,0,7],[2,11,26],[2,16,21],[2,37,48],[2,20,25],[2,9,22]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getAxisPosition = getSymbol("getAxisPosition");
/* __WGSL_LOADER_GENERATED */