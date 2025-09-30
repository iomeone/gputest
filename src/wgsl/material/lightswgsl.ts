/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/use/typeswgsl";
import m1 from "../../wgsl/fragment/pbrwgsl";
const {} = symbolDictionary;
const _ = decompressString("applyLight getLightCount getLight applyLights symbols visibles ../../wgsl/use/types name Light imported imports ../../wgsl/fragment/pbr PBR modules symbol flags vec3<f32> type link attr light surface infer(T) parameters identifiers inferred func u32 index externals export exports linkable surface radiance lightCount".split(' '));
const t = {[_(4)]:_(["T",0,1,2,3]),[_(5)]:_([3]),[_(13)]:[{"at":0,[_(7)]:_(6),[_(4)]:_([8]),[_(10)]:[{[_(7)]:_(8),[_(9)]:_(8)}]},{"at":0,[_(7)]:_(11),[_(4)]:_([12]),[_(10)]:[{[_(7)]:_(12),[_(9)]:_(12)}]}],[_(29)]:[{"at":99,[_(14)]:_(0),[_(15)]:2,[_(26)]:{[_(7)]:_(0),[_(17)]:_(16),[_(19)]:_([18]),[_(23)]:[{[_(7)]:"N",[_(17)]:_(16)},{[_(7)]:"V",[_(17)]:_(16)},{[_(7)]:_(20),[_(17)]:_(8)},{[_(7)]:_(21),[_(17)]:"T",[_(19)]:_([22])}],[_(24)]:_(["T"]),[_(25)]:[{[_(7)]:"T","at":3}]}},{"at":218,[_(14)]:_(1),[_(15)]:2,[_(26)]:{[_(7)]:_(1),[_(17)]:_(27),[_(19)]:_([18])}},{"at":252,[_(14)]:_(2),[_(15)]:2,[_(26)]:{[_(7)]:_(2),[_(17)]:_(8),[_(19)]:_([18]),[_(23)]:[{[_(7)]:_(28),[_(17)]:_(27)}]}}],[_(31)]:[{"at":295,[_(14)]:_(3),[_(15)]:1,[_(26)]:{[_(7)]:_(3),[_(17)]:_(16),[_(19)]:_([30]),[_(23)]:[{[_(7)]:"N",[_(17)]:_(16)},{[_(7)]:"V",[_(17)]:_(16)},{[_(7)]:_(21),[_(17)]:"T"}],[_(24)]:_(["T",1,2,0])}}],[_(32)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  "name": "material/lights",
  "code": _(["use '",6,"'::{ ",8," };\r\nuse '",11,"'::{ PBR };\r\n\r\n@infer ",17," T;\r\n@",18," fn ",0,"(\r\n  N: ",16,",\r\n  V: ",16,",\r\n  ",20,": ",8,",\r\n  @",22," ",21,": T,\r\n) -> ",16," {}\r\n\r\n@",18," fn ",1,"() -> u32;\r\n@",18," fn ",2,"(",28,": u32) -> ",8,";\r\n\r\n@",30," fn ",0,"s(\r\n  N: ",16,",\r\n  V: ",16,",\r\n  ",21,": T,\r\n) -> ",16," {\r\n\r\n  var ",34,": ",16," = ",16,"(0.0);\r\n\r\n  let ",20,"Count = ",1,"();\r\n  let n = min(",20,"Count, 1024u);\r\n  for (var i = 0u; i < ",20,"Count; i++) {\r\n    let ",20," = ",2,"(i);\r\n    let r = ",0,"(N, V, ",20,", ",21,");\r\n    ",34," += r;\r\n  }\r\n\r\n  return ",34,";\r\n}"]).join(''),
  "hash": 3115103137511592,
  "table": t,
  "shake": [[83,[0,1,4]],[99,[1,4]],[218,[2,4]],[252,[3,4]],[295,[4]]],
  "tree": decompressAST([[1,0,37],[1,40,78],[1,43,57],[1,16,131],[1,119,150],[1,34,72],[0,43,424],[1,0,7],[2,11,22],[2,59,60],[2,90,103],[2,112,120],[2,26,36]], t[S]),
};
const libs = {"../../wgsl/use/types": m0, "../../wgsl/fragment/pbr": m1};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const applyLights = getSymbol("applyLights");
