/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/fragment/pbrwgsl";
import m1 from "../../wgsl/use/typeswgsl";
const {} = symbolDictionary;
const _ = decompressString("applyPBRMaterial symbols visibles ../../wgsl/fragment/pbr name PBR imported imports ../../wgsl/use/types SurfaceFragment modules symbol flags vec3<f32> type export attr surface parameters func exports surface".split(' '));
const t = {[_(1)]:_([0]),[_(2)]:_([0]),[_(10)]:[{"at":0,[_(4)]:_(3),[_(1)]:_([5]),[_(7)]:[{[_(4)]:_(5),[_(6)]:_(5)}]},{"at":0,[_(4)]:_(8),[_(1)]:_([9]),[_(7)]:[{[_(4)]:_(9),[_(6)]:_(9)}]}],[_(20)]:[{"at":93,[_(11)]:_(0),[_(12)]:1,[_(19)]:{[_(4)]:_(0),[_(14)]:_(13),[_(16)]:_([15]),[_(18)]:[{[_(4)]:"N",[_(14)]:_(13)},{[_(4)]:"L",[_(14)]:_(13)},{[_(4)]:"V",[_(14)]:_(13)},{[_(4)]:_(17),[_(14)]:_(9)}]}}]};
const data = {
  "name": "material/pbr-apply",
  "code": _(["use '",3,"'::{ PBR };\r\nuse '",8,"'::{ ",9," };\r\n\r\n@",15," fn ",0,"(\r\n  N: ",13,",\r\n  L: ",13,",\r\n  V: ",13,",\r\n  ",17,": ",9,",\r\n) -> ",13," {\r\n  return PBR(N, L, V, ",17,".albedo.xyz, ",17,".material.x, ",17,".material.y);\r\n}"]).join(''),
  "hash": 8079585797273672,
  "table": t,
  "shake": [[93,[0]]],
  "tree": decompressAST([[1,0,38],[1,41,88],[0,52,265],[1,0,7],[2,11,27],[2,81,96],[2,45,48]], t[S]),
};
const libs = {"../../wgsl/fragment/pbr": m0, "../../wgsl/use/types": m1};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const applyPBRMaterial = getSymbol("applyPBRMaterial");
