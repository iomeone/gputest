import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wlsl";
const data = {
    "name": "picking",
    "code": "struct PickingUniforms {\r\n  pickingId: u32;\r\n};\r\n\r\n@group(PICKING) @binding(PICKING) var<uniform> pickingUniforms: PickingUniforms;\r\n\r\n@export fn getPickingColor(fragIndex: u32) -> vec4<u32> {\r\n  var r = pickingUniforms.pickingId;\r\n  var g = fragIndex;\r\n  return vec4<u32>(r, g, 0u, 0u);\r\n}\r\n",
    "table": {"hash":"rkh1qmhkxi","symbols":["PickingUniforms","pickingUniforms","getPickingColor"],"visibles":["getPickingColor"],"declarations":[{"at":0,"symbol":"PickingUniforms","flags":0,"struct":{"name":"PickingUniforms","members":[{"name":"pickingId","type":{"name":"u32"}}]}},{"at":51,"symbol":"pickingUniforms","flags":0,"variable":{"name":"pickingUniforms","type":{"name":"PickingUniforms"},"attributes":[{"name":"group","args":["PICKING"]},{"name":"binding","args":["PICKING"]}],"identifiers":["PickingUniforms"],"qual":"<uniform>"}},{"at":135,"symbol":"getPickingColor","flags":1,"func":{"name":"getPickingColor","type":{"name":"vec4","args":[{"name":"u32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"fragIndex","type":{"name":"u32"}}],"identifiers":["pickingUniforms"]}}]},
    "shake": [[0,["PickingUniforms","pickingUniforms","getPickingColor"]],[51,["pickingUniforms","getPickingColor"]],[135,["getPickingColor"]]],
    "tree": decompressAST([["Shake",0,46],["Id",7,22],["Id",28,37],["Shake",51,131],["Attr",51,66],["Id",52,57],["Id",58,65],["Attr",67,84],["Id",68,75],["Id",76,83],["Id",98,113],["Id",115,130],["Shake",135,290],["Skip",135,142],["Id",146,161],["Id",162,171],["Id",200,201],["Id",204,219],["Id",220,229],["Id",238,239],["Id",242,251],["Id",273,274],["Id",276,277]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getPickingColor = getSymbol("getPickingColor");
/* __WGSL_LOADER_GENERATED */