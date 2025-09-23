import {decompressAST} from "../shader/glsl";
const data = {
    "name": "light",
    "code": "//#pragma export\r\n//struct Light {\r\n//  vec4 position;\r\n//  vec4 color;\r\n//};\r\n\r\n#pragma export\r\nlayout(set = 0, binding = LIGHT_BINDING) uniform LightUniforms {\r\n  vec4 lightPosition;\r\n  vec4 lightColor;\r\n} lightUniforms;\r\n",
    "table": {"hash":"aqvox9x1nw","symbols":["lightUniforms","LightUniforms"],"visibles":["lightUniforms","LightUniforms"],"globals":[],"externals":[],"modules":[],"functions":[],"declarations":[{"at":97,"symbols":["lightUniforms","LightUniforms"],"identifiers":[],"flags":1,"struct":{"name":"lightUniforms","type":{"name":"LightUniforms","qualifiers":["layout(set = 0, binding = LIGHT_BINDING)","uniform"]},"struct":{"members":[{"name":"lightPosition","type":{"name":"vec4"}},{"name":"lightColor","type":{"name":"vec4"}}]}}}]},
    "shake": [[97,["lightUniforms","LightUniforms"]]],
    "tree": decompressAST([["Skip",81,96],["Shake",97,222],["Id",104,107],["Id",113,120],["Id",123,136],["Id",146,159],["Id",170,183],["Id",193,203],["Id",208,221]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const lightUniforms = getSymbol("lightUniforms");
export const LightUniforms = getSymbol("LightUniforms");
/* __GLSL_LOADER_GENERATED */