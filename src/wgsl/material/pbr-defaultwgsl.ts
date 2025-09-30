/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/fragment/pbrwgsl";
const {} = symbolDictionary;
const _ = decompressString("roughness metalness getDefaultPBRMaterial symbols visibles ../../wgsl/fragment/pbr name PBRParams imported imports modules symbol flags type export attr color vec4<f32> mapUV mapST parameters identifiers func exports PBRParams".split(' '));
const t = {[_(3)]:_([0,1,2]),[_(4)]:_([2]),[_(10)]:[{"at":0,[_(6)]:_(5),[_(3)]:_([7]),[_(9)]:[{[_(6)]:_(7),[_(8)]:_(7)}]}],[_(23)]:[{"at":110,[_(11)]:_(2),[_(12)]:1,[_(22)]:{[_(6)]:_(2),[_(13)]:_(7),[_(15)]:_([14]),[_(20)]:[{[_(6)]:_(16),[_(13)]:_(17)},{[_(6)]:_(18),[_(13)]:_(17)},{[_(6)]:_(19),[_(13)]:_(17)}],[_(21)]:_([1,0])}}]};
const data = {
  "name": "material/pbr-default",
  "code": _(["use '",5,"'::{ ",7," };\r\n\r\nconst ",0,": f32 = 0.35;\r\nconst ",1,": f32 = 0.0;\r\n\r\n@",14," fn ",2,"(\r\n  ",16,": ",17,",\r\n  ",18,": ",17,",\r\n  ",19,": ",17,",\r\n) -> ",7," {\r\n  var albedo = ",16,";\r\n  var emissive = ",17,"(0.0);\r\n  var material = ",17,"(",1,", ",0,", 0.0, 0.0);\r\n\r\n  return ",7,"(albedo, emissive, material, 1.0);\r\n}"]).join(''),
  "hash": 8773920822672084,
  "table": t,
  "shake": [[45,[0,2]],[77,[1,2]],[110,[2]]],
  "tree": decompressAST([[1,0,44],[0,45,77],[2,10,19],[0,22,51],[2,8,17],[0,25,316],[1,0,7],[2,11,32],[2,92,101],[2,97,106],[2,11,20],[2,34,43]], t[S]),
};
const libs = {"../../wgsl/fragment/pbr": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getDefaultPBRMaterial = getSymbol("getDefaultPBRMaterial");
