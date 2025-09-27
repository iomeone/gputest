import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
const data = {
    "name": "passthru",
    "code": "@export fn getPassThruFragment(color: vec4<f32>, uv: vec4<f32>, st: vec4<f32>) -> vec4<f32> {\r\n  return vec4<f32>(color.xyz * color.a, color.a);\r\n}\r\n",
    "hash": 8831170841115285,
    "table": {"symbols":["getPassThruFragment"],"visibles":["getPassThruFragment"],"exports":[{"at":0,"symbol":"getPassThruFragment","flags":1,"func":{"name":"getPassThruFragment","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"color","type":{"name":"vec4","args":[{"name":"f32"}]}},{"name":"uv","type":{"name":"vec4","args":[{"name":"f32"}]}},{"name":"st","type":{"name":"vec4","args":[{"name":"f32"}]}}],"identifiers":[]}}],"declarations":[{"at":0,"symbol":"getPassThruFragment","flags":1,"func":{"name":"getPassThruFragment","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"color","type":{"name":"vec4","args":[{"name":"f32"}]}},{"name":"uv","type":{"name":"vec4","args":[{"name":"f32"}]}},{"name":"st","type":{"name":"vec4","args":[{"name":"f32"}]}}],"identifiers":[]}}]},
    "shake": [[0,["getPassThruFragment"]]],
    "tree": decompressAST([["Shake",0,147],["Skip",0,7],["Id",11,30],["Id",31,36],["Id",49,51],["Id",64,66],["Id",114,119],["Id",120,123],["Id",126,131],["Id",132,133],["Id",135,140],["Id",141,142]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getPassThruFragment = getSymbol("getPassThruFragment");
/* __WGSL_LOADER_GENERATED */