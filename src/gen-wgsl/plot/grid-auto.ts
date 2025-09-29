import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../gen-wgsl/use/view";
const t = {"symbols":["transformPosition","getGridAutoBase","getGridAutoShift","getGridAutoPosition"],"visibles":["getGridAutoPosition"],"modules":[{"at":0,"name":"../../wgsl/use/view","symbols":["getViewPosition"],"imports":[{"name":"getViewPosition","imported":"getViewPosition"}]}],"externals":[{"at":51,"symbol":"transformPosition","flags":2,"func":{"name":"transformPosition","type":"vec4<f32>","attr":["link"],"parameters":[{"name":"p","type":"vec4<f32>"}]}},{"at":112,"symbol":"getGridAutoBase","flags":2,"func":{"name":"getGridAutoBase","type":"vec4<f32>","attr":["link"]}},{"at":154,"symbol":"getGridAutoShift","flags":2,"func":{"name":"getGridAutoShift","type":"vec4<f32>","attr":["link"]}}],"exports":[{"at":199,"symbol":"getGridAutoPosition","flags":1,"func":{"name":"getGridAutoPosition","type":"vec4<f32>","attr":["export"],"identifiers":["getGridAutoBase","getGridAutoShift","transformPosition"]}}],"linkable":{"transformPosition":true,"getGridAutoBase":true,"getGridAutoShift":true}}; const data = {
  "name": "grid-auto",
  "code": "use '../../wgsl/use/view'::{ getViewPosition };\r\n\r\n@link fn transformPosition(p: vec4<f32>) -> vec4<f32> {};\r\n\r\n@link fn getGridAutoBase() -> vec4<f32>;\r\n@link fn getGridAutoShift() -> vec4<f32>;\r\n\r\n@export fn getGridAutoPosition() -> vec4<f32> {\r\n  let base = getGridAutoBase();\r\n  let shift = getGridAutoShift();\r\n  \r\n  var a = base;\r\n  var b = base + shift;\r\n  a = transformPosition(a);\r\n  b = transformPosition(b);\r\n\r\n  let v = getViewPosition();\r\n\r\n  if (length(v.xyz - a.xyz) < length(v.xyz - b.xyz)) { return shift; }\r\n  return vec4<f32>(0.0);\r\n}\r\n",
  "hash": 7306080714527001,
  "table": t,
  "shake": [[51,[0,3]],[112,[1,3]],[154,[2,3]],[199,[3]]],
  "tree": decompressAST([[1,0,46],[1,51,107],[1,61,100],[1,42,82],[0,45,399],[1,0,7],[2,11,30],[2,44,48],[2,7,22],[2,26,31],[2,8,24],[2,31,32],[2,4,8],[2,13,14],[2,4,8],[2,7,12],[2,10,11],[2,4,21],[2,18,19],[2,7,8],[2,4,21],[2,18,19],[2,13,14],[2,4,19],[2,28,34],[2,7,8],[2,2,5],[2,6,7],[2,2,5],[2,7,13],[2,7,8],[2,2,5],[2,6,7],[2,2,5],[2,15,20]], t.symbols),
};
const libs = {"../../wgsl/use/view": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getGridAutoPosition = getSymbol("getGridAutoPosition");
/* __WGSL_LOADER_GENERATED */