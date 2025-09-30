/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/typeswgsl";
const {} = symbolDictionary;
const _ = decompressString("getMaterial getSolidSurface symbols visibles ../../../wgsl/use/types name SurfaceFragment imported imports modules symbol flags vec4<f32> type link attr color mapUV mapST parameters func externals export normal tangent position identifiers exports linkable SurfaceFragment albedo".split(' '));
const t = {[_(2)]:_([0,1]),[_(3)]:_([1]),[_(9)]:[{"at":0,[_(5)]:_(4),[_(2)]:_([6]),[_(8)]:[{[_(5)]:_(6),[_(7)]:_(6)}]}],[_(21)]:[{"at":55,[_(10)]:_(0),[_(11)]:2,[_(20)]:{[_(5)]:_(0),[_(13)]:_(12),[_(15)]:_([14]),[_(19)]:[{[_(5)]:_(16),[_(13)]:_(12)},{[_(5)]:_(17),[_(13)]:_(12)},{[_(5)]:_(18),[_(13)]:_(12)}]}}],[_(27)]:[{"at":162,[_(10)]:_(1),[_(11)]:1,[_(20)]:{[_(5)]:_(1),[_(13)]:_(6),[_(15)]:_([22]),[_(19)]:[{[_(5)]:_(16),[_(13)]:_(12)},{[_(5)]:"uv",[_(13)]:_(12)},{[_(5)]:"st",[_(13)]:_(12)},{[_(5)]:_(23),[_(13)]:_(12)},{[_(5)]:_(24),[_(13)]:_(12)},{[_(5)]:_(25),[_(13)]:_(12)}],[_(26)]:_([0])}}],[_(28)]:{[_(0)]:true}};
const data = {
  "name": "surface/solid",
  "code": _(["use '",4,"'::{ ",6," };\r\n\r\n@",14," fn ",0,"(\r\n  ",16,": ",12,",\r\n  ",17,": ",12,",\r\n  ",18,": ",12,",\r\n) -> ",12," {}\r\n\r\n@",22," fn ",1,"(\r\n  ",16,": ",12,",\r\n  uv: ",12,",\r\n  st: ",12,",\r\n  ",23,": ",12,",\r\n  ",24,": ",12,",\r\n  ",25,": ",12,",\r\n) -> ",6," {\r\n\r\n  let ",30," = ",0,"(",16,", uv, st);\r\n\r\n  return ",6,"(\r\n    ",25,",\r\n    ",23,",\r\n    ",12,"(0.0, 0.0, 0.0, ",30,".a),\r\n    ",12,"(",30,".rgb, 0.0),\r\n    ",12,"(0.0, 0.0, 0.0, 1.0),\r\n    1.0,\r\n    0.0,\r\n  );\r\n}"]).join(''),
  "hash": 7562160966718872,
  "table": t,
  "shake": [[55,[0,1]],[162,[1]]],
  "tree": decompressAST([[1,0,50],[1,55,158],[0,107,526],[1,0,7],[2,11,26],[2,149,164],[2,36,47],[2,40,55]], t[S]),
};
const libs = {"../../../wgsl/use/types": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getSolidSurface = getSymbol("getSolidSurface");
