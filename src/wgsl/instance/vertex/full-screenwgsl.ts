import {decompressAST, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../use/typeswgsl";
import m1 from "../../geometry/quadwgsl";
import m2 from "../../use/viewwgsl";
const t = {"symbols":["getFullScreenVertex"],"visibles":["getFullScreenVertex"],"modules":[{"at":0,"name":"../../../wgsl/use/types","symbols":["SolidVertex"],"imports":[{"name":"SolidVertex","imported":"SolidVertex"}]},{"at":0,"name":"../../../wgsl/geometry/quad","symbols":["getQuadUV"],"imports":[{"name":"getQuadUV","imported":"getQuadUV"}]},{"at":0,"name":"../../../wgsl/use/view","symbols":["getViewSize"],"imports":[{"name":"getViewSize","imported":"getViewSize"}]}],"exports":[{"at":305,"symbol":"getFullScreenVertex","flags":1,"func":{"name":"getFullScreenVertex","type":"SolidVertex","attr":["export"],"parameters":[{"name":"vertexIndex","type":"u32"},{"name":"instanceIndex","type":"u32"}]}}]}; const data = {
  "name": "full-screen",
  "code": "use '../../../wgsl/use/types'::{ SolidVertex };\r\nuse '../../../wgsl/geometry/quad'::{ getQuadUV };\r\nuse '../../../wgsl/use/view'::{ getViewSize };\r\n\r\n//  0        1      2\r\n//    +------.------/\r\n//    |      .    /\r\n//    |      .  / \r\n//  1 ......../ \r\n//    |     /\r\n//    |   /\r\n//    | /\r\n//  2 /\r\n\r\n@export fn getFullScreenVertex(vertexIndex: u32, instanceIndex: u32) -> SolidVertex {\r\n  var c = getViewSize(); // Ensure view uniforms are used\r\n\r\n  var uv = getQuadUV(vertexIndex);\r\n  var xy = uv * 2.0 - 1.0;\r\n  \r\n  return SolidVertex(\r\n    vec4<f32>(xy.x * 2.0 + 1.0, -(xy.y * 2.0 + 1.0), 0.5, 1.0),\r\n    vec4<f32>(1.0, 1.0, 1.0, 1.0),\r\n    vec4<f32>(uv * 2.0, 0.0, 0.0),\r\n    vec4<f32>(0.0),\r\n    vec4<f32>(1.0),\r\n    instanceIndex,\r\n  );\r\n}",
  "hash": 1184520763376619,
  "table": t,
  "shake": [[305,[0]]],
  "tree": decompressAST([[1,0,46],[1,49,97],[1,51,96],[0,205,650],[1,0,7],[2,11,30],[2,20,31],[2,18,31],[2,23,34],[2,21,22],[2,4,15],[2,57,59],[2,5,14],[2,10,21],[2,21,23],[2,5,7],[2,30,41],[2,28,30],[2,3,4],[2,17,19],[2,3,4],[2,78,80],[2,68,81]], t.symbols),
};
const libs = {"../../../wgsl/use/types": m0, "../../../wgsl/geometry/quad": m1, "../../../wgsl/use/view": m2};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getFullScreenVertex = getSymbol("getFullScreenVertex");
/* __WGSL_LOADER_GENERATED */