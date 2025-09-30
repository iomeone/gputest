/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getDepth getScissor main symbols visibles symbol flags name infer(T) attr type link alpha f32 vec4<f32> position parameters identifiers inferred func optional color scissor externals builtin(frag_depth) fragment fragCoord builtin(position) fragAlpha location(0) fragUV location(1) fragST location(2) fragPosition location(3) fragScissor location(4) exports linkable fragment location outColor".split(' '));
const t = {[_(3)]:_(["T",0,1,2]),[_(4)]:_([2]),[_(23)]:[{"at":18,[_(5)]:_(0),[_(6)]:2,[_(19)]:{[_(7)]:_(0),[_(10)]:{[_(7)]:"T",[_(9)]:_([8])},[_(9)]:_([11]),[_(16)]:[{[_(7)]:_(12),[_(10)]:_(13)},{[_(7)]:"uv",[_(10)]:_(14)},{[_(7)]:"st",[_(10)]:_(14)},{[_(7)]:_(15),[_(10)]:_(14)}],[_(17)]:_(["T"]),[_(18)]:[{[_(7)]:"T","at":-1}]}},{"at":137,[_(5)]:_(1),[_(6)]:6,[_(19)]:{[_(7)]:_(1),[_(10)]:_(14),[_(9)]:_([20,11]),[_(16)]:[{[_(7)]:_(21),[_(10)]:_(14)},{[_(7)]:_(22),[_(10)]:_(14)}]}}],[_(38)]:[{"at":239,[_(5)]:_(2),[_(6)]:1,[_(19)]:{[_(7)]:_(2),[_(10)]:{[_(7)]:_(13),[_(9)]:_([24])},[_(9)]:_([25]),[_(16)]:[{[_(7)]:_(26),[_(10)]:_(14),[_(9)]:_([27])},{[_(7)]:_(28),[_(10)]:_(13),[_(9)]:_([29])},{[_(7)]:_(30),[_(10)]:_(14),[_(9)]:_([31])},{[_(7)]:_(32),[_(10)]:_(14),[_(9)]:_([33])},{[_(7)]:_(34),[_(10)]:_(14),[_(9)]:_([35])},{[_(7)]:_(36),[_(10)]:_(14),[_(9)]:_([37])}],[_(17)]:_([0,1])}}],[_(39)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "fragment/depth-frag",
  "code": _(["@infer ",10," T;\r\n\r\n@",11," fn ",0,"(\r\n  ",12,": f32,\r\n  uv: ",14,",\r\n  st: ",14,",\r\n  ",15,": ",14,",\r\n) -> @",8," T {};\r\n\r\n@",20," @",11," fn ",1,"(",21,": ",14,", ",22,": ",14,") -> ",14," { return ",21,"; }\r\n\r\n@",25,"\r\nfn ",2,"(\r\n  @builtin(",15,") ",26,": ",14,",\r\n  @",29," ",28,": f32,\r\n  @",31," ",30,": ",14,",\r\n  @",33," ",32,": ",14,",\r\n  @",35," ",34,": ",14,",\r\n  @",37," ",36,": ",14,",\r\n) -> @",24," f32 {\r\n\r\n  var ",25," = ",0,"(",28,", ",30,", ",32,", ",34,");\r\n  var ",42," = ",14,"(0.0, 0.0, 0.0, ",25,".",12,");\r\n\r\n  if (HAS_SCISSOR) { ",42," = ",1,"(",42,", ",36,"); }\r\n  if (",42,".a <= 0.0) { discard; }\r\n\r\n  if (",42,".a < 1.0) {\r\n    let bits = vec2<u32>(",26,".xy) % 2;\r\n    let level = (0.5 + f32(bits.x ^ ((bits.x ^ bits.y) << 1))) / 4.0;\r\n    if (",42,".a < level) { discard; }\r\n  }\r\n\r\n  return ",25,".depth;\r\n}"]).join(''),
  "hash": 2140285889250567,
  "table": t,
  "shake": [[0,[0,1,3]],[18,[1,3]],[137,[2,3]],[239,[3]]],
  "tree": decompressAST([[1,0,14],[1,18,132],[4,119,217,2],[1,0,9],[1,10,15],[2,9,19],[0,83,827],[3,0,9],[2,14,18],[3,9,27],[3,44,56],[3,32,44],[3,35,47],[3,35,47],[3,41,53],[3,43,63],[2,47,55],[2,146,156]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
