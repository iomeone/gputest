/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/typeswgsl";
const {} = symbolDictionary;
const _ = decompressString("getMaterial getMaterialSurface symbols visibles ../../../wgsl/use/types name SurfaceFragment imported imports modules symbol flags infer(T) attr type link color vec4<f32> mapUV mapST parameters identifiers inferred func externals export normal tangent position exports linkable SurfaceFragment params".split(' '));
const t = {[_(2)]:_(["T",0,1]),[_(3)]:_([1]),[_(9)]:[{"at":0,[_(5)]:_(4),[_(2)]:_([6]),[_(8)]:[{[_(5)]:_(6),[_(7)]:_(6)}]}],[_(24)]:[{"at":75,[_(10)]:_(0),[_(11)]:2,[_(23)]:{[_(5)]:_(0),[_(14)]:{[_(5)]:"T",[_(13)]:_([12])},[_(13)]:_([15]),[_(20)]:[{[_(5)]:_(16),[_(14)]:_(17)},{[_(5)]:_(18),[_(14)]:_(17)},{[_(5)]:_(19),[_(14)]:_(17)}],[_(21)]:_(["T"]),[_(22)]:[{[_(5)]:"T","at":-1}]}}],[_(29)]:[{"at":184,[_(10)]:_(1),[_(11)]:1,[_(23)]:{[_(5)]:_(1),[_(14)]:_(6),[_(13)]:_([25]),[_(20)]:[{[_(5)]:_(16),[_(14)]:_(17)},{[_(5)]:"uv",[_(14)]:_(17)},{[_(5)]:"st",[_(14)]:_(17)},{[_(5)]:_(26),[_(14)]:_(17)},{[_(5)]:_(27),[_(14)]:_(17)},{[_(5)]:_(28),[_(14)]:_(17)}],[_(21)]:_([0])}}],[_(30)]:{[_(0)]:true}};
const data = {
  "name": "surface/material",
  "code": _(["use '",4,"'::{ ",6," };\r\n\r\n@infer ",14," T = T;\r\n@",15," fn ",0,"(\r\n  ",16,": ",17,",\r\n  ",18,": ",17,",\r\n  ",19,": ",17,",\r\n) -> @",12," T {}\r\n\r\n@",25," fn ",0,"Surface(\r\n  ",16,": ",17,",\r\n  uv: ",17,",\r\n  st: ",17,",\r\n  ",26,": ",17,",\r\n  ",27,": ",17,",\r\n  ",28,": ",17,",\r\n) -> ",6," {\r\n\r\n  let ",32," = ",0,"(",16,", uv, st);\r\n\r\n  return ",6,"(\r\n    ",28,",\r\n    ",26,",\r\n    ",32,".albedo,\r\n    ",32,".emissive,\r\n    ",32,".material,\r\n    ",32,".occlusion,\r\n    0.0,\r\n  );\r\n}"]).join(''),
  "hash": 1821032020412485,
  "table": t,
  "shake": [[55,[0,1,2]],[75,[1,2]],[184,[2]]],
  "tree": decompressAST([[1,0,50],[1,55,73],[1,20,125],[0,109,498],[1,0,7],[2,11,29],[2,152,167],[2,36,47],[2,40,55]], t[S]),
};
const libs = {"../../../wgsl/use/types": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getMaterialSurface = getSymbol("getMaterialSurface");
