/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/fragment/sdf-2dwgsl";
import m1 from "../../wgsl/use/colorwgsl";
const {} = symbolDictionary;
const _ = decompressString("getTexture getMask getScreenFragment symbols visibles ../../wgsl/fragment/sdf-2d name SDF getUVScale getBoxSDF getBorderBoxSDF getRoundedBorderBoxSDF imported imports ../../wgsl/use/color premultiply modules symbol flags vec4<f32> type optional link attr vec2<f32> parameters func color externals export fill identifiers exports linkable return texture".split(' '));
const t = {[_(3)]:_([0,1,2]),[_(4)]:_([2]),[_(16)]:[{"at":0,[_(6)]:_(5),[_(3)]:_([7,8,9,10,11]),[_(13)]:[{[_(6)]:_(7),[_(12)]:_(7)},{[_(6)]:_(8),[_(12)]:_(8)},{[_(6)]:_(9),[_(12)]:_(9)},{[_(6)]:_(10),[_(12)]:_(10)},{[_(6)]:_(11),[_(12)]:_(11)}]},{"at":0,[_(6)]:_(14),[_(3)]:_([15]),[_(13)]:[{[_(6)]:_(15),[_(12)]:_(15)}]}],[_(28)]:[{"at":156,[_(17)]:_(0),[_(18)]:6,[_(26)]:{[_(6)]:_(0),[_(20)]:_(19),[_(23)]:_([21,22]),[_(25)]:[{[_(6)]:"uv",[_(20)]:_(24)}]}},{"at":258,[_(17)]:_(1),[_(18)]:6,[_(26)]:{[_(6)]:_(1),[_(20)]:_(19),[_(23)]:_([21,22]),[_(25)]:[{[_(6)]:_(27),[_(20)]:_(19)},{[_(6)]:"uv",[_(20)]:_(19)},{[_(6)]:"st",[_(20)]:_(19)}]}}],[_(32)]:[{"at":367,[_(17)]:_(2),[_(18)]:1,[_(26)]:{[_(6)]:_(2),[_(20)]:_(19),[_(23)]:_([29]),[_(25)]:[{[_(6)]:_(30),[_(20)]:_(19)},{[_(6)]:"uv",[_(20)]:_(19)},{[_(6)]:"st",[_(20)]:_(19)}],[_(31)]:_([0,1])}}],[_(33)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "present/fragment",
  "code": _(["use '",5,"'::{ SDF, ",8,", ",9,", ",10,", ",11," };\r\nuse '",14,"'::{ ",15," };\r\n\r\n@",21," @",22," fn ",0,"(uv: ",24,") -> ",19," { ",34," ",19,"(0.0, 0.0, 0.0, 0.0); };\r\n@",21," @",22," fn ",1,"(",27,": ",19,", uv: ",19,", st: ",19,") -> ",19," { ",34," ",27,"; }\r\n\r\n@",29," fn ",2,"(\r\n  ",30,": ",19,",\r\n  uv: ",19,",\r\n  st: ",19,",\r\n) -> ",19," {\r\n  var ",35," = ",0,"(uv.xy);\r\n\r\n  var ",27," = ",19,"(\r\n    ",15,"(",30,").rgb * (1.0 - ",35,".a) + ",35,".rgb,\r\n    mix(",30,".a, 1.0, ",35,".a),\r\n  );\r\n\r\n  if (HAS_MASK) {\r\n    ",27," = ",1,"(",27,", uv, st);\r\n  }\r\n\r\n  ",34," ",27,";\r\n}"]).join(''),
  "hash": 3958507134765408,
  "table": t,
  "shake": [[156,[0,2]],[258,[1,2]],[367,[2]]],
  "tree": decompressAST([[1,0,105],[1,108,151],[4,48,147,0],[1,0,9],[1,10,15],[2,9,19],[4,83,188,1],[1,0,9],[1,10,15],[2,9,16],[0,90,444],[1,0,7],[2,11,28],[2,110,120],[2,52,63],[2,131,138]], t[S]),
};
const libs = {"../../wgsl/fragment/sdf-2d": m0, "../../wgsl/use/color": m1};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getScreenFragment = getSymbol("getScreenFragment");
