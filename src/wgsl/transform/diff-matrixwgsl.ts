import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getTransformMatrix","getNormalMatrix","getMatrixDifferential"],"visibles":["getMatrixDifferential"],"externals":[{"at":0,"symbol":"getTransformMatrix","flags":2,"func":{"name":"getTransformMatrix","type":"mat4x4<f32>","attr":["link"]}},{"at":47,"symbol":"getNormalMatrix","flags":2,"func":{"name":"getNormalMatrix","type":"mat3x3<f32>","attr":["link"]}}],"exports":[{"at":93,"symbol":"getMatrixDifferential","flags":1,"func":{"name":"getMatrixDifferential","type":"vec4<f32>","attr":["export"],"parameters":[{"name":"vector","type":"vec4<f32>"},{"name":"origin","type":"vec4<f32>"},{"name":"contravariant","type":"bool"}],"identifiers":["getNormalMatrix","getTransformMatrix"]}}],"linkable":{"getTransformMatrix":true,"getNormalMatrix":true}}; const data = {
  "name": "diff-matrix",
  "code": "@link fn getTransformMatrix() -> mat4x4<f32>;\r\n@link fn getNormalMatrix() -> mat3x3<f32>;\r\n\r\n@export fn getMatrixDifferential(vector: vec4<f32>, origin: vec4<f32>, contravariant: bool) -> vec4<f32> {\r\n  if (contravariant) { return vec4<f32>(getNormalMatrix() * vector.xyz, vector.w); }\r\n  let v4 = getTransformMatrix() * vec4<f32>(vector.xyz, 0.0);\r\n  return vec4<f32>(v4.xyz, vector.w);\r\n}\r\n",
  "hash": 8044171332834295,
  "table": t,
  "shake": [[0,[0,2]],[47,[1,2]],[93,[2]]],
  "tree": decompressAST([[1,0,44],[1,47,88],[0,46,343],[1,0,7],[2,11,32],[2,22,28],[2,19,25],[2,19,32],[2,43,56],[2,34,49],[2,20,26],[2,7,10],[2,5,11],[2,7,8],[2,13,15],[2,5,23],[2,33,39],[2,7,10],[2,31,33],[2,3,6],[2,5,11],[2,7,8]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getMatrixDifferential = getSymbol("getMatrixDifferential");
/* __WGSL_LOADER_GENERATED */