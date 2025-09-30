/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/use/typeswgsl";
const {} = symbolDictionary;
const _ = decompressString("applyLight applyLights symbols visibles ../../wgsl/use/types name Light imported imports modules symbol flags f32 type link attr vec3<f32> light surface infer(T) parameters identifiers inferred func externals export exports linkable surface".split(' '));
const t = {[_(2)]:_(["T",0,1]),[_(3)]:_([1]),[_(9)]:[{"at":0,[_(5)]:_(4),[_(2)]:_([6]),[_(8)]:[{[_(5)]:_(6),[_(7)]:_(6)}]}],[_(24)]:[{"at":58,[_(10)]:_(0),[_(11)]:2,[_(23)]:{[_(5)]:_(0),[_(13)]:_(12),[_(15)]:_([14]),[_(20)]:[{[_(5)]:"N",[_(13)]:_(16)},{[_(5)]:"V",[_(13)]:_(16)},{[_(5)]:_(17),[_(13)]:_(6)},{[_(5)]:_(18),[_(13)]:"T",[_(15)]:_([19])}],[_(21)]:_(["T"]),[_(22)]:[{[_(5)]:"T","at":3}]}}],[_(26)]:[{"at":171,[_(10)]:_(1),[_(11)]:1,[_(23)]:{[_(5)]:_(1),[_(13)]:_(16),[_(15)]:_([25]),[_(20)]:[{[_(5)]:"N",[_(13)]:_(16)},{[_(5)]:"V",[_(13)]:_(16)},{[_(5)]:_(18),[_(13)]:"T"}],[_(21)]:_(["T",0])}}],[_(27)]:{[_(0)]:true}};
const data = {
  "name": "material/lights-default",
  "code": _(["use '",4,"'::{ ",6," };\r\n\r\n@infer ",13," T;\r\n@",14," fn ",0,"(\r\n  N: ",16,",\r\n  V: ",16,",\r\n  ",17,": ",6,",\r\n  @",19," ",18,": T,\r\n) -> f32 {}\r\n\r\n@",25," fn ",0,"s(\r\n  N: ",16,",\r\n  V: ",16,",\r\n  ",18,": T,\r\n) -> ",16," {\r\n\r\n  var radiance: ",16," = ",16,"(0.0);\r\n\r\n  var ",17," = ",6,"(\r\n    mat4x4<f32>(),\r\n    vec4<f32>(0.0),\r\n    vec4<f32>(-0.267, -3*0.267, -2*0.267, 0.0),\r\n    vec4<f32>(1.0),\r\n    vec4<f32>(0.0),\r\n    0.8,\r\n    0.0,\r\n    1,\r\n    -1,\r\n    0,\r\n    vec2<f32>(0.0),\r\n    vec4<f32>(0.0),\r\n    vec4<f32>(0.0),\r\n  );\r\n\r\n  return ",0,"(N, V, ",17,", ",18,");\r\n}"]).join(''),
  "hash": 4701235700006175,
  "table": t,
  "shake": [[42,[0,1,2]],[58,[1,2]],[171,[2]]],
  "tree": decompressAST([[1,0,37],[1,42,56],[1,16,125],[0,113,569],[1,0,7],[2,11,22],[2,59,60],[2,85,90],[2,265,275]], t[S]),
};
const libs = {"../../wgsl/use/types": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const applyLights = getSymbol("applyLights");
