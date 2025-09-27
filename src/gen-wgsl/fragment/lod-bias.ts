import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
const data = {
    "name": "lod-bias",
    "code": "@link fn getTexture(uv: vec2<f32>, bias: f32) -> vec4<f32> {}\r\n\r\n@optional @link fn getLODBias() -> f32 { return 0.0; }\r\n\r\n@export fn getLODBiasedTexture(uv: vec2<f32>) -> vec4<f32> {\r\n  return getTexture(uv, getLODBias());\r\n};\r\n",
    "hash": 1378858834687148,
    "table": {"symbols":["getTexture","getLODBias","getLODBiasedTexture"],"visibles":["getLODBiasedTexture"],"externals":[{"at":0,"symbol":"getTexture","flags":2,"func":{"name":"getTexture","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"link"}],"parameters":[{"name":"uv","type":{"name":"vec2","args":[{"name":"f32"}]}},{"name":"bias","type":{"name":"f32"}}],"identifiers":[]}},{"at":65,"symbol":"getLODBias","flags":6,"func":{"name":"getLODBias","type":{"name":"f32"},"attributes":[{"name":"optional"},{"name":"link"}],"identifiers":[]}}],"exports":[{"at":123,"symbol":"getLODBiasedTexture","flags":1,"func":{"name":"getLODBiasedTexture","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"uv","type":{"name":"vec2","args":[{"name":"f32"}]}}],"identifiers":["getTexture","getLODBias"]}}],"declarations":[{"at":0,"symbol":"getTexture","flags":2,"func":{"name":"getTexture","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"link"}],"parameters":[{"name":"uv","type":{"name":"vec2","args":[{"name":"f32"}]}},{"name":"bias","type":{"name":"f32"}}],"identifiers":[]}},{"at":65,"symbol":"getLODBias","flags":6,"func":{"name":"getLODBias","type":{"name":"f32"},"attributes":[{"name":"optional"},{"name":"link"}],"identifiers":[]}},{"at":123,"symbol":"getLODBiasedTexture","flags":1,"func":{"name":"getLODBiasedTexture","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"uv","type":{"name":"vec2","args":[{"name":"f32"}]}}],"identifiers":["getTexture","getLODBias"]}}]},
    "shake": [[0,["getTexture","getLODBiasedTexture"]],[65,["getLODBias","getLODBiasedTexture"]],[123,["getLODBiasedTexture"]]],
    "tree": decompressAST([["Skip",0,61],["Opt",65,119,"getLODBias"],["Skip",65,74],["Skip",75,80],["Id",84,94],["Shake",123,226],["Skip",123,130],["Id",134,153],["Id",154,156],["Id",194,204],["Id",205,207],["Id",209,219]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getLODBiasedTexture = getSymbol("getLODBiasedTexture");
/* __WGSL_LOADER_GENERATED */