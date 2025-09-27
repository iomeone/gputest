import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
const data = {
    "name": "textured",
    "code": "@optional @link fn getTexture(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(1.0, 1.0, 1.0, 1.0); };\r\n\r\n@export fn getTextureFragment(color: vec4<f32>, uv: vec4<f32>, st: vec4<f32>) -> vec4<f32> {\r\n  return color * getTexture(uv.xy);\r\n}\r\n",
    "hash": 7334072660508444,
    "table": {"symbols":["getTexture","getTextureFragment"],"visibles":["getTextureFragment"],"externals":[{"at":0,"symbol":"getTexture","flags":6,"func":{"name":"getTexture","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"optional"},{"name":"link"}],"parameters":[{"name":"uv","type":{"name":"vec2","args":[{"name":"f32"}]}}],"identifiers":[]}}],"exports":[{"at":104,"symbol":"getTextureFragment","flags":1,"func":{"name":"getTextureFragment","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"color","type":{"name":"vec4","args":[{"name":"f32"}]}},{"name":"uv","type":{"name":"vec4","args":[{"name":"f32"}]}},{"name":"st","type":{"name":"vec4","args":[{"name":"f32"}]}}],"identifiers":["getTexture"]}}],"declarations":[{"at":0,"symbol":"getTexture","flags":6,"func":{"name":"getTexture","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"optional"},{"name":"link"}],"parameters":[{"name":"uv","type":{"name":"vec2","args":[{"name":"f32"}]}}],"identifiers":[]}},{"at":104,"symbol":"getTextureFragment","flags":1,"func":{"name":"getTextureFragment","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"color","type":{"name":"vec4","args":[{"name":"f32"}]}},{"name":"uv","type":{"name":"vec4","args":[{"name":"f32"}]}},{"name":"st","type":{"name":"vec4","args":[{"name":"f32"}]}}],"identifiers":["getTexture"]}}]},
    "shake": [[0,["getTexture","getTextureFragment"]],[104,["getTextureFragment"]]],
    "tree": decompressAST([["Opt",0,99,"getTexture"],["Skip",0,9],["Skip",10,15],["Id",19,29],["Id",30,32],["Shake",104,236],["Skip",104,111],["Id",115,133],["Id",134,139],["Id",152,154],["Id",167,169],["Id",207,212],["Id",215,225],["Id",226,228],["Id",229,231]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getTextureFragment = getSymbol("getTextureFragment");
/* __WGSL_LOADER_GENERATED */