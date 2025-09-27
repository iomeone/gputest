import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
const data = {
    "name": "axis",
    "code": "@external fn getAxisStep(i: u32) -> vec4<f32>;\r\n@external fn getAxisOrigin(i: u32) -> vec4<f32>;\r\n\r\n@export fn getAxisPosition(index: u32) -> vec4<f32> {\r\n  return getAxisStep(0u) * f32(index) + getAxisOrigin(0u);\r\n}\r\n",
    "hash": "mv5z75ijmf",
    "table": {"symbols":["getAxisStep","getAxisOrigin","getAxisPosition"],"visibles":["getAxisPosition"],"declarations":[{"at":0,"symbol":"getAxisStep","flags":2,"func":{"name":"getAxisStep","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"external"}],"parameters":[{"name":"i","type":{"name":"u32"}}],"identifiers":[]}},{"at":48,"symbol":"getAxisOrigin","flags":2,"func":{"name":"getAxisOrigin","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"external"}],"parameters":[{"name":"i","type":{"name":"u32"}}],"identifiers":[]}},{"at":100,"symbol":"getAxisPosition","flags":1,"func":{"name":"getAxisPosition","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"index","type":{"name":"u32"}}],"identifiers":["getAxisStep","getAxisOrigin"]}}],"externals":[{"at":0,"symbol":"getAxisStep","flags":2,"func":{"name":"getAxisStep","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"external"}],"parameters":[{"name":"i","type":{"name":"u32"}}],"identifiers":[]}},{"at":48,"symbol":"getAxisOrigin","flags":2,"func":{"name":"getAxisOrigin","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"external"}],"parameters":[{"name":"i","type":{"name":"u32"}}],"identifiers":[]}}]},
    "shake": [[0,["getAxisStep","getAxisPosition"]],[48,["getAxisOrigin","getAxisPosition"]],[100,["getAxisPosition"]]],
    "tree": decompressAST([["Skip",0,45],["Skip",48,95],["Shake",100,216],["Skip",100,107],["Id",111,126],["Id",127,132],["Id",164,175],["Id",186,191],["Id",195,208]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getAxisPosition = getSymbol("getAxisPosition");
/* __WGSL_LOADER_GENERATED */