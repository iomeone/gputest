/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getColor getColorMap getBasicMaterial symbols visibles symbol flags name vec4<f32> type optional link attr func vec2<f32> parameters externals export inColor mapUV mapST identifiers exports linkable return".split(' '));
const t = {[_(3)]:_([0,1,2]),[_(4)]:_([2]),[_(16)]:[{"at":0,[_(5)]:_(0),[_(6)]:6,[_(13)]:{[_(7)]:_(0),[_(9)]:_(8),[_(12)]:_([10,11])}},{"at":86,[_(5)]:_(1),[_(6)]:6,[_(13)]:{[_(7)]:_(1),[_(9)]:_(8),[_(12)]:_([10,11]),[_(15)]:[{[_(7)]:"uv",[_(9)]:_(14)}]}}],[_(22)]:[{"at":175,[_(5)]:_(2),[_(6)]:1,[_(13)]:{[_(7)]:_(2),[_(9)]:_(8),[_(12)]:_([17]),[_(15)]:[{[_(7)]:_(18),[_(9)]:_(8)},{[_(7)]:_(19),[_(9)]:_(8)},{[_(7)]:_(20),[_(9)]:_(8)}],[_(21)]:_([0,1])}}],[_(23)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "material/basic-material",
  "code": _(["@",10," @",11," fn ",0,"() -> ",8," { ",24," ",8,"(1.0, 1.0, 1.0, 1.0); }\r\n@",10," @",11," fn ",0,"Map(uv: ",14,") -> ",8," { ",24," ",8,"(0.0); }\r\n\r\n@",17," fn ",2,"(\r\n  ",18,": ",8,",\r\n  ",19,": ",8,",\r\n  ",20,": ",8,",\r\n) -> ",8," {\r\n  var color: ",8," = ",18," * ",0,"();\r\n\r\n  if (HAS_COLOR_MAP) {\r\n    color *= ",0,"Map(",19,".xy);\r\n  }\r\n\r\n  ",24," color;\r\n}"]).join(''),
  "hash": 8872626194726627,
  "table": t,
  "shake": [[0,[0,2]],[86,[1,2]],[175,[2]]],
  "tree": decompressAST([[4,0,84,0],[1,0,9],[1,10,15],[2,9,17],[4,67,152,1],[1,0,9],[1,10,15],[2,9,20],[0,70,319],[1,0,7],[2,11,27],[2,137,145],[2,52,63]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getBasicMaterial = getSymbol("getBasicMaterial");
