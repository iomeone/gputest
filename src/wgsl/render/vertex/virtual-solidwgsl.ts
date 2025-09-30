/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/typeswgsl";
import m1 from "../../../wgsl/use/colorwgsl";
const {} = symbolDictionary;
const _ = decompressString("getVertex toColorSpace VertexOutput main symbols visibles ../../../wgsl/use/types name SolidVertex imported imports ../../../wgsl/use/color premultiply modules symbol flags type link attr u32 parameters func vec4<f32> optional externals vertex vertexIndex builtin(vertex_index) instanceIndex builtin(instance_index) identifiers exports linkable VertexOutput builtin position location".split(' '));
const t = {[_(4)]:_([0,1,2,3]),[_(5)]:_([3]),[_(13)]:[{"at":0,[_(7)]:_(6),[_(4)]:_([8]),[_(10)]:[{[_(7)]:_(8),[_(9)]:_(8)}]},{"at":0,[_(7)]:_(11),[_(4)]:_([12]),[_(10)]:[{[_(7)]:_(12),[_(9)]:_(12)}]}],[_(24)]:[{"at":100,[_(14)]:_(0),[_(15)]:2,[_(21)]:{[_(7)]:_(0),[_(16)]:_(8),[_(18)]:_([17]),[_(20)]:[{[_(7)]:"v",[_(16)]:_(19)},{[_(7)]:"i",[_(16)]:_(19)}]}},{"at":155,[_(14)]:_(1),[_(15)]:6,[_(21)]:{[_(7)]:_(1),[_(16)]:_(22),[_(18)]:_([23,17]),[_(20)]:[{[_(7)]:"c",[_(16)]:_(22)}]}}],[_(31)]:[{"at":451,[_(14)]:_(3),[_(15)]:1,[_(21)]:{[_(7)]:_(3),[_(16)]:_(2),[_(18)]:_([25]),[_(20)]:[{[_(7)]:_(26),[_(16)]:_(19),[_(18)]:_([27])},{[_(7)]:_(28),[_(16)]:_(19),[_(18)]:_([29])}],[_(30)]:_([2,0,2,1])}}],[_(32)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "vertex/virtual-solid",
  "code": _(["use '",6,"'::{ ",8," };\r\nuse '",11,"'::{ ",12," };\r\n\r\n@",17," fn ",0,"(v: u32, i: u32) -> ",8," {};\r\n@",23," @",17," fn ",1,"(c: ",22,") -> ",22," { return c; }\r\n\r\nstruct ",2," {\r\n  @",34,"(",35,") ",35,": ",22,",\r\n  @",36,"(0) fragColor: ",22,",\r\n  @",36,"(1) fragUV: ",22,",\r\n  @",36,"(2) fragST: ",22,",\r\n  @",36,"(3) fragScissor: ",22,",\r\n};\r\n\r\n@",25,"\r\nfn ",3,"(\r\n  @",34,"(",25,"_index) ",25,"Index: u32,\r\n  @",29," ",28,": u32,\r\n) -> ",2," {\r\n  let v = ",0,"(",25,"Index, ",28,");\r\n\r\n  return ",2,"(\r\n    v.",35,",\r\n    ",1,"(v.color),\r\n    v.uv,\r\n    v.st,\r\n    v.scissor,\r\n  );\r\n}"]).join(''),
  "hash": 4088323173344551,
  "table": t,
  "shake": [[100,[0,3]],[155,[1,3]],[227,[2,3]],[451,[3]]],
  "tree": decompressAST([[1,0,46],[1,49,95],[1,51,103],[4,55,127,1],[1,0,9],[1,10,15],[2,9,21],[0,53,272],[2,11,23],[3,18,36],[3,43,55],[3,38,50],[3,35,47],[3,35,47],[0,44,342],[3,0,7],[2,12,16],[3,9,31],[3,44,68],[2,51,63],[2,26,35],[2,51,63],[2,36,48]], t[S]),
};
const libs = {"../../../wgsl/use/types": m0, "../../../wgsl/use/color": m1};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
