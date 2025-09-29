import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getTransformMatrix","getCartesianPosition"],"visibles":["getCartesianPosition"],"externals":[{"at":0,"symbol":"getTransformMatrix","flags":6,"func":{"name":"getTransformMatrix","type":"mat4x4<f32>","attr":["optional","link"]}}],"exports":[{"at":63,"symbol":"getCartesianPosition","flags":1,"func":{"name":"getCartesianPosition","type":"vec4<f32>","attr":["export"],"parameters":[{"name":"vector","type":"vec4<f32>"}],"identifiers":["getTransformMatrix"]}}],"linkable":{"getTransformMatrix":true}}; const data = {
  "name": "cartesian",
  "code": "@optional @link fn getTransformMatrix() -> mat4x4<f32> { };\r\n\r\n@export fn getCartesianPosition(vector: vec4<f32>) -> vec4<f32> {\r\n  return getTransformMatrix() * vec4<f32>(vector.xyz, 1.0);\r\n}\r\n",
  "hash": 7975976986415848,
  "table": t,
  "shake": [[0,[0,1]],[63,[1]]],
  "tree": decompressAST([[4,0,58,0],[1,0,9],[1,10,15],[2,9,27],[0,44,173],[1,0,7],[2,11,31],[2,21,27],[2,44,62],[2,33,39],[2,7,10]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getCartesianPosition = getSymbol("getCartesianPosition");
/* __WGSL_LOADER_GENERATED */