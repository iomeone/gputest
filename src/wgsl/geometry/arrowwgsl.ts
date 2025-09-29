import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../use/viewwgsl";
const t = {"symbols":["ARROW_ASPECT","sqr","getArrowSize","getArrowCorrection"],"visibles":["getArrowSize","getArrowCorrection"],"modules":[{"at":0,"name":"../../wgsl/use/view","symbols":["getWorldScale","getViewScale"],"imports":[{"name":"getWorldScale","imported":"getWorldScale"},{"name":"getViewScale","imported":"getViewScale"}]}],"exports":[{"at":141,"symbol":"getArrowSize","flags":1,"func":{"name":"getArrowSize","type":"f32","attr":["export"],"parameters":[{"name":"maxLength","type":"f32"},{"name":"width","type":"f32"},{"name":"size","type":"f32"},{"name":"both","type":"i32"},{"name":"w","type":"f32"},{"name":"depth","type":"f32"}],"identifiers":["ARROW_ASPECT","sqr"]}},{"at":668,"symbol":"getArrowCorrection","flags":1,"func":{"name":"getArrowCorrection","type":"f32","attr":["export"],"parameters":[{"name":"w1","type":"f32"},{"name":"w2","type":"f32"},{"name":"depth","type":"f32"}]}}]}; const data = {
  "name": "arrow",
  "code": "use '../../wgsl/use/view'::{ getWorldScale, getViewScale };\r\n\r\nconst ARROW_ASPECT: f32 = 2.5;\r\n\r\nfn sqr(f: f32) -> f32 { return f * f; };\r\n\r\n@export fn getArrowSize(maxLength: f32, width: f32, size: f32, both: i32, w: f32, depth: f32) -> f32 {\r\n  if (w <= 0.0) { return 0.0; }\r\n  \r\n  let worldScale = getWorldScale(w, depth) * getViewScale();\r\n\r\n  let targetSize = size * width * worldScale * 0.5;\r\n  var maxSize = maxLength / ARROW_ASPECT;\r\n  if (both > 0) { maxSize = maxSize * 0.5; }\r\n\r\n  let ratio = maxSize / targetSize;\r\n  var finalSize = targetSize;\r\n  if (ratio < 2.0) { finalSize = targetSize * (1.0 - sqr(1.0 - ratio * 0.5)); }\r\n\r\n  return finalSize;\r\n};\r\n\r\n@export fn getArrowCorrection(w1: f32, w2: f32, depth: f32) -> f32 {\r\n  return mix(w1 / w2, 1.0, depth);\r\n};\r\n\r\n",
  "hash": 1141686159914514,
  "table": t,
  "shake": [[59,[0,2]],[93,[1,2]],[141,[2]],[668,[3]]],
  "tree": decompressAST([[1,0,58],[0,59,93],[2,10,22],[0,24,67],[2,7,10],[2,4,5],[2,24,25],[2,4,5],[0,9,531],[1,0,7],[2,11,23],[2,13,22],[2,16,21],[2,12,16],[2,11,15],[2,11,12],[2,8,13],[2,28,29],[2,37,47],[2,13,26],[2,14,15],[2,3,8],[2,9,21],[2,25,35],[2,13,17],[2,7,12],[2,8,18],[2,25,32],[2,10,19],[2,12,24],[2,21,25],[2,12,19],[2,10,17],[2,26,31],[2,8,15],[2,10,20],[2,19,28],[2,12,22],[2,19,24],[2,15,24],[2,12,22],[2,20,23],[2,10,15],[2,29,38],[0,18,125],[1,0,7],[2,11,29],[2,19,21],[2,9,11],[2,9,14],[2,31,34],[2,4,6],[2,5,7],[2,9,14]], t.symbols),
};
const libs = {"../../wgsl/use/view": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getArrowSize = getSymbol("getArrowSize");
export const getArrowCorrection = getSymbol("getArrowCorrection");
/* __WGSL_LOADER_GENERATED */