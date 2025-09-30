/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getFragment getScissor main symbols visibles symbol flags name infer(T) attr type link color vec4<f32> parameters identifiers inferred func optional scissor externals void fragment frontFacing bool builtin(front_facing) fragCoord builtin(position) fragAlpha f32 location(0) fragUV location(1) fragST location(2) fragScissor location(3) exports linkable location outColor".split(' '));
const t = {[_(3)]:_(["T",0,1,2]),[_(4)]:_([2]),[_(20)]:[{"at":18,[_(5)]:_(0),[_(6)]:2,[_(17)]:{[_(7)]:_(0),[_(10)]:{[_(7)]:"T",[_(9)]:_([8])},[_(9)]:_([11]),[_(14)]:[{[_(7)]:_(12),[_(10)]:_(13)},{[_(7)]:"uv",[_(10)]:_(13)},{[_(7)]:"st",[_(10)]:_(13)}],[_(15)]:_(["T"]),[_(16)]:[{[_(7)]:"T","at":-1}]}},{"at":122,[_(5)]:_(1),[_(6)]:6,[_(17)]:{[_(7)]:_(1),[_(10)]:_(13),[_(9)]:_([18,11]),[_(14)]:[{[_(7)]:_(12),[_(10)]:_(13)},{[_(7)]:_(19),[_(10)]:_(13)}]}}],[_(37)]:[{"at":224,[_(5)]:_(2),[_(6)]:1,[_(17)]:{[_(7)]:_(2),[_(10)]:_(21),[_(9)]:_([22]),[_(14)]:[{[_(7)]:_(23),[_(10)]:_(24),[_(9)]:_([25])},{[_(7)]:_(26),[_(10)]:_(13),[_(9)]:_([27])},{[_(7)]:_(28),[_(10)]:_(29),[_(9)]:_([30])},{[_(7)]:_(31),[_(10)]:_(13),[_(9)]:_([32])},{[_(7)]:_(33),[_(10)]:_(13),[_(9)]:_([34])},{[_(7)]:_(35),[_(10)]:_(13),[_(9)]:_([36])}],[_(15)]:_([0,1])}}],[_(38)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "fragment/depth",
  "code": _(["@infer ",10," T;\r\n\r\n@",11," fn ",0,"(\r\n  ",12,": ",13,",\r\n  uv: ",13,",\r\n  st: ",13,",\r\n) -> @",8," T {};\r\n\r\n@",18," @",11," fn ",1,"(",12,": ",13,", ",19,": ",13,") -> ",13," { return ",12,"; }\r\n\r\n@",22,"\r\nfn ",2,"(\r\n  @",25," ",23,": ",24,",\r\n  @",27," ",26,": ",13,",\r\n  @",30," ",28,": f32,\r\n  @",32," ",31,": ",13,",\r\n  @",34," ",33,": ",13,",\r\n  @",36," ",35,": ",13,",\r\n) {\r\n\r\n  var ",40," = ",13,"(1.0, 1.0, 1.0, ",28,");\r\n  ",40," = ",0,"(",40,", ",31,", ",33,");\r\n\r\n  if (HAS_SCISSOR) { ",40," = ",1,"(",40,", ",35,"); }\r\n  if (",40,".a <= 0.0) { discard; }\r\n\r\n  if (",40,".a < 1.0) {\r\n    let bits = vec2<u32>(",26,".xy) % 2;\r\n    let level = (0.5 + f32(bits.x ^ ((bits.x ^ bits.y) << 1))) / 4.0;\r\n    if (",40,".a < level) { discard; }\r\n  }\r\n}"]).join(''),
  "hash": 3792219507294440,
  "table": t,
  "shake": [[0,[0,1,3]],[18,[1,3]],[122,[2,3]],[224,[3]]],
  "tree": decompressAST([[1,0,14],[1,18,117],[4,104,202,2],[1,0,9],[1,10,15],[2,9,19],[0,83,754],[3,0,9],[2,14,18],[3,9,31],[3,45,63],[3,44,56],[3,32,44],[3,35,47],[3,35,47],[2,113,124],[2,74,84]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
