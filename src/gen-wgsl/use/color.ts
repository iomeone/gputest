import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
const data = {
    "name": "color",
    "code": "@export fn premultiply(color: vec4<f32>) -> vec4<f32> {\r\n  return vec4<f32>(color.rgb * color.a, color.a);\r\n}\r\n",
    "hash": 7519904477363491,
    "table": {"symbols":["premultiply"],"visibles":["premultiply"],"exports":[{"at":0,"symbol":"premultiply","flags":1,"func":{"name":"premultiply","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"color","type":{"name":"vec4","args":[{"name":"f32"}]}}],"identifiers":[]}}],"declarations":[{"at":0,"symbol":"premultiply","flags":1,"func":{"name":"premultiply","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"color","type":{"name":"vec4","args":[{"name":"f32"}]}}],"identifiers":[]}}]},
    "shake": [[0,["premultiply"]]],
    "tree": decompressAST([["Shake",0,109],["Skip",0,7],["Id",11,22],["Id",23,28],["Id",76,81],["Id",82,85],["Id",88,93],["Id",94,95],["Id",97,102],["Id",103,104]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const premultiply = getSymbol("premultiply");
/* __WGSL_LOADER_GENERATED */