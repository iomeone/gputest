import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/glsl";
const data = {
    "name": "picking",
    "code": "#ifdef IS_PICKING\r\n#pragma export\r\nlayout(set = PICKING_BINDGROUP, binding = PICKING_BINDING) uniform PickingUniforms {\r\n  uint pickingId;\r\n} pickingUniforms;\r\n\r\n#pragma export\r\nuvec4 getPickingColor(uint fragIndex) {\r\n  uint r = pickingUniforms.pickingId;\r\n  uint g = fragIndex;\r\n  return uvec4(r, g, 0, 0);\r\n}\r\n#endif\r\n",
    "table": {"hash":"t8rn8gmi5e","symbols":["getPickingColor","pickingUniforms","PickingUniforms"],"visibles":["getPickingColor","pickingUniforms","PickingUniforms"],"functions":[{"at":178,"symbols":["getPickingColor"],"identifiers":["pickingUniforms"],"flags":1,"prototype":{"name":"getPickingColor","type":{"name":"uvec4","qualifiers":[]},"parameters":["uint","fragIndex"]}}],"declarations":[{"at":35,"symbols":["pickingUniforms","PickingUniforms"],"identifiers":[],"flags":1,"struct":{"name":"pickingUniforms","type":{"name":"PickingUniforms","qualifiers":["layout(set = PICKING_BINDGROUP, binding = PICKING_BINDING)","uniform"]},"struct":{"members":[{"name":"pickingId","type":{"name":"uint"}}]}}}]},
    "shake": [[35,["pickingUniforms","getPickingColor","PickingUniforms"]],[178,["getPickingColor"]]],
    "tree": decompressAST([["Skip",19,34],["Shake",35,158],["Id",42,45],["Id",48,65],["Id",67,74],["Id",77,92],["Id",102,117],["Id",128,137],["Id",142,157],["Skip",162,177],["Shake",178,311],["Id",184,199],["Id",205,214],["Id",226,227],["Id",230,245],["Id",265,266],["Id",269,278],["Id",296,297],["Id",299,300]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getPickingColor = getSymbol("getPickingColor");
export const pickingUniforms = getSymbol("pickingUniforms");
export const PickingUniforms = getSymbol("PickingUniforms");
/* __GLSL_LOADER_GENERATED */