import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
const data = {
    "name": "passthru",
    "code": "@export fn getPassThruFragment(color: vec4<f32>, uv: vec2<f32>) -> vec4<f32> {\r\n  return color;\r\n}\r\n",
    "table": {"hash":"n4rwaql2d3","symbols":["getPassThruFragment"],"visibles":["getPassThruFragment"],"declarations":[{"at":0,"symbol":"getPassThruFragment","flags":1,"func":{"name":"getPassThruFragment","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"color","type":{"name":"vec4","args":[{"name":"f32"}]}},{"name":"uv","type":{"name":"vec2","args":[{"name":"f32"}]}}],"identifiers":[]}}]},
    "shake": [[0,["getPassThruFragment"]]],
    "tree": decompressAST([["Shake",0,98],["Skip",0,7],["Id",11,30],["Id",31,36],["Id",49,51],["Id",89,94]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getPassThruFragment = getSymbol("getPassThruFragment");
/* __WGSL_LOADER_GENERATED */