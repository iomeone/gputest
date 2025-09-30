/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("applyTransform transformRectangle symbols visibles symbol flags name vec4<f32> type optional link attr parameters func externals export rect identifiers exports linkable applyTransform".split(' '));
const t = {[_(2)]:_([0,1]),[_(3)]:_([1]),[_(14)]:[{"at":0,[_(4)]:_(0),[_(5)]:6,[_(13)]:{[_(6)]:_(0),[_(8)]:_(7),[_(11)]:_([9,10]),[_(12)]:[{[_(6)]:"p",[_(8)]:_(7)}]}}],[_(18)]:[{"at":78,[_(4)]:_(1),[_(5)]:1,[_(13)]:{[_(6)]:_(1),[_(8)]:_(7),[_(11)]:_([15]),[_(12)]:[{[_(6)]:_(16),[_(8)]:_(7)}],[_(17)]:_([0])}}],[_(19)]:{[_(0)]:true}};
const data = {
  "name": "layout/rectangle",
  "code": _(["@",9," @",10," fn ",0,"(p: ",7,") -> ",7," { return p; }\r\n\r\n@",15," fn ",1,"(",16,": ",7,") -> ",7," {\r\n  let ul = ",0,"(",7,"(",16,".xy, 0.5, 1.0));\r\n  let br = ",0,"(",7,"(",16,".zw, 0.5, 1.0));\r\n\r\n  return ",7,"(ul.xy, br.xy);\r\n}"]).join(''),
  "hash": 7259815327889042,
  "table": t,
  "shake": [[0,[0,1]],[78,[1]]],
  "tree": decompressAST([[4,0,74,0],[1,0,9],[1,10,15],[2,9,23],[0,59,276],[1,0,7],[2,11,29],[2,63,77],[2,58,72]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const transformRectangle = getSymbol("transformRectangle");
