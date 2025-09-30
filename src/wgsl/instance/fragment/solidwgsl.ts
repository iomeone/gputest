/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/viewwgsl";
import m1 from "../../../wgsl/use/typeswgsl";
const {} = symbolDictionary;
const _ = decompressString("getSolidFragment symbols visibles ../../../wgsl/use/view name getViewPosition imported imports ../../../wgsl/use/types SurfaceFragment modules symbol flags vec4<f32> type export attr surface parameters func exports surface".split(' '));
const t = {[_(1)]:_([0]),[_(2)]:_([0]),[_(10)]:[{"at":0,[_(4)]:_(3),[_(1)]:_([5]),[_(7)]:[{[_(4)]:_(5),[_(6)]:_(5)}]},{"at":0,[_(4)]:_(8),[_(1)]:_([9]),[_(7)]:[{[_(4)]:_(9),[_(6)]:_(9)}]}],[_(20)]:[{"at":107,[_(11)]:_(0),[_(12)]:1,[_(19)]:{[_(4)]:_(0),[_(14)]:_(13),[_(16)]:_([15]),[_(18)]:[{[_(4)]:_(17),[_(14)]:_(9)}]}}]};
const data = {
  "name": "fragment/solid",
  "code": _(["use '",3,"'::{ ",5," };\r\nuse '",8,"'::{ ",9," };\r\n\r\n@",15," fn ",0,"(\r\n  ",17,": ",9,",\r\n) -> ",13," {\r\n  let rgb = ",17,".albedo.rgb + ",17,".emissive.rgb;\r\n  let a = ",17,".albedo.a;\r\n  if (HAS_ALPHA_TO_COVERAGE) {\r\n    return ",13,"(rgb, a);\r\n  }\r\n  else {\r\n    return ",13,"(rgb * a, a);\r\n  }\r\n}"]).join(''),
  "hash": 1632078533838078,
  "table": t,
  "shake": [[107,[0]]],
  "tree": decompressAST([[1,0,49],[1,52,102],[0,55,336],[1,0,7],[2,11,27],[2,30,45]], t[S]),
};
const libs = {"../../../wgsl/use/view": m0, "../../../wgsl/use/types": m1};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getSolidFragment = getSymbol("getSolidFragment");
