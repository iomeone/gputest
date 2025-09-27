import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
const data = {
    "name": "axis",
    "code": "@link fn getAxisStep(i: u32) -> vec4<f32>;\r\n@link fn getAxisOrigin(i: u32) -> vec4<f32>;\r\n\r\n@export fn getAxisPosition(index: u32) -> vec4<f32> {\r\n  return getAxisStep(0u) * f32(index) + getAxisOrigin(0u);\r\n}\r\n",
    "hash": 773865906701595,
    "table": {"symbols":["getAxisStep","getAxisOrigin","getAxisPosition"],"visibles":["getAxisPosition"],"externals":[{"at":0,"symbol":"getAxisStep","flags":2,"func":{"name":"getAxisStep","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"link"}],"parameters":[{"name":"i","type":{"name":"u32"}}],"identifiers":[]}},{"at":44,"symbol":"getAxisOrigin","flags":2,"func":{"name":"getAxisOrigin","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"link"}],"parameters":[{"name":"i","type":{"name":"u32"}}],"identifiers":[]}}],"exports":[{"at":92,"symbol":"getAxisPosition","flags":1,"func":{"name":"getAxisPosition","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"index","type":{"name":"u32"}}],"identifiers":["getAxisStep","getAxisOrigin"]}}],"declarations":[{"at":0,"symbol":"getAxisStep","flags":2,"func":{"name":"getAxisStep","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"link"}],"parameters":[{"name":"i","type":{"name":"u32"}}],"identifiers":[]}},{"at":44,"symbol":"getAxisOrigin","flags":2,"func":{"name":"getAxisOrigin","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"link"}],"parameters":[{"name":"i","type":{"name":"u32"}}],"identifiers":[]}},{"at":92,"symbol":"getAxisPosition","flags":1,"func":{"name":"getAxisPosition","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"index","type":{"name":"u32"}}],"identifiers":["getAxisStep","getAxisOrigin"]}}]},
    "shake": [[0,["getAxisStep","getAxisPosition"]],[44,["getAxisOrigin","getAxisPosition"]],[92,["getAxisPosition"]]],
    "tree": decompressAST([["Skip",0,41],["Skip",44,87],["Shake",92,208],["Skip",92,99],["Id",103,118],["Id",119,124],["Id",156,167],["Id",178,183],["Id",187,200]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getAxisPosition = getSymbol("getAxisPosition");
/* __WGSL_LOADER_GENERATED */