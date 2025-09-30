/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSurface sampleSSAO getOpacity getIndirect getGBufferSSAOSurface infer(T) link coord vec2<u32> f32 export vec2<f32> infers surface directAO albedo".split(' '));
const table = {[S]:_(["T",0,1,2,3,4]),[W]:_([4]),[X]:[{[A]:18,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:{[N]:"T",[Z]:_([5])},[Z]:_([6]),[P]:[{[N]:"uv",[T]:C},{[N]:_(7),[T]:C}],[I]:_(["T"]),[H]:[{[N]:"T",[A]:-1}]}},{[A]:103,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:C,[Z]:_([6]),[P]:[{[N]:"xy",[T]:_(8)}]}},{[A]:155,[R]:_(2),[G]:2,[F]:{[N]:_(2),[T]:_(9),[Z]:_([6])}},{[A]:186,[R]:_(3),[G]:2,[F]:{[N]:_(3),[T]:_(9),[Z]:_([6])}}],[E]:[{[A]:220,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:"T",[Z]:_([10]),[P]:[{[N]:"uv",[T]:_(11)},{[N]:_(7),[T]:C}],[I]:_(["T",0,1,3,2])}}],[_(12)]:_(["T"]),[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true}};
const data = {
  name: "surface/g-buffer-ssao-surface.wgsl",
  code: _(["@infer ",T," T;\r\n\r\n@",6," fn ",0,"(\r\n  uv: ",C,",\r\n  ",7,": ",C,",\r\n) -> @",5," T {};\r\n\r\n@",6," fn ",1,"(xy: ",8,") -> ",C,";\r\n\r\n@",6," fn ",2,"() -> f32;\r\n@",6," fn ",3,"() -> f32;\r\n\r\n@",10," fn ",4,"(\r\n  uv: ",11,",\r\n  ",7,": ",C,",\r\n) -> T {\r\n  var ",13," = ",0,"(uv, ",7,");\r\n  let ssao = ",1,"(",8,"(",7,".xy));\r\n\r\n  // Albedo-based indirect bounce approximation\r\n  let ",14," = ssao.w;\r\n  let ",15," = length(",13,".",15,") / 1.73;\r\n  let abc = ",D,"(2.0404, 4.7951, 2.7552) * ",15," + ",D,"(-0.3324, -0.6417, 0.6903);\r\n  let in",14," = ((abc.x * ",14," - abc.y) * ",14," + abc.z) * ",14,";\r\n\r\n  // Control effect with visual blend\r\n  let totalAO = mix(",14,", in",14,", ",3,"());\r\n  let ao = mix(1.0, totalAO, ",2,"());\r\n\r\n  ",13,".occlusion = ",C,"(ssao.xyz * 2.0 - 1.0, ",13,".occlusion.w * ao);\r\n\r\n  return ",13,";\r\n}\n"]).join(''),
  hash: 0x19e3825f9793d0,
  table,
  shake: [[0,[0,1,5]],[18,[1,5]],[103,[2,5]],[155,[3,5]],[186,[4,5]],[220,[5]]],
  tree: decompressAST([[1,0,14],[1,18,98],[1,85,132],[1,52,80],[1,31,60],[0,34,755],[1,0,7],[2,11,32],[2,68,69],[2,21,31],[2,37,47],[2,416,427],[2,46,56]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getGBufferSSAOSurface = getSymbol("getGBufferSSAOSurface");
