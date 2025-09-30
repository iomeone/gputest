/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/mask/scissorwgsl";
const {} = symbolDictionary;
const _ = decompressString("main symbols visibles ../../../wgsl/mask/scissor name isScissored imported imports modules symbol flags vec4<u32> location(0) attr type fragment fragScissor vec4<f32> fragUV vec2<f32> location(1) fragId u32 location(2) interpolate(flat) fragIndex location(3) parameters func exports location fragId".split(' '));
const t = {[_(1)]:_([0]),[_(2)]:_([0]),[_(8)]:[{"at":0,[_(4)]:_(3),[_(1)]:_([5]),[_(7)]:[{[_(4)]:_(5),[_(6)]:_(5)}]}],[_(29)]:[{"at":55,[_(9)]:_(0),[_(10)]:1,[_(28)]:{[_(4)]:_(0),[_(14)]:{[_(4)]:_(11),[_(13)]:_([12])},[_(13)]:_([15]),[_(27)]:[{[_(4)]:_(16),[_(14)]:_(17),[_(13)]:_([12])},{[_(4)]:_(18),[_(14)]:_(19),[_(13)]:_([20])},{[_(4)]:_(21),[_(14)]:_(22),[_(13)]:_([23,24])},{[_(4)]:_(25),[_(14)]:_(22),[_(13)]:_([26,24])}]}}]};
const data = {
  "name": "fragment/pick",
  "code": _(["use '",3,"':: { ",5," };\r\n\r\n@",15,"\r\nfn ",0,"(\r\n  @",12," ",16,": ",17,",\r\n  @",20," ",18,": ",19,",\r\n  @",23," @",24," ",21,": u32,\r\n  @",26," @",24," ",25,": u32,\r\n) -> @",12," ",11," {\r\n  if (",5,"(",16,")) { discard; }\r\n\r\n  if (UV_PICKING) {\r\n    let xy = vec2<u32>(clamp(",18," * 65535.0, ",19,"(0.0), ",19,"(65535.0)));\r\n    let index = xy.x | (xy.y << 16);\r\n    return ",11,"(",21,", index, 0u, 0u);\r\n  }\r\n  else {\r\n    return ",11,"(",21,", ",25,", 0u, 0u);\r\n  }\r\n}"]).join(''),
  "hash": 2908228345444428,
  "table": t,
  "shake": [[55,[0]]],
  "tree": decompressAST([[1,0,50],[0,55,591],[3,0,9],[2,14,18],[3,9,21],[3,40,52],[3,35,47],[3,13,31],[3,35,47],[3,13,31],[3,41,53],[2,32,43]], t[S]),
};
const libs = {"../../../wgsl/mask/scissor": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
