/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/typeswgsl";
const {} = symbolDictionary;
const _ = decompressString("getSurface getNormalMap getNormalMapSurface symbols visibles ../../../wgsl/use/types name SurfaceFragment imported imports modules symbol flags type link attr color vec4<f32> normal tangent position parameters func optional vec2<f32> externals export identifiers exports linkable SurfaceFragment normal tangent position tangentNormal".split(' '));
const t = {[_(3)]:_([0,1,2]),[_(4)]:_([2]),[_(10)]:[{"at":0,[_(6)]:_(5),[_(3)]:_([7]),[_(9)]:[{[_(6)]:_(7),[_(8)]:_(7)}]}],[_(25)]:[{"at":55,[_(11)]:_(0),[_(12)]:2,[_(22)]:{[_(6)]:_(0),[_(13)]:_(7),[_(15)]:_([14]),[_(21)]:[{[_(6)]:_(16),[_(13)]:_(17)},{[_(6)]:"uv",[_(13)]:_(17)},{[_(6)]:"st",[_(13)]:_(17)},{[_(6)]:_(18),[_(13)]:_(17)},{[_(6)]:_(19),[_(13)]:_(17)},{[_(6)]:_(20),[_(13)]:_(17)}]}},{"at":231,[_(11)]:_(1),[_(12)]:6,[_(22)]:{[_(6)]:_(1),[_(13)]:_(17),[_(15)]:_([23,14]),[_(21)]:[{[_(6)]:"uv",[_(13)]:_(24)}]}}],[_(28)]:[{"at":337,[_(11)]:_(2),[_(12)]:1,[_(22)]:{[_(6)]:_(2),[_(13)]:_(7),[_(15)]:_([26]),[_(21)]:[{[_(6)]:_(16),[_(13)]:_(17)},{[_(6)]:"uv",[_(13)]:_(17)},{[_(6)]:"st",[_(13)]:_(17)},{[_(6)]:_(18),[_(13)]:_(17)},{[_(6)]:_(19),[_(13)]:_(17)},{[_(6)]:_(20),[_(13)]:_(17)}],[_(27)]:_([1,0])}}],[_(29)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "surface/normal-map",
  "code": _(["use '",5,"'::{ ",7," };\r\n\r\n@",14," fn ",0,"(\r\n  ",16,": ",17,",\r\n  uv: ",17,",\r\n  st: ",17,",\r\n  ",18,": ",17,",\r\n  ",19,": ",17,",\r\n  ",20,": ",17,",\r\n) -> ",7," {};\r\n\r\n@",23," @",14," fn ",1,"(uv: ",24,") -> ",17," { return ",17,"(0.0, 0.0, 1.0, 0.0); };\r\n\r\n@",26," fn ",1,"Surface(\r\n  ",16,": ",17,",\r\n  uv: ",17,",\r\n  st: ",17,",\r\n  ",18,": ",17,",\r\n  ",19,": ",17,",\r\n  ",20,": ",17,",\r\n) -> ",7," {\r\n\r\n  let ",19,"Normal = ",1,"(uv.xy) * 2.0 - 1.0;\r\n\r\n  let bi",19," = cross(",18,".xyz, ",19,".xyz) * ",19,".w;\r\n  let bumpNormal = ",18,"ize(\r\n    ",19,"Normal.x * ",19,".xyz +\r\n    ",19,"Normal.y * bi",19," +\r\n    ",19,"Normal.z * ",18,".xyz\r\n  );\r\n\r\n  return ",0,"(",16,", uv, st, ",17,"(bumpNormal, 1.0), ",19,", ",20,");\r\n}"]).join(''),
  "hash": 6856610873114467,
  "table": t,
  "shake": [[55,[0,2]],[231,[1,2]],[337,[2]]],
  "tree": decompressAST([[1,0,50],[1,55,226],[4,176,277,1],[1,0,9],[1,10,15],[2,9,21],[0,87,623],[1,0,7],[2,11,30],[2,153,168],[2,43,55],[2,253,263]], t[S]),
};
const libs = {"../../../wgsl/use/types": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getNormalMapSurface = getSymbol("getNormalMapSurface");
