import {parseBundle} from "../../../shader";
import {decompressAST} from "../../../shader/wgsl";
import m0 from "../../../gen-wgsl/use/types";
import m1 from "../../../gen-wgsl/geometry/quad";
import m2 from "../../../gen-wgsl/use/view";
const data = {
    "name": "full-screen",
    "code": "use '../../../wgsl/use/types'::{ SolidVertex };\r\nuse '../../../wgsl/geometry/quad'::{ getQuadUV };\r\nuse '../../../wgsl/use/view'::{ getViewSize };\r\n\r\n//  0        1      2\r\n//    +------.------/\r\n//    |      .    /\r\n//    |      .  / \r\n//  1 ......../ \r\n//    |     /\r\n//    |   /\r\n//    | /\r\n//  2 /\r\n\r\n@export fn getFullScreenVertex(vertexIndex: u32, instanceIndex: u32) -> SolidVertex {\r\n  var c = getViewSize(); // Ensure view uniforms are used\r\n\r\n  var uv = getQuadUV(vertexIndex);\r\n  var xy = uv * 2.0 - 1.0;\r\n  \r\n  return SolidVertex(\r\n    vec4<f32>(xy.x * 2.0 + 1.0, -(xy.y * 2.0 + 1.0), 0.5, 1.0),\r\n    vec4<f32>(1.0, 1.0, 1.0, 1.0),\r\n    vec4<f32>(uv * 2.0, 0.0, 0.0),\r\n    vec4<f32>(0.0),\r\n    instanceIndex,\r\n  );\r\n}",
    "hash": 7589453062418537,
    "table": {"symbols":["getFullScreenVertex"],"visibles":["getFullScreenVertex"],"modules":[{"at":0,"name":"../../../wgsl/use/types","symbols":["SolidVertex"],"imports":[{"name":"SolidVertex","imported":"SolidVertex"}]},{"at":0,"name":"../../../wgsl/geometry/quad","symbols":["getQuadUV"],"imports":[{"name":"getQuadUV","imported":"getQuadUV"}]},{"at":0,"name":"../../../wgsl/use/view","symbols":["getViewSize"],"imports":[{"name":"getViewSize","imported":"getViewSize"}]}],"exports":[{"at":305,"symbol":"getFullScreenVertex","flags":1,"func":{"name":"getFullScreenVertex","type":{"name":"SolidVertex"},"attributes":[{"name":"export"}],"parameters":[{"name":"vertexIndex","type":{"name":"u32"}},{"name":"instanceIndex","type":{"name":"u32"}}],"identifiers":[]}}],"declarations":[{"at":305,"symbol":"getFullScreenVertex","flags":1,"func":{"name":"getFullScreenVertex","type":{"name":"SolidVertex"},"attributes":[{"name":"export"}],"parameters":[{"name":"vertexIndex","type":{"name":"u32"}},{"name":"instanceIndex","type":{"name":"u32"}}],"identifiers":[]}}]},
    "shake": [[305,["getFullScreenVertex"]]],
    "tree": decompressAST([["Skip",0,46],["Skip",49,97],["Skip",100,145],["Shake",305,729],["Skip",305,312],["Id",316,335],["Id",336,347],["Id",354,367],["Id",377,388],["Id",398,399],["Id",402,413],["Id",459,461],["Id",464,473],["Id",474,485],["Id",495,497],["Id",500,502],["Id",530,541],["Id",558,560],["Id",561,562],["Id",578,580],["Id",581,582],["Id",659,661],["Id",706,719]]),
  };
const libs = {"../../../wgsl/use/types": m0, "../../../wgsl/geometry/quad": m1, "../../../wgsl/use/view": m2};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getFullScreenVertex = getSymbol("getFullScreenVertex");
/* __WGSL_LOADER_GENERATED */