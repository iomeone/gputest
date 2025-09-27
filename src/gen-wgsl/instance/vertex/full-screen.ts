import {parseBundle} from "../../../shader";
import {decompressAST} from "../../../shader/wgsl";
import m0 from "../../../gen-wgsl/use/types";
import m1 from "../../../gen-wgsl/geometry/quad";
import m2 from "../../../gen-wgsl/use/view";
const data = {
    "name": "full-screen",
    "code": "use '../../../wgsl/use/types'::{ SolidVertex };\r\nuse '../../../wgsl/geometry/quad'::{ getQuadUV };\r\nuse '../../../wgsl/use/view'::{ viewUniforms };\r\n\r\n@export fn getFullScreenVertex(vertexIndex: u32, instanceIndex: u32) -> SolidVertex {\r\n  var uv = getQuadUV(vertexIndex);\r\n  var xy = uv * 2.0 - 1.0;\r\n  \r\n  var zz = viewUniforms.viewSize;\r\n  \r\n  return SolidVertex(\r\n    vec4<f32>(xy.x * 2.0 + 1.0, -(xy.y * 2.0 + 1.0), 0.5, 1.0),\r\n    vec4<f32>(1.0, 1.0, 1.0, 1.0),\r\n    uv * 2.0,\r\n    instanceIndex,\r\n  );\r\n}",
    "hash": "l2gp2f9r0g",
    "table": {"symbols":["getFullScreenVertex"],"visibles":["getFullScreenVertex"],"modules":[{"at":0,"name":"../../../wgsl/use/types","symbols":["SolidVertex"],"imports":[{"name":"SolidVertex","imported":"SolidVertex"}]},{"at":0,"name":"../../../wgsl/geometry/quad","symbols":["getQuadUV"],"imports":[{"name":"getQuadUV","imported":"getQuadUV"}]},{"at":0,"name":"../../../wgsl/use/view","symbols":["viewUniforms"],"imports":[{"name":"viewUniforms","imported":"viewUniforms"}]}],"declarations":[{"at":151,"symbol":"getFullScreenVertex","flags":1,"func":{"name":"getFullScreenVertex","type":{"name":"SolidVertex"},"attributes":[{"name":"export"}],"parameters":[{"name":"vertexIndex","type":{"name":"u32"}},{"name":"instanceIndex","type":{"name":"u32"}}],"identifiers":[]}}]},
    "shake": [[151,["getFullScreenVertex"]]],
    "tree": decompressAST([["Skip",0,46],["Skip",49,97],["Skip",100,146],["Shake",151,511],["Skip",151,158],["Id",162,181],["Id",182,193],["Id",200,213],["Id",223,234],["Id",244,246],["Id",249,258],["Id",259,270],["Id",280,282],["Id",285,287],["Id",312,314],["Id",317,329],["Id",330,338],["Id",354,365],["Id",382,384],["Id",385,386],["Id",402,404],["Id",405,406],["Id",473,475],["Id",488,501]]),
  };
const libs = {"../../../wgsl/use/types": m0, "../../../wgsl/geometry/quad": m1, "../../../wgsl/use/view": m2};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getFullScreenVertex = getSymbol("getFullScreenVertex");
/* __WGSL_LOADER_GENERATED */