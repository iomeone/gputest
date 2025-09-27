import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
const data = {
    "name": "normal",
    "code": "@link fn getMatrix(i: u32) -> mat4x4<f32>;\r\n@link fn getNormal(i: u32) -> vec4<f32>;\r\n\r\n@export fn getTransformedNormal(i: u32) -> vec4<f32> {\r\n  let normal = getNormal(i);\r\n  let rotated = getMatrix(0u) * vec4<f32>(normal.xyz, 0.0);\r\n  return vec4<f32>(rotated.xyz, normal.w);\r\n}\r\n",
    "hash": 7802547888746670,
    "table": {"symbols":["getMatrix","getNormal","getTransformedNormal"],"visibles":["getTransformedNormal"],"externals":[{"at":0,"symbol":"getMatrix","flags":2,"func":{"name":"getMatrix","type":{"name":"mat4x4","args":[{"name":"f32"}]},"attributes":[{"name":"link"}],"parameters":[{"name":"i","type":{"name":"u32"}}],"identifiers":[]}},{"at":44,"symbol":"getNormal","flags":2,"func":{"name":"getNormal","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"link"}],"parameters":[{"name":"i","type":{"name":"u32"}}],"identifiers":[]}}],"exports":[{"at":88,"symbol":"getTransformedNormal","flags":1,"func":{"name":"getTransformedNormal","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"i","type":{"name":"u32"}}],"identifiers":["getNormal","getMatrix"]}}],"declarations":[{"at":0,"symbol":"getMatrix","flags":2,"func":{"name":"getMatrix","type":{"name":"mat4x4","args":[{"name":"f32"}]},"attributes":[{"name":"link"}],"parameters":[{"name":"i","type":{"name":"u32"}}],"identifiers":[]}},{"at":44,"symbol":"getNormal","flags":2,"func":{"name":"getNormal","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"link"}],"parameters":[{"name":"i","type":{"name":"u32"}}],"identifiers":[]}},{"at":88,"symbol":"getTransformedNormal","flags":1,"func":{"name":"getTransformedNormal","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"i","type":{"name":"u32"}}],"identifiers":["getNormal","getMatrix"]}}]},
    "shake": [[0,["getMatrix","getTransformedNormal"]],[44,["getNormal","getTransformedNormal"]],[88,["getTransformedNormal"]]],
    "tree": decompressAST([["Skip",0,41],["Skip",44,83],["Shake",88,280],["Skip",88,95],["Id",99,119],["Id",120,121],["Id",150,156],["Id",159,168],["Id",169,170],["Id",180,187],["Id",190,199],["Id",216,222],["Id",223,226],["Id",254,261],["Id",262,265],["Id",267,273],["Id",274,275]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getTransformedNormal = getSymbol("getTransformedNormal");
/* __WGSL_LOADER_GENERATED */