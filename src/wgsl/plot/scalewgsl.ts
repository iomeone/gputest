/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getScaleValue getScaleDirection getScaleOrigin STEP getScalePosition symbols visibles symbol flags name f32 type link attr u32 parameters func i32 vec4<f32> externals export index identifiers exports linkable".split(' '));
const t = {[_(5)]:_([0,1,2,3,4]),[_(6)]:_([4]),[_(19)]:[{"at":0,[_(7)]:_(0),[_(8)]:2,[_(16)]:{[_(9)]:_(0),[_(11)]:_(10),[_(13)]:_([12]),[_(15)]:[{[_(9)]:"i",[_(11)]:_(14)}]}},{"at":40,[_(7)]:_(1),[_(8)]:2,[_(16)]:{[_(9)]:_(1),[_(11)]:_(17),[_(13)]:_([12])}},{"at":78,[_(7)]:_(2),[_(8)]:2,[_(16)]:{[_(9)]:_(2),[_(11)]:_(18),[_(13)]:_([12])}}],[_(23)]:[{"at":158,[_(7)]:_(4),[_(8)]:1,[_(16)]:{[_(9)]:_(4),[_(11)]:_(18),[_(13)]:_([20]),[_(15)]:[{[_(9)]:_(21),[_(11)]:_(14)}],[_(22)]:_([1,3,2,0])}}],[_(24)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  "name": "plot/scale",
  "code": _(["@",12," fn ",0,"(i: u32) -> f32;\r\n@",12," fn ",1,"() -> i32;\r\n@",12," fn ",2,"() -> ",18,";\r\n\r\nconst ",3," = vec2<f32>(0.0, 1.0);\r\n\r\n@",20," fn ",4,"(",21,": u32) -> ",18," {\r\n\r\n  let dir = ",1,"();\r\n\r\n  var step: ",18,";\r\n  if (dir == 0) { step = ",3,".yxxx; }\r\n  if (dir == 1) { step = ",3,".xyxx; }\r\n  if (dir == 2) { step = ",3,".xxyx; }\r\n  if (dir == 3) { step = ",3,".xxxy; }\r\n\r\n  return ",2,"() + step * ",0,"(",21,");\r\n}"]).join(''),
  "hash": 4684212868079174,
  "table": t,
  "shake": [[0,[0,4]],[40,[1,4]],[78,[2,4]],[117,[3,4]],[158,[4]]],
  "tree": decompressAST([[1,0,37],[1,40,75],[1,38,76],[0,39,76],[2,10,14],[0,31,366],[1,0,7],[2,11,27],[2,59,76],[2,73,77],[2,39,43],[2,39,43],[2,39,43],[2,25,39],[2,26,39]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getScalePosition = getSymbol("getScalePosition");
