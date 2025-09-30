/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
import m0 from "../../wgsl/use/typeswgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("applyLight applyLights ../../wgsl/use/types Light f32 link light surface infer(T) export infers surface".split(' '));
const table = {[S]:_(["T",0,1]),[W]:_([1]),[O]:[{[A]:0,[N]:_(2),[S]:_([3]),[K]:[{[N]:_(3),[J]:_(3)}]}],[X]:[{[A]:58,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(4),[Z]:_([5]),[P]:[{[N]:"N",[T]:D},{[N]:"V",[T]:D},{[N]:_(6),[T]:_(3)},{[N]:_(7),[T]:"T",[Z]:_([8])}],[I]:_(["T"]),[H]:[{[N]:"T",[A]:3}]}}],[E]:[{[A]:171,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:D,[Z]:_([9]),[P]:[{[N]:"N",[T]:D},{[N]:"V",[T]:D},{[N]:_(7),[T]:"T"}],[I]:_(["T",0])}}],[_(10)]:_(["T"]),[L]:{[_(0)]:true}};
const data = {
  name: "material/lights-default.wgsl",
  code: _(["use '",2,"'::{ ",3," };\r\n\r\n@infer ",T," T;\r\n@",5," fn ",0,"(\r\n  N: ",D,",\r\n  V: ",D,",\r\n  ",6,": ",3,",\r\n  @",8," ",7,": T,\r\n) -> f32 {}\r\n\r\n@",9," fn ",0,"s(\r\n  N: ",D,",\r\n  V: ",D,",\r\n  ",7,": T,\r\n) -> ",D," {\r\n\r\n  var radiance: ",D," = ",D,"(0.0);\r\n\r\n  var ",6," = ",3,"(\r\n    mat4x4<f32>(),\r\n    ",C,"(0.0),\r\n    ",C,"(-0.267, -3*0.267, -2*0.267, 0.0),\r\n    ",C,"(1.0),\r\n    ",C,"(0.0),\r\n    0.8,\r\n    0.0,\r\n    1,\r\n    -1,\r\n    0,\r\n    vec2<f32>(0.0),\r\n    ",C,"(0.0),\r\n    ",C,"(0.0),\r\n  );\r\n\r\n  return ",0,"(N, V, ",6,", ",7,");\r\n}\n"]).join(''),
  hash: 0xf2e4af2db66ca,
  table,
  shake: [[42,[0,1,2]],[58,[1,2]],[171,[2]]],
  tree: decompressAST([[1,0,37],[1,42,56],[1,16,125],[0,113,569],[1,0,7],[2,11,22],[2,59,60],[2,85,90],[2,265,275]], table[S]),
};

const libs = {"../../wgsl/use/types": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const applyLights = getSymbol("applyLights");
