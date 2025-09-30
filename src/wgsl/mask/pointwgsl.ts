/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getSDF getOutline getUVScale scaleSDF outlineSDF getFilledMask getOutlinedMask symbols visibles symbol flags name f32 type link attr vec2<f32> parameters func optional externals export identifiers exports linkable getSDF return getUVScale scaleSDF outline".split(' '));
const t = {[_(7)]:_([0,1,2,3,4,5,6]),[_(8)]:_([5,6]),[_(20)]:[{"at":0,[_(9)]:_(0),[_(10)]:2,[_(18)]:{[_(11)]:_(0),[_(13)]:_(12),[_(15)]:_([14]),[_(17)]:[{[_(11)]:"uv",[_(13)]:_(16)}]}},{"at":40,[_(9)]:_(1),[_(10)]:6,[_(18)]:{[_(11)]:_(1),[_(13)]:_(12),[_(15)]:_([19,14])}}],[_(23)]:[{"at":579,[_(9)]:_(5),[_(10)]:1,[_(18)]:{[_(11)]:_(5),[_(13)]:_(12),[_(15)]:_([21]),[_(17)]:[{[_(11)]:"uv",[_(13)]:_(16)}],[_(22)]:_([0,2,3])}},{"at":710,[_(9)]:_(6),[_(10)]:1,[_(18)]:{[_(11)]:_(6),[_(13)]:_(12),[_(15)]:_([21]),[_(17)]:[{[_(11)]:"uv",[_(13)]:_(16)}],[_(22)]:_([2,4,0,3])}}],[_(24)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "mask/point",
  "code": _(["@",14," fn ",0,"(uv: ",16,") -> f32;\r\n@",19," @",14," fn ",1,"() -> f32 { ",26," 0.0; }\r\n\r\nfn ",2,"(uv: ",16,") -> f32 {\r\n  let dx = dpdx(uv);\r\n  let dy = dpdy(uv);\r\n  // implicit * 2 / 2\r\n  ",26," (length(dx) + length(dy));\r\n}\r\n\r\nfn ",3,"(sdf: f32, scale: f32) -> f32 {\r\n  let d = sdf / scale + 0.5;\r\n  ",26," clamp(d, 0.0, 1.0) * max(0.0, min(1.0, 2.0 / scale) * 2.0 - 1.0);\r\n}\r\n\r\nfn ",4,"(sdf: f32, scale: f32) -> f32 {\r\n  let ",29," = ",1,"();\r\n  if (",29," > 0) { ",26," min(sdf, -sdf + ",29," * scale); }\r\n  ",26," min(sdf, 0.4 - sdf);\r\n}\r\n\r\n@",21," fn ",5,"(uv: ",16,") -> f32 {\r\n  let l = ",0,"(uv);\r\n  let s = ",2,"(uv);\r\n  ",26," ",3,"(l, s);\r\n}\r\n\r\n@",21," fn ",1,"dMask(uv: ",16,") -> f32 {\r\n  let s = ",2,"(uv);\r\n  let l = ",4,"(",0,"(uv), s);\r\n  ",26," ",3,"(l, s);\r\n}"]).join(''),
  "hash": 7245891633595819,
  "table": t,
  "shake": [[0,[0,5,6]],[40,[1,4,6]],[94,[2,5,6]],[242,[3,5,6]],[397,[4,6]],[579,[5]],[710,[6]]],
  "tree": decompressAST([[1,0,37],[4,40,94,1],[1,0,9],[1,10,15],[2,9,19],[0,35,183],[2,7,17],[0,141,296],[2,7,15],[0,148,326],[2,7,17],[2,59,69],[0,116,243],[1,0,7],[2,11,24],[2,49,55],[2,23,33],[2,26,34],[0,22,166],[1,0,7],[2,11,26],[2,51,61],[2,27,37],[2,11,17],[2,26,34]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getFilledMask = getSymbol("getFilledMask");
export const getOutlinedMask = getSymbol("getOutlinedMask");
