/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../../shader/wgsl";
import m0 from "../../../../../wgsl/use/viewwgsl";
const {} = symbolDictionary;
const _ = decompressString("VertexOutput main symbols visibles ../../../../../wgsl/use/view name worldToClip imported imports modules symbol flags type vertex attr instanceIndex u32 builtin(instance_index) position vec4<f32> location(0) normal location(1) color location(2) vec2<f32> location(3) parameters identifiers func exports VertexOutput position location fragIndex".split(' '));
const t = {[_(2)]:_([0,1]),[_(3)]:_([1]),[_(9)]:[{"at":0,[_(5)]:_(4),[_(2)]:_([6]),[_(8)]:[{[_(5)]:_(6),[_(7)]:_(6)}]}],[_(30)]:[{"at":302,[_(10)]:_(1),[_(11)]:1,[_(29)]:{[_(5)]:_(1),[_(12)]:_(0),[_(14)]:_([13]),[_(27)]:[{[_(5)]:_(15),[_(12)]:_(16),[_(14)]:_([17])},{[_(5)]:_(18),[_(12)]:_(19),[_(14)]:_([20])},{[_(5)]:_(21),[_(12)]:_(19),[_(14)]:_([22])},{[_(5)]:_(23),[_(12)]:_(19),[_(14)]:_([24])},{[_(5)]:"uv",[_(12)]:_(25),[_(14)]:_([26])}],[_(28)]:_([0,0])}}]};
const data = {
  "name": "vertex/mesh-pick",
  "code": _(["use '",4,"'::{ ",6," };\r\n\r\nstruct ",0," {\r\n  @builtin(",18,") ",18,": ",19,",\r\n  @",20," fragScissor: ",19,",\r\n  @",22," fragUV: ",25,",\r\n  @",24," @interpolate(flat) fragId: u32,\r\n  @",26," @interpolate(flat) ",34,": u32,\r\n};\r\n\r\n@",13,"\r\nfn ",1,"(\r\n  @",17," ",15,": u32,\r\n  @",20," ",18,": ",19,",\r\n  @",22," ",21,": ",19,",\r\n  @",24," ",23,": ",19,",\r\n  @",26," uv: ",25,",\r\n) -> ",0," {\r\n\r\n  var outPosition: ",19," = ",6,"(",18,");\r\n  var ",34," = u32(",15,");\r\n\r\n  return ",0,"(\r\n    outPosition,\r\n    ",19,"(0.0),\r\n    ",25,"(0.0),\r\n    u32(PICKING_ID),\r\n    ",34,",\r\n  );\r\n}"]).join(''),
  "hash": 4875325522912141,
  "table": t,
  "shake": [[52,[0,1]],[302,[1]]],
  "tree": decompressAST([[1,0,51],[0,52,297],[2,11,23],[3,18,36],[3,43,55],[3,40,52],[3,35,47],[3,13,31],[3,35,47],[3,13,31],[0,42,494],[3,0,7],[2,12,16],[3,9,33],[3,48,60],[3,37,49],[3,35,47],[3,34,46],[2,34,46],[2,49,60],[2,74,86]], t[S]),
};
const libs = {"../../../../../wgsl/use/view": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
