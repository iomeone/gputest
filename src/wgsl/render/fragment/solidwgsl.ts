/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getFragment getScissor main symbols visibles symbol flags name vec4<f32> type optional link attr color parameters func scissor externals location(0) fragment fragColor fragUV location(1) fragST location(2) fragScissor location(3) identifiers exports linkable return location outColor".split(' '));
const t = {[_(3)]:_([0,1,2]),[_(4)]:_([2]),[_(17)]:[{"at":0,[_(5)]:_(0),[_(6)]:6,[_(15)]:{[_(7)]:_(0),[_(9)]:_(8),[_(12)]:_([10,11]),[_(14)]:[{[_(7)]:_(13),[_(9)]:_(8)},{[_(7)]:"uv",[_(9)]:_(8)},{[_(7)]:"st",[_(9)]:_(8)}]}},{"at":111,[_(5)]:_(1),[_(6)]:6,[_(15)]:{[_(7)]:_(1),[_(9)]:_(8),[_(12)]:_([10,11]),[_(14)]:[{[_(7)]:_(13),[_(9)]:_(8)},{[_(7)]:_(16),[_(9)]:_(8)}]}}],[_(28)]:[{"at":213,[_(5)]:_(2),[_(6)]:1,[_(15)]:{[_(7)]:_(2),[_(9)]:{[_(7)]:_(8),[_(12)]:_([18])},[_(12)]:_([19]),[_(14)]:[{[_(7)]:_(20),[_(9)]:_(8),[_(12)]:_([18])},{[_(7)]:_(21),[_(9)]:_(8),[_(12)]:_([22])},{[_(7)]:_(23),[_(9)]:_(8),[_(12)]:_([24])},{[_(7)]:_(25),[_(9)]:_(8),[_(12)]:_([26])}],[_(27)]:_([0,1])}}],[_(29)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "fragment/solid",
  "code": _(["@",10," @",11," fn ",0,"(",13,": ",8,", uv: ",8,", st: ",8,") -> ",8," { ",30," ",13,"; }\r\n@",10," @",11," fn ",1,"(",13,": ",8,", ",16,": ",8,") -> ",8," { ",30," ",13,"; }\r\n\r\n@",19,"\r\nfn ",2,"(\r\n  @",18," ",20,": ",8,",\r\n  @",22," ",21,": ",8,",\r\n  @",24," ",23,": ",8,",\r\n  @",26," ",25,": ",8,",\r\n) -> @",18," ",8," {\r\n  var ",32," = ",20,";\r\n  ",32," = ",0,"(",32,", ",21,", ",23,");\r\n\r\n  if (HAS_SCISSOR) { ",32," = ",1,"(",32,", ",25,"); }\r\n  if (",32,".a <= 0.0) { discard; }\r\n\r\n  ",30," ",32,";\r\n}"]).join(''),
  "hash": 481314045790188,
  "table": t,
  "shake": [[0,[0,2]],[111,[1,2]],[213,[2]]],
  "tree": decompressAST([[4,0,109,0],[1,0,9],[1,10,15],[2,9,20],[4,92,190,1],[1,0,9],[1,10,15],[2,9,19],[0,83,499],[3,0,9],[2,14,18],[3,9,21],[3,38,50],[3,35,47],[3,35,47],[3,43,55],[2,68,79],[2,74,84]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
