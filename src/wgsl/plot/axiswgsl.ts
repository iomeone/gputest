/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getAxisStep getAxisOrigin getAxisPosition symbols visibles symbol flags name vec4<f32> type link attr func externals export index u32 parameters identifiers exports linkable".split(' '));
const t = {[_(3)]:_([0,1,2]),[_(4)]:_([2]),[_(13)]:[{"at":0,[_(5)]:_(0),[_(6)]:2,[_(12)]:{[_(7)]:_(0),[_(9)]:_(8),[_(11)]:_([10])}},{"at":38,[_(5)]:_(1),[_(6)]:2,[_(12)]:{[_(7)]:_(1),[_(9)]:_(8),[_(11)]:_([10])}}],[_(19)]:[{"at":80,[_(5)]:_(2),[_(6)]:1,[_(12)]:{[_(7)]:_(2),[_(9)]:_(8),[_(11)]:_([14]),[_(17)]:[{[_(7)]:_(15),[_(9)]:_(16)}],[_(18)]:_([0,1])}}],[_(20)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "plot/axis",
  "code": _(["@",10," fn ",0,"() -> ",8,";\r\n@",10," fn ",1,"() -> ",8,";\r\n\r\n@",14," fn ",2,"(",15,": u32) -> ",8," {\r\n  return ",0,"() * f32(",15,") + ",1,"();\r\n}"]).join(''),
  "hash": 2279363343267758,
  "table": t,
  "shake": [[0,[0,2]],[38,[1,2]],[80,[2]]],
  "tree": decompressAST([[1,0,35],[1,38,75],[0,42,154],[1,0,7],[2,11,26],[2,53,64],[2,29,42]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getAxisPosition = getSymbol("getAxisPosition");
