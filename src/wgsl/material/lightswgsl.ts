/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/use/typeswgsl";
import m1 from "../../wgsl/fragment/pbrwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("applyLight getLightCount getLight applyLights ../../wgsl/use/types Light ../../wgsl/fragment/pbr PBR link light surface infer(T) u32 index export surface radiance lightCount".split(' '));
const table = {[S]:_(["T",0,1,2,3]),[W]:_([3]),[O]:[{[A]:0,[N]:_(4),[S]:_([5]),[K]:[{[N]:_(5),[J]:_(5)}]},{[A]:0,[N]:_(6),[S]:_([7]),[K]:[{[N]:_(7),[J]:_(7)}]}],[X]:[{[A]:99,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:D,[Z]:_([8]),[P]:[{[N]:"N",[T]:D},{[N]:"V",[T]:D},{[N]:_(9),[T]:_(5)},{[N]:_(10),[T]:"T",[Z]:_([11])}],[I]:_(["T"]),[H]:[{[N]:"T",[A]:3}]}},{[A]:218,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:_(12),[Z]:_([8])}},{[A]:252,[R]:_(2),[G]:2,[F]:{[N]:_(2),[T]:_(5),[Z]:_([8]),[P]:[{[N]:_(13),[T]:_(12)}]}}],[E]:[{[A]:295,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:D,[Z]:_([14]),[P]:[{[N]:"N",[T]:D},{[N]:"V",[T]:D},{[N]:_(10),[T]:"T"}],[I]:_(["T",1,2,0])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  name: "material/lights.wgsl",
  code: _(["use '",4,"'::{ ",5," };\r\nuse '",6,"'::{ PBR };\r\n\r\n@infer ",T," T;\r\n@",8," fn ",0,"(\r\n  N: ",D,",\r\n  V: ",D,",\r\n  ",9,": ",5,",\r\n  @",11," ",10,": T,\r\n) -> ",D," {}\r\n\r\n@",8," fn ",1,"() -> u32;\r\n@",8," fn ",2,"(",13,": u32) -> ",5,";\r\n\r\n@",14," fn ",0,"s(\r\n  N: ",D,",\r\n  V: ",D,",\r\n  ",10,": T,\r\n) -> ",D," {\r\n\r\n  var ",16,": ",D," = ",D,"(0.0);\r\n\r\n  let ",9,"Count = ",1,"();\r\n  let n = min(",9,"Count, 1024u);\r\n  for (var i = 0u; i < ",9,"Count; i++) {\r\n    let ",9," = ",2,"(i);\r\n    let r = ",0,"(N, V, ",9,", ",10,");\r\n    ",16," += r;\r\n  }\r\n\r\n  return ",16,";\r\n}\n"]).join(''),
  hash: 0x9336a18e4bb2d,
  table,
  shake: [[83,[0,1,4]],[99,[1,4]],[218,[2,4]],[252,[3,4]],[295,[4]]],
  tree: decompressAST([[1,0,37],[1,40,78],[1,43,57],[1,16,131],[1,119,150],[1,34,72],[0,43,424],[1,0,7],[2,11,22],[2,59,60],[2,90,103],[2,112,120],[2,26,36]], table[S]),
};

const libs = {"../../wgsl/use/types": m0, "../../wgsl/fragment/pbr": m1};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const applyLights = getSymbol("applyLights");
