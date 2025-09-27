import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
const data = {
    "name": "cartesian",
    "code": "@external fn getMatrix(i: u32) -> mat4x4<f32>;\r\n\r\n@export fn getCartesianPosition(position: vec4<f32>) -> vec4<f32> {\r\n  let pos = vec4<f32>(position.xyz, 1.0);\r\n  return getMatrix(0u) * pos;\r\n}\r\n",
    "hash": "wchv4h1ibs",
    "table": {"symbols":["getMatrix","getCartesianPosition"],"visibles":["getCartesianPosition"],"declarations":[{"at":0,"symbol":"getMatrix","flags":2,"func":{"name":"getMatrix","type":{"name":"mat4x4","args":[{"name":"f32"}]},"attributes":[{"name":"external"}],"parameters":[{"name":"i","type":{"name":"u32"}}],"identifiers":[]}},{"at":50,"symbol":"getCartesianPosition","flags":1,"func":{"name":"getCartesianPosition","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"position","type":{"name":"vec4","args":[{"name":"f32"}]}}],"identifiers":["getMatrix"]}}],"externals":[{"at":0,"symbol":"getMatrix","flags":2,"func":{"name":"getMatrix","type":{"name":"mat4x4","args":[{"name":"f32"}]},"attributes":[{"name":"external"}],"parameters":[{"name":"i","type":{"name":"u32"}}],"identifiers":[]}}]},
    "shake": [[0,["getMatrix","getCartesianPosition"]],[50,["getCartesianPosition"]]],
    "tree": decompressAST([["Skip",0,45],["Shake",50,194],["Skip",50,57],["Id",61,81],["Id",82,90],["Id",125,128],["Id",141,149],["Id",150,153],["Id",171,180],["Id",187,190]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getCartesianPosition = getSymbol("getCartesianPosition");
/* __WGSL_LOADER_GENERATED */