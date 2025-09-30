/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getDepth main symbols visibles symbol flags name vec4<f32> type optional link attr color parameters func externals f32 builtin(frag_depth) fragment frontFacing bool builtin(front_facing) fragAlpha location(0) fragUV location(1) fragST location(2) fragScissor location(3) identifiers exports linkable location".split(' '));
const t = {[_(2)]:_([0,1]),[_(3)]:_([1]),[_(15)]:[{"at":0,[_(4)]:_(0),[_(5)]:6,[_(14)]:{[_(6)]:_(0),[_(8)]:_(7),[_(11)]:_([9,10]),[_(13)]:[{[_(6)]:_(12),[_(8)]:_(7)},{[_(6)]:"uv",[_(8)]:_(7)},{[_(6)]:"st",[_(8)]:_(7)}]}}],[_(31)]:[{"at":132,[_(4)]:_(1),[_(5)]:1,[_(14)]:{[_(6)]:_(1),[_(8)]:{[_(6)]:_(16),[_(11)]:_([17])},[_(11)]:_([18]),[_(13)]:[{[_(6)]:_(19),[_(8)]:_(20),[_(11)]:_([21])},{[_(6)]:_(22),[_(8)]:_(16),[_(11)]:_([23])},{[_(6)]:_(24),[_(8)]:_(7),[_(11)]:_([25])},{[_(6)]:_(26),[_(8)]:_(7),[_(11)]:_([27])},{[_(6)]:_(28),[_(8)]:_(7),[_(11)]:_([29])}],[_(30)]:_([0])}}],[_(32)]:{[_(0)]:true}};
const data = {
  "name": "fragment/depth-copy",
  "code": _(["@",9," @",10," fn ",0,"(\r\n  ",12,": ",7,",\r\n  uv: ",7,",\r\n  st: ",7,",\r\n) -> ",7," { return ",7,"(0.0); }\r\n\r\n@",18,"\r\nfn ",1,"(\r\n  @",21," ",19,": ",20,",\r\n  @",23," ",22,": f32,\r\n  @",25," ",24,": ",7,",\r\n  @",27," ",26,": ",7,",\r\n  @",29," ",28,": ",7,",\r\n) -> @",17," f32 {\r\n\r\n  var outColor = ",7,"(1.0, 1.0, 1.0, ",22,");\r\n  return ",0,"(outColor, ",24,", ",26,").r;\r\n}"]).join(''),
  "hash": 7281349686755507,
  "table": t,
  "shake": [[0,[0,1]],[132,[1]]],
  "tree": decompressAST([[4,0,128,0],[1,0,9],[1,10,15],[2,9,17],[0,113,460],[3,0,9],[2,14,18],[3,9,31],[3,45,57],[3,32,44],[3,35,47],[3,35,47],[3,43,63],[2,94,102]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
