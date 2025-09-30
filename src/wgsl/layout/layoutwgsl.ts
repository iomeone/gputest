/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getFlip getOffset getLayoutPosition symbols visibles symbol flags name vec2<f32> type link attr func externals vec4<f32> export position parameters identifiers exports linkable position".split(' '));
const t = {[_(3)]:_([0,1,2]),[_(4)]:_([2]),[_(13)]:[{"at":0,[_(5)]:_(0),[_(6)]:2,[_(12)]:{[_(7)]:_(0),[_(9)]:_(8),[_(11)]:_([10])}},{"at":34,[_(5)]:_(1),[_(6)]:2,[_(12)]:{[_(7)]:_(1),[_(9)]:_(8),[_(11)]:_([10])}}],[_(19)]:[{"at":72,[_(5)]:_(2),[_(6)]:1,[_(12)]:{[_(7)]:_(2),[_(9)]:_(14),[_(11)]:_([15]),[_(17)]:[{[_(7)]:_(16),[_(9)]:_(14)}],[_(18)]:_([0,1])}}],[_(20)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "layout/layout",
  "code": _(["@",10," fn ",0,"() -> ",8,";\r\n@",10," fn ",1,"() -> ",8,";\r\n\r\n@",15," fn ",2,"(",16,": ",14,") -> ",14," {\r\n  let flip = ",0,"();\r\n  let offset = ",1,"();\r\n\r\n  var xy = select(",16,".xy, flip - ",16,".xy, flip > ",8,"(0.0));\r\n  return ",14,"(xy + offset, ",16,".zw);\r\n}"]).join(''),
  "hash": 7025739358963001,
  "table": t,
  "shake": [[0,[0,2]],[34,[1,2]],[72,[2]]],
  "tree": decompressAST([[1,0,31],[1,34,67],[0,38,284],[1,0,7],[2,11,28],[2,68,75],[2,27,36]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getLayoutPosition = getSymbol("getLayoutPosition");
