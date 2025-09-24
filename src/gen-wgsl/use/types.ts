import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
const data = {
    "name": "types",
    "code": "@export struct SolidVertex {\r\n  position: vec4<f32>;\r\n  color: vec4<f32>;\r\n  uv: vec2<f32>;\r\n};\r\n\r\n@export struct MeshVertex {\r\n  position: vec4<f32>;\r\n  normal: vec3<f32>;\r\n  color: vec4<f32>;\r\n  uv: vec2<f32>;\r\n};\r\n",
    "table": {"hash":"awu5i9xikq","symbols":["SolidVertex","MeshVertex"],"visibles":["SolidVertex","MeshVertex"],"declarations":[{"at":0,"symbol":"SolidVertex","flags":1,"struct":{"name":"SolidVertex","attributes":[{"name":"export"}],"members":[{"name":"position","type":{"name":"vec4","args":[{"name":"f32"}]}},{"name":"color","type":{"name":"vec4","args":[{"name":"f32"}]}},{"name":"uv","type":{"name":"vec2","args":[{"name":"f32"}]}}]}},{"at":99,"symbol":"MeshVertex","flags":1,"struct":{"name":"MeshVertex","attributes":[{"name":"export"}],"members":[{"name":"position","type":{"name":"vec4","args":[{"name":"f32"}]}},{"name":"normal","type":{"name":"vec3","args":[{"name":"f32"}]}},{"name":"color","type":{"name":"vec4","args":[{"name":"f32"}]}},{"name":"uv","type":{"name":"vec2","args":[{"name":"f32"}]}}]}}]},
    "shake": [[0,["SolidVertex"]],[99,["MeshVertex"]]],
    "tree": decompressAST([["Shake",0,94],["Skip",0,7],["Id",15,26],["Id",32,40],["Id",56,61],["Id",77,79],["Shake",99,214],["Skip",99,106],["Id",114,124],["Id",130,138],["Id",154,160],["Id",176,181],["Id",197,199]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const SolidVertex = getSymbol("SolidVertex");
export const MeshVertex = getSymbol("MeshVertex");
/* __WGSL_LOADER_GENERATED */