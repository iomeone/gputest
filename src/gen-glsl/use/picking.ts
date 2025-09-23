import {decompressAST} from "../shader/glsl";
const data = {
    "name": "picking",
    "code": "#ifdef IS_PICKING\r\n#pragma export\r\nlayout(set = 0, binding = PICKING_BINDING) uniform PickingUniforms {\r\n  uint pickingId;\r\n} pickingUniforms;\r\n\r\n#pragma export\r\nuvec4 getPickingColor(uint fragIndex) {\r\n  uint r = pickingUniforms.pickingId;\r\n  uint g = fragIndex;\r\n  return uvec4(r, g, 0, 0);\r\n}\r\n#endif\r\n",
    "table": {"hash":"3kgv8reffg","symbols":["getPickingColor","pickingUniforms","PickingUniforms"],"visibles":["getPickingColor","pickingUniforms","PickingUniforms"],"globals":[],"externals":[],"modules":[],"functions":[{"at":162,"symbols":["getPickingColor"],"identifiers":["pickingUniforms"],"flags":1,"prototype":{"name":"getPickingColor","type":{"name":"uvec4","qualifiers":[]},"parameters":["uint","fragIndex"]}}],"declarations":[{"at":35,"symbols":["pickingUniforms","PickingUniforms"],"identifiers":[],"flags":1,"struct":{"name":"pickingUniforms","type":{"name":"PickingUniforms","qualifiers":["layout(set = 0, binding = PICKING_BINDING)","uniform"]},"struct":{"members":[{"name":"pickingId","type":{"name":"uint"}}]}}}]},
    "shake": [[35,["pickingUniforms","getPickingColor","PickingUniforms"]],[162,["getPickingColor"]]],
    "tree": decompressAST([["Skip",19,34],["Shake",35,142],["Id",42,45],["Id",51,58],["Id",61,76],["Id",86,101],["Id",112,121],["Id",126,141],["Skip",146,161],["Shake",162,295],["Id",168,183],["Id",189,198],["Id",210,211],["Id",214,229],["Id",249,250],["Id",253,262],["Id",280,281],["Id",283,284]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getPickingColor = getSymbol("getPickingColor");
export const pickingUniforms = getSymbol("pickingUniforms");
export const PickingUniforms = getSymbol("PickingUniforms");
/* __GLSL_LOADER_GENERATED */