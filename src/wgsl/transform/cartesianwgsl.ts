/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getTransformMatrix getCartesianPosition symbols visibles symbol flags name mat4x4<f32> type optional link attr u32 parameters func externals vec4<f32> export vector identifiers exports linkable".split(' '));
const t = {[_(2)]:_([0,1]),[_(3)]:_([1]),[_(15)]:[{"at":0,[_(4)]:_(0),[_(5)]:6,[_(14)]:{[_(6)]:_(0),[_(8)]:_(7),[_(11)]:_([9,10]),[_(13)]:[{[_(6)]:"i",[_(8)]:_(12)}]}}],[_(20)]:[{"at":69,[_(4)]:_(1),[_(5)]:1,[_(14)]:{[_(6)]:_(1),[_(8)]:_(16),[_(11)]:_([17]),[_(13)]:[{[_(6)]:_(18),[_(8)]:_(16)}],[_(19)]:_([0])}}],[_(21)]:{[_(0)]:true}};
const data = {
  "name": "transform/cartesian",
  "code": _(["@",9," @",10," fn ",0,"(i: u32) -> ",7," { };\r\n\r\n@",17," fn ",1,"(",18,": ",16,") -> ",16," {\r\n  return ",0,"(0) * ",16,"(",18,".xyz, 1.0);\r\n}"]).join(''),
  "hash": 74297510958794,
  "table": t,
  "shake": [[0,[0,1]],[69,[1]]],
  "tree": decompressAST([[4,0,64,0],[1,0,9],[1,10,15],[2,9,27],[0,50,180],[1,0,7],[2,11,31],[2,65,83]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getCartesianPosition = getSymbol("getCartesianPosition");
