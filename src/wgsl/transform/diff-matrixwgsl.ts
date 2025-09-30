/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getTransformMatrix getNormalMatrix getMatrixDifferential symbols visibles symbol flags name mat4x4<f32> type link attr u32 parameters func mat3x3<f32> externals vec4<f32> export vector origin contravariant bool identifiers exports linkable vector".split(' '));
const t = {[_(3)]:_([0,1,2]),[_(4)]:_([2]),[_(16)]:[{"at":0,[_(5)]:_(0),[_(6)]:2,[_(14)]:{[_(7)]:_(0),[_(9)]:_(8),[_(11)]:_([10]),[_(13)]:[{[_(7)]:"i",[_(9)]:_(12)}]}},{"at":53,[_(5)]:_(1),[_(6)]:2,[_(14)]:{[_(7)]:_(1),[_(9)]:_(15),[_(11)]:_([10]),[_(13)]:[{[_(7)]:"i",[_(9)]:_(12)}]}}],[_(24)]:[{"at":105,[_(5)]:_(2),[_(6)]:1,[_(14)]:{[_(7)]:_(2),[_(9)]:_(17),[_(11)]:_([18]),[_(13)]:[{[_(7)]:_(19),[_(9)]:_(17)},{[_(7)]:_(20),[_(9)]:_(17)},{[_(7)]:_(21),[_(9)]:_(22)}],[_(23)]:_([1,0])}}],[_(25)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "transform/diff-matrix",
  "code": _(["@",10," fn ",0,"(i: u32) -> ",8,";\r\n@",10," fn ",1,"(i: u32) -> ",15,";\r\n\r\n@",18," fn ",2,"(",19,": ",17,", ",20,": ",17,", ",21,": ",22,") -> ",17," {\r\n  if (",21,") { return ",17,"(",1,"(0u) * ",19,".xyz, ",19,".w); }\r\n  let v4 = ",0,"(0u) * ",17,"(",19,".xyz, 0.0);\r\n  return ",17,"(v4.xyz, ",19,".w);\r\n}"]).join(''),
  "hash": 7266298621872040,
  "table": t,
  "shake": [[0,[0,2]],[53,[1,2]],[105,[2]]],
  "tree": decompressAST([[1,0,50],[1,53,100],[0,52,353],[1,0,7],[2,11,32],[2,137,152],[2,59,77]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getMatrixDifferential = getSymbol("getMatrixDifferential");
