import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/glsl";
const data = {
    "name": "light",
    "code": "//#pragma export\r\n//struct Light {\r\n//  vec4 position;\r\n//  vec4 color;\r\n//};\r\n\r\n#pragma export\r\nlayout(set = LIGHT_BINDGROUP, binding = LIGHT_BINDING) uniform LightUniforms {\r\n  vec4 lightPosition;\r\n  vec4 lightColor;\r\n} lightUniforms;\r\n",
    "table": {"hash":"8uxynfsk9l","symbols":["lightUniforms","LightUniforms"],"visibles":["lightUniforms","LightUniforms"],"declarations":[{"at":97,"symbols":["lightUniforms","LightUniforms"],"identifiers":[],"flags":1,"struct":{"name":"lightUniforms","type":{"name":"LightUniforms","qualifiers":["layout(set = LIGHT_BINDGROUP, binding = LIGHT_BINDING)","uniform"]},"struct":{"members":[{"name":"lightPosition","type":{"name":"vec4"}},{"name":"lightColor","type":{"name":"vec4"}}]}}}]},
    "shake": [[97,["lightUniforms","LightUniforms"]]],
    "tree": decompressAST([["Skip",81,96],["Shake",97,236],["Id",104,107],["Id",110,125],["Id",127,134],["Id",137,150],["Id",160,173],["Id",184,197],["Id",207,217],["Id",222,235]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const lightUniforms = getSymbol("lightUniforms");
export const LightUniforms = getSymbol("LightUniforms");
/* __GLSL_LOADER_GENERATED */