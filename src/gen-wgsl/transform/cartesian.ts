import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
const data = {
    "name": "cartesian",
    "code": "@link fn getMatrix() -> mat4x4<f32>;\r\n\r\n@export fn getCartesianPosition(position: vec4<f32>) -> vec4<f32> {\r\n  let pos = vec4<f32>(position.xyz, 1.0);\r\n  return getMatrix() * pos;\r\n}\r\n",
    "hash": 6147021583329978,
    "table": {"symbols":["getMatrix","getCartesianPosition"],"visibles":["getCartesianPosition"],"externals":[{"at":0,"symbol":"getMatrix","flags":2,"func":{"name":"getMatrix","type":{"name":"mat4x4","args":[{"name":"f32"}]},"attributes":[{"name":"link"}],"identifiers":[]}}],"exports":[{"at":40,"symbol":"getCartesianPosition","flags":1,"func":{"name":"getCartesianPosition","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"position","type":{"name":"vec4","args":[{"name":"f32"}]}}],"identifiers":["getMatrix"]}}],"declarations":[{"at":0,"symbol":"getMatrix","flags":2,"func":{"name":"getMatrix","type":{"name":"mat4x4","args":[{"name":"f32"}]},"attributes":[{"name":"link"}],"identifiers":[]}},{"at":40,"symbol":"getCartesianPosition","flags":1,"func":{"name":"getCartesianPosition","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"position","type":{"name":"vec4","args":[{"name":"f32"}]}}],"identifiers":["getMatrix"]}}]},
    "shake": [[0,["getMatrix","getCartesianPosition"]],[40,["getCartesianPosition"]]],
    "tree": decompressAST([["Skip",0,35],["Shake",40,182],["Skip",40,47],["Id",51,71],["Id",72,80],["Id",115,118],["Id",131,139],["Id",140,143],["Id",161,170],["Id",175,178]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getCartesianPosition = getSymbol("getCartesianPosition");
/* __WGSL_LOADER_GENERATED */