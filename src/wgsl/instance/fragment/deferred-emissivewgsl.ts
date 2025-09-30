/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/viewwgsl";
import m1 from "../../../wgsl/use/typeswgsl";
import m2 from "../../../wgsl/codec/octahedralwgsl";
const {} = symbolDictionary;
const _ = decompressString("getAlbedo getNormal getMaterial getEmissive getDepth getDeferredEmissiveFragment symbols visibles ../../../wgsl/use/view name getViewPosition clipToWorld to3D imported imports ../../../wgsl/use/types Light SurfaceFragment ../../../wgsl/codec/octahedral decodeOctahedral modules symbol flags vec4<f32> type link attr vec2<f32> parameters func f32 externals export index u32 identifiers exports linkable".split(' '));
const t = {[_(6)]:_([0,1,2,3,4,5]),[_(7)]:_([5]),[_(20)]:[{"at":0,[_(9)]:_(8),[_(6)]:_([10,11,12]),[_(14)]:[{[_(9)]:_(10),[_(13)]:_(10)},{[_(9)]:_(11),[_(13)]:_(11)},{[_(9)]:_(12),[_(13)]:_(12)}]},{"at":0,[_(9)]:_(15),[_(6)]:_([16,17]),[_(14)]:[{[_(9)]:_(16),[_(13)]:_(16)},{[_(9)]:_(17),[_(13)]:_(17)}]},{"at":0,[_(9)]:_(18),[_(6)]:_([19]),[_(14)]:[{[_(9)]:_(19),[_(13)]:_(19)}]}],[_(31)]:[{"at":194,[_(21)]:_(0),[_(22)]:2,[_(29)]:{[_(9)]:_(0),[_(24)]:_(23),[_(26)]:_([25]),[_(28)]:[{[_(9)]:"uv",[_(24)]:_(27)}]}},{"at":243,[_(21)]:_(1),[_(22)]:2,[_(29)]:{[_(9)]:_(1),[_(24)]:_(23),[_(26)]:_([25]),[_(28)]:[{[_(9)]:"uv",[_(24)]:_(27)}]}},{"at":292,[_(21)]:_(2),[_(22)]:2,[_(29)]:{[_(9)]:_(2),[_(24)]:_(23),[_(26)]:_([25]),[_(28)]:[{[_(9)]:"uv",[_(24)]:_(27)}]}},{"at":343,[_(21)]:_(3),[_(22)]:2,[_(29)]:{[_(9)]:_(3),[_(24)]:_(23),[_(26)]:_([25]),[_(28)]:[{[_(9)]:"uv",[_(24)]:_(27)}]}},{"at":394,[_(21)]:_(4),[_(22)]:2,[_(29)]:{[_(9)]:_(4),[_(24)]:_(30),[_(26)]:_([25]),[_(28)]:[{[_(9)]:"uv",[_(24)]:_(27)}]}}],[_(36)]:[{"at":438,[_(21)]:_(5),[_(22)]:1,[_(29)]:{[_(9)]:_(5),[_(24)]:_(23),[_(26)]:_([32]),[_(28)]:[{[_(9)]:"uv",[_(24)]:_(27)},{[_(9)]:_(33),[_(24)]:_(34)}],[_(35)]:_([3])}}],[_(37)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true,[_(4)]:true}};
const data = {
  "name": "fragment/deferred-emissive",
  "code": _(["use '",8,"'::{ ",10,", ",11,", ",12," };\r\nuse '",15,"'::{ ",16,", ",17," };\r\nuse '",18,"'::{ ",19," };\r\n\r\n@",25," fn ",0,"(uv: ",27,") -> ",23,";\r\n@",25," fn ",1,"(uv: ",27,") -> ",23,";\r\n@",25," fn ",2,"(uv: ",27,") -> ",23,";\r\n@",25," fn ",3,"(uv: ",27,") -> ",23,";\r\n@",25," fn ",4,"(uv: ",27,") -> f32;\r\n\r\n@",32," fn ",5,"(\r\n  uv: ",27,",\r\n  ",33,": u32,\r\n) -> ",23," {\r\n  return ",3,"(uv);\r\n}"]).join(''),
  "hash": 7300976354066719,
  "table": t,
  "shake": [[194,[0]],[243,[1]],[292,[2]],[343,[3,5]],[394,[4]],[438,[5]]],
  "tree": decompressAST([[1,0,68],[1,71,128],[1,60,118],[1,63,109],[1,49,95],[1,49,97],[1,51,99],[1,51,90],[0,44,164],[1,0,7],[2,11,38],[2,90,101]], t[S]),
};
const libs = {"../../../wgsl/use/view": m0, "../../../wgsl/use/types": m1, "../../../wgsl/codec/octahedral": m2};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getDeferredEmissiveFragment = getSymbol("getDeferredEmissiveFragment");
