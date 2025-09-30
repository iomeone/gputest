/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/typeswgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSurface traceSurface getRaytraceSurface ../../../wgsl/use/types DepthNormalFragment infer(T) link color normal tangent position coord export infers normal tangent position surface fragment".split(' '));
const table = {[S]:_(["T",0,1,2]),[W]:_([2]),[O]:[{[A]:0,[N]:_(3),[S]:_([4]),[K]:[{[N]:_(4),[J]:_(4)}]}],[X]:[{[A]:77,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:{[N]:"T",[Z]:_([5])},[Z]:_([6]),[P]:[{[N]:_(7),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C},{[N]:_(8),[T]:C},{[N]:_(9),[T]:C},{[N]:_(10),[T]:C},{[N]:_(11),[T]:C}],[I]:_(["T"]),[H]:[{[N]:"T",[A]:-1}]}},{[A]:267,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:_(4),[Z]:_([6]),[P]:[{[N]:"uv",[T]:C},{[N]:"st",[T]:C},{[N]:_(8),[T]:C},{[N]:_(9),[T]:C},{[N]:_(10),[T]:C},{[N]:_(11),[T]:C}]}}],[E]:[{[A]:446,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:"T",[Z]:_([12]),[P]:[{[N]:_(7),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C},{[N]:_(8),[T]:C},{[N]:_(9),[T]:C},{[N]:_(10),[T]:C},{[N]:_(11),[T]:C}],[I]:_(["T",0,1])}}],[_(13)]:_(["T"]),[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "surface/raytrace-surface.wgsl",
  code: _(["use '",3,"'::{ ",4," };\r\n\r\n@infer ",T," T;\r\n\r\n@",6," fn ",0,"(\r\n  ",7,": ",C,",\r\n  uv: ",C,",\r\n  st: ",C,",\r\n  ",8,": ",C,",\r\n  ",9,": ",C,",\r\n  ",10,": ",C,",\r\n  ",11,": ",C,",\r\n) -> @",5," T;\r\n\r\n@",6," fn ",1,"(\r\n  uv: ",C,",\r\n  st: ",C,",\r\n  ",8,": ",C,",\r\n  ",9,": ",C,",\r\n  ",10,": ",C,",\r\n  ",11,": ",C,",\r\n) -> ",4,";\r\n\r\n@",12," fn getRay",1,"(\r\n  ",7,": ",C,",\r\n  uv: ",C,",\r\n  st: ",C,",\r\n  ",8,": ",C,",\r\n  ",9,": ",C,",\r\n  ",10,": ",C,",\r\n  ",11,": ",C,",\r\n) -> T {\r\n\r\n  var ",17," = ",0,"(",7,", uv, st, ",8,", ",9,", ",10,", ",11,");\r\n  let ",18," = ",1,"(uv, st, ",8,", ",9,", ",10,", ",11,");\r\n\r\n  ",17,".",8," = ",18,".",8,";\r\n  ",17,".depth = ",18,".depth;\r\n  ",17,".albedo.a *= ",18,".alpha;\r\n\r\n  return ",17,";\r\n}\n"]).join(''),
  hash: 0xaf119e6740c2f,
  table,
  shake: [[59,[0,1,3]],[77,[1,3]],[267,[2,3]],[446,[3]]],
  tree: decompressAST([[1,0,54],[1,59,73],[1,18,203],[1,190,364],[0,179,657],[1,0,7],[2,11,29],[2,173,174],[2,23,33],[2,79,91]], table[S]),
};

const libs = {"../../../wgsl/use/types": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getRaytraceSurface = getSymbol("getRaytraceSurface");
