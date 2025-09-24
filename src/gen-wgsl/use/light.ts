import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
const data = {
    "name": "light",
    "code": "struct LightUniforms {\r\n  lightPosition: vec4<f32>;\r\n  lightColor: vec4<f32>;\r\n};\r\n\r\n@export @group(LIGHT) @binding(LIGHT) var<uniform> lightUniforms: LightUniforms;\r\n",
    "table": {"hash":"agcqlo4qk7","symbols":["LightUniforms","lightUniforms"],"visibles":["lightUniforms"],"declarations":[{"at":0,"symbol":"LightUniforms","flags":0,"struct":{"name":"LightUniforms","members":[{"name":"lightPosition","type":{"name":"vec4","args":[{"name":"f32"}]}},{"name":"lightColor","type":{"name":"vec4","args":[{"name":"f32"}]}}]}},{"at":85,"symbol":"lightUniforms","flags":1,"variable":{"name":"lightUniforms","type":{"name":"LightUniforms"},"attributes":[{"name":"export"},{"name":"group","args":["LIGHT"]},{"name":"binding","args":["LIGHT"]}],"identifiers":["LightUniforms"],"qual":"<uniform>"}}]},
    "shake": [[0,["LightUniforms","lightUniforms"]],[85,["lightUniforms"]]],
    "tree": decompressAST([["Shake",0,80],["Id",7,20],["Id",26,39],["Id",55,65],["Shake",85,165],["Skip",85,92],["Attr",93,106],["Id",94,99],["Id",100,105],["Attr",107,122],["Id",108,115],["Id",116,121],["Id",136,149],["Id",151,164]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const lightUniforms = getSymbol("lightUniforms");
/* __WGSL_LOADER_GENERATED */