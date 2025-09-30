/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSurface sampleSSAO getOpacity getIndirect getSSAOSurface infer(T) link color normal tangent position coord vec2<u32> f32 export infers normal tangent position surface directAO albedo".split(' '));
const table = {[S]:_(["T",0,1,2,3,4]),[W]:_([4]),[X]:[{[A]:18,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:{[N]:"T",[Z]:_([5])},[Z]:_([6]),[P]:[{[N]:_(7),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C},{[N]:_(8),[T]:C},{[N]:_(9),[T]:C},{[N]:_(10),[T]:C},{[N]:_(11),[T]:C}],[I]:_(["T"]),[H]:[{[N]:"T",[A]:-1}]}},{[A]:208,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:C,[Z]:_([6]),[P]:[{[N]:"xy",[T]:_(12)}]}},{[A]:260,[R]:_(2),[G]:2,[F]:{[N]:_(2),[T]:_(13),[Z]:_([6])}},{[A]:291,[R]:_(3),[G]:2,[F]:{[N]:_(3),[T]:_(13),[Z]:_([6])}}],[E]:[{[A]:325,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:"T",[Z]:_([14]),[P]:[{[N]:_(7),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C},{[N]:_(8),[T]:C},{[N]:_(9),[T]:C},{[N]:_(10),[T]:C},{[N]:_(11),[T]:C}],[I]:_(["T",0,1,3,2])}}],[_(15)]:_(["T"]),[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true}};
const data = {
  name: "surface/ssao-surface.wgsl",
  code: _(["@infer ",T," T;\r\n\r\n@",6," fn ",0,"(\r\n  ",7,": ",C,",\r\n  uv: ",C,",\r\n  st: ",C,",\r\n  ",8,": ",C,",\r\n  ",9,": ",C,",\r\n  ",10,": ",C,",\r\n  ",11,": ",C,",\r\n) -> @",5," T;\r\n\r\n@",6," fn ",1,"(xy: ",12,") -> ",C,";\r\n\r\n@",6," fn ",2,"() -> f32;\r\n@",6," fn ",3,"() -> f32;\r\n\r\n@",14," fn ",4,"(\r\n  ",7,": ",C,",\r\n  uv: ",C,",\r\n  st: ",C,",\r\n  ",8,": ",C,",\r\n  ",9,": ",C,",\r\n  ",10,": ",C,",\r\n  ",11,": ",C,",\r\n) -> T {\r\n\r\n  var ",19," = ",0,"(",7,", uv, st, ",8,", ",9,", ",10,", ",11,");\r\n  let ssao = ",1,"(",12,"(",11,".xy));\r\n\r\n  // Albedo-based indirect bounce approximation\r\n  let ",20," = ssao.w;\r\n  let ",21," = length(",19,".",21,") / 1.73;\r\n  let abc = ",D,"(2.0404, 4.7951, 2.7552) * ",21," + ",D,"(-0.3324, -0.6417, 0.6903);\r\n  let in",20," = ((abc.x * ",20," - abc.y) * ",20," + abc.z) * ",20,";\r\n\r\n  // Control effect with visual blend\r\n  let totalAO = mix(",20,", in",20,", ",3,"());\r\n  let ao = mix(1.0, totalAO, ",2,"());\r\n\r\n  ",19,".occlusion = ",C,"(ssao.xyz * 2.0 - 1.0, ",19,".occlusion.w * ao);\r\n\r\n  return ",19,";\r\n}\n"]).join(''),
  hash: 0x65eecef244d3,
  table,
  shake: [[0,[0,1,5]],[18,[1,5]],[208,[2,5]],[260,[3,5]],[291,[4,5]],[325,[5]]],
  tree: decompressAST([[1,0,14],[1,18,203],[1,190,237],[1,52,80],[1,31,60],[0,34,896],[1,0,7],[2,11,25],[2,169,170],[2,23,33],[2,75,85],[2,416,427],[2,46,56]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getSSAOSurface = getSymbol("getSSAOSurface");
