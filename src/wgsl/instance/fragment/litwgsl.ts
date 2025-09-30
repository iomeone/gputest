/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/viewwgsl";
import m1 from "../../../wgsl/use/typeswgsl";
const {} = symbolDictionary;
const _ = decompressString("applyLights applyEnvironment getLitFragment symbols visibles ../../../wgsl/use/view name getViewPosition imported imports ../../../wgsl/use/types SurfaceFragment modules symbol flags vec3<f32> type optional link attr surface parameters func externals vec4<f32> export identifiers exports linkable SurfaceFragment surface return viewPosition".split(' '));
const t = {[_(3)]:_([0,1,2]),[_(4)]:_([2]),[_(12)]:[{"at":0,[_(6)]:_(5),[_(3)]:_([7]),[_(9)]:[{[_(6)]:_(7),[_(8)]:_(7)}]},{"at":0,[_(6)]:_(10),[_(3)]:_([11]),[_(9)]:[{[_(6)]:_(11),[_(8)]:_(11)}]}],[_(23)]:[{"at":107,[_(13)]:_(0),[_(14)]:6,[_(22)]:{[_(6)]:_(0),[_(16)]:_(15),[_(19)]:_([17,18]),[_(21)]:[{[_(6)]:"N",[_(16)]:_(15)},{[_(6)]:"V",[_(16)]:_(15)},{[_(6)]:_(20),[_(16)]:_(11)}]}},{"at":248,[_(13)]:_(1),[_(14)]:6,[_(22)]:{[_(6)]:_(1),[_(16)]:_(15),[_(19)]:_([17,18]),[_(21)]:[{[_(6)]:"N",[_(16)]:_(15)},{[_(6)]:"V",[_(16)]:_(15)},{[_(6)]:_(20),[_(16)]:_(11)}]}}],[_(27)]:[{"at":394,[_(13)]:_(2),[_(14)]:1,[_(22)]:{[_(6)]:_(2),[_(16)]:_(24),[_(19)]:_([25]),[_(21)]:[{[_(6)]:_(20),[_(16)]:_(11)}],[_(26)]:_([0,1])}}],[_(28)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "fragment/lit",
  "code": _(["use '",5,"'::{ ",7," };\r\nuse '",10,"'::{ ",11," };\r\n\r\n@",17," @",18," fn ",0,"(\r\n  N: ",15,",\r\n  V: ",15,",\r\n  ",20,": ",11,",\r\n) -> ",15," { ",31," ",15,"(0.0); }\r\n\r\n@",17," @",18," fn ",1,"(\r\n  N: ",15,",\r\n  V: ",15,",\r\n  ",20,": ",11,",\r\n) -> ",15," { ",31," ",15,"(0.0); }\r\n\r\n@",25," fn ",2,"(\r\n  ",20,": ",11,",\r\n) -> ",24," {\r\n  let ",32," = ",7,"();\r\n  let ",20,"Position = ",20,".position.xyz;\r\n  let toView = ",32,".xyz - ",20,"Position * ",32,".w;\r\n\r\n  let N: ",15," = normalize(",20,".normal.xyz);\r\n  let V: ",15," = normalize(toView);\r\n\r\n  let light = ",20,".emissive.xyz + ",0,"(N, V, ",20,") + ",1,"(N, V, ",20,");\r\n\r\n  //",31," ",24,"(color.xyz, 1.0);\r\n  //",31," ",24,"(mix(color.xyz, N * .5 + .5, .5), 1.0);\r\n  //",31," ",24,"(N * .5 + .5, 1.0);\r\n\r\n  let alpha = ",20,".albedo.a;\r\n\r\n  if (HAS_ALPHA_TO_COVERAGE) {\r\n    ",31," ",24,"(light, alpha);\r\n  }\r\n  else {\r\n    ",31," ",24,"(light * alpha, alpha);\r\n  }\r\n}"]).join(''),
  "hash": 6799369662780358,
  "table": t,
  "shake": [[107,[0,2]],[248,[1,2]],[394,[2]]],
  "tree": decompressAST([[1,0,49],[1,52,102],[4,55,192,0],[1,0,9],[1,10,15],[2,9,20],[2,59,74],[4,63,205,1],[1,0,9],[1,10,15],[2,9,25],[2,64,79],[0,63,808],[1,0,7],[2,11,25],[2,28,43],[2,57,72],[2,271,282],[2,29,45]], t[S]),
};
const libs = {"../../../wgsl/use/view": m0, "../../../wgsl/use/types": m1};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getLitFragment = getSymbol("getLitFragment");
