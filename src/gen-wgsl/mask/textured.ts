import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
const data = {
    "name": "textured",
    "code": "@optional @external fn getTexture(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(1.0, 1.0, 1.0, 1.0); };\r\n\r\n@export fn getTextureFragment(color: vec4<f32>, uv: vec2<f32>) -> vec4<f32> {\r\n  return color * getTexture(uv);\r\n}\r\n",
    "hash": "h8kiiu7h4c",
    "table": {"symbols":["getTexture","getTextureFragment"],"visibles":["getTextureFragment"],"declarations":[{"at":0,"symbol":"getTexture","flags":6,"func":{"name":"getTexture","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"optional"},{"name":"external"}],"parameters":[{"name":"uv","type":{"name":"vec2","args":[{"name":"f32"}]}}],"identifiers":[]}},{"at":108,"symbol":"getTextureFragment","flags":1,"func":{"name":"getTextureFragment","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"color","type":{"name":"vec4","args":[{"name":"f32"}]}},{"name":"uv","type":{"name":"vec2","args":[{"name":"f32"}]}}],"identifiers":["getTexture"]}}],"externals":[{"at":0,"symbol":"getTexture","flags":6,"func":{"name":"getTexture","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"optional"},{"name":"external"}],"parameters":[{"name":"uv","type":{"name":"vec2","args":[{"name":"f32"}]}}],"identifiers":[]}}]},
    "shake": [[0,["getTexture","getTextureFragment"]],[108,["getTextureFragment"]]],
    "tree": decompressAST([["Opt",0,103,"getTexture"],["Skip",0,9],["Skip",10,19],["Id",23,33],["Id",34,36],["Shake",108,222],["Skip",108,115],["Id",119,137],["Id",138,143],["Id",156,158],["Id",196,201],["Id",204,214],["Id",215,217]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getTextureFragment = getSymbol("getTextureFragment");
/* __WGSL_LOADER_GENERATED */