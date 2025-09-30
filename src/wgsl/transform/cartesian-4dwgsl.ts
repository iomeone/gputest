/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getTransformMatrix getTransformBase getCartesian4DPosition symbols visibles symbol flags name mat4x4<f32> type optional link attr u32 parameters func vec4<f32> externals export vector identifiers exports linkable".split(' '));
const t = {[_(3)]:_([0,1,2]),[_(4)]:_([2]),[_(17)]:[{"at":0,[_(5)]:_(0),[_(6)]:6,[_(15)]:{[_(7)]:_(0),[_(9)]:_(8),[_(12)]:_([10,11]),[_(14)]:[{[_(7)]:"i",[_(9)]:_(13)}]}},{"at":67,[_(5)]:_(1),[_(6)]:6,[_(15)]:{[_(7)]:_(1),[_(9)]:_(16),[_(12)]:_([10,11]),[_(14)]:[{[_(7)]:"i",[_(9)]:_(13)}]}}],[_(21)]:[{"at":132,[_(5)]:_(2),[_(6)]:1,[_(15)]:{[_(7)]:_(2),[_(9)]:_(16),[_(12)]:_([18]),[_(14)]:[{[_(7)]:_(19),[_(9)]:_(16)}],[_(20)]:_([0,1])}}],[_(22)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "transform/cartesian-4d",
  "code": _(["@",10," @",11," fn ",0,"(i: u32) -> ",8," { };\r\n@",10," @",11," fn ",1,"(i: u32) -> ",16," { };\r\n\r\n@",18," fn ",2,"(",19,": ",16,") -> ",16," {\r\n  return ",0,"(0) * ",19," + ",1,"(0);\r\n}"]).join(''),
  "hash": 1981664280106972,
  "table": t,
  "shake": [[0,[0,2]],[67,[1,2]],[132,[2]]],
  "tree": decompressAST([[4,0,64,0],[1,0,9],[1,10,15],[2,9,27],[4,48,108,1],[1,0,9],[1,10,15],[2,9,25],[0,46,180],[1,0,7],[2,11,33],[2,67,85],[2,33,49]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getCartesian4DPosition = getSymbol("getCartesian4DPosition");
