import {decompressAST, bindEntryPoint} from "../../../shader/wgsl";
const t = {"symbols":["sourceCommand","destinationCommand","main"],"visibles":["main"],"externals":[{"at":0,"symbol":"sourceCommand","flags":2,"variable":{"name":"sourceCommand","type":"array<u32>","attr":["link"],"qual":"<storage, read>"}},{"at":59,"symbol":"destinationCommand","flags":2,"variable":{"name":"destinationCommand","type":"array<u32>","attr":["link"],"qual":"<storage, read_write>"}}],"exports":[{"at":125,"symbol":"main","flags":1,"func":{"name":"main","type":"void","attr":["compute","workgroup_size(1)"],"identifiers":["sourceCommand","destinationCommand"]}}],"linkable":{"sourceCommand":true,"destinationCommand":true}}; const data = {
  "name": "wireframe-indirect",
  "code": "@link var<storage, read>       sourceCommand: array<u32>;\r\n@link var<storage, read_write> destinationCommand: array<u32>;\r\n\r\n@compute @workgroup_size(1)\r\nfn main() {\r\n  let vertexCount = sourceCommand[0];\r\n  let instanceCount = sourceCommand[1];\r\n\r\n  if (isTriangleStrip) {\r\n    let edges = (vertexCount - 2) * 2 + 1;\r\n    destinationCommand[0] = 4;\r\n    destinationCommand[1] = edges * instanceCount;\r\n    destinationCommand[64] = edges;\r\n  }\r\n  else {\r\n    destinationCommand[0] = 18;\r\n    destinationCommand[1] = vertexCount * instanceCount;\r\n    destinationCommand[64] = vertexCount;\r\n  }\r\n}\r\n",
  "hash": 4235158870458553,
  "table": t,
  "shake": [[0,[0,2]],[59,[1,2]],[125,[2]]],
  "tree": decompressAST([[1,0,57],[1,59,121],[0,66,536],[3,0,8],[2,1,8],[3,8,26],[2,1,15],[2,22,26],[2,16,27],[2,14,27],[2,25,38],[2,16,29],[2,27,42],[2,28,33],[2,9,20],[2,31,49],[2,32,50],[2,24,29],[2,8,21],[2,20,38],[2,25,30],[2,27,45],[2,33,51],[2,24,35],[2,14,27],[2,20,38],[2,25,36]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
/* __WGSL_LOADER_GENERATED */