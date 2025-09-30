/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/typeswgsl";
const {} = symbolDictionary;
const _ = decompressString("getVertex toColorSpace VertexOutput main symbols visibles ../../../wgsl/use/types name ShadedVertex imported imports modules symbol flags type link attr u32 parameters func vec4<f32> optional externals vertex vertexIndex builtin(vertex_index) instanceIndex builtin(instance_index) identifiers exports linkable VertexOutput builtin position location".split(' '));
const t = {[_(4)]:_([0,1,2,3]),[_(5)]:_([3]),[_(11)]:[{"at":0,[_(7)]:_(6),[_(4)]:_([8]),[_(10)]:[{[_(7)]:_(8),[_(9)]:_(8)}]}],[_(22)]:[{"at":52,[_(12)]:_(0),[_(13)]:2,[_(19)]:{[_(7)]:_(0),[_(14)]:_(8),[_(16)]:_([15]),[_(18)]:[{[_(7)]:"v",[_(14)]:_(17)},{[_(7)]:"i",[_(14)]:_(17)}]}},{"at":108,[_(12)]:_(1),[_(13)]:6,[_(19)]:{[_(7)]:_(1),[_(14)]:_(20),[_(16)]:_([21,15]),[_(18)]:[{[_(7)]:"c",[_(14)]:_(20)}]}}],[_(29)]:[{"at":524,[_(12)]:_(3),[_(13)]:1,[_(19)]:{[_(7)]:_(3),[_(14)]:_(2),[_(16)]:_([23]),[_(18)]:[{[_(7)]:_(24),[_(14)]:_(17),[_(16)]:_([25])},{[_(7)]:_(26),[_(14)]:_(17),[_(16)]:_([27])}],[_(28)]:_([2,0,2,1])}}],[_(30)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "vertex/virtual-shaded",
  "code": _(["use '",6,"'::{ ",8," };\r\n\r\n@",15," fn ",0,"(v: u32, i: u32) -> ",8," {};\r\n@",21," @",15," fn ",1,"(c: ",20,") -> ",20," { return c; }\r\n\r\nstruct ",2," {\r\n  @",32,"(",33,") ",33,": ",20,",\r\n  @",34,"(0) fragColor: ",20,",\r\n  @",34,"(1) fragUV: ",20,",\r\n  @",34,"(2) fragST: ",20,",\r\n  @",34,"(3) fragNormal: ",20,",\r\n  @",34,"(4) fragTangent: ",20,",\r\n  @",34,"(5) fragPosition: ",20,",\r\n  @",34,"(6) fragScissor: ",20,",\r\n};\r\n\r\n@",23,"\r\nfn ",3,"(\r\n  @",32,"(",23,"_index) ",23,"Index: u32,\r\n  @",27," ",26,": u32,\r\n) -> ",2," {\r\n  let v = ",0,"(",23,"Index, ",26,");\r\n\r\n  return ",2,"(\r\n    v.",33,",\r\n    ",1,"(v.color),\r\n    v.uv,\r\n    v.st,\r\n    v.normal,\r\n    v.tangent,\r\n    v.world,\r\n    v.scissor,\r\n  );\r\n}"]).join(''),
  "hash": 1075629760094360,
  "table": t,
  "shake": [[52,[0,3]],[108,[1,3]],[180,[2,3]],[524,[3]]],
  "tree": decompressAST([[1,0,47],[1,52,105],[4,56,128,1],[1,0,9],[1,10,15],[2,9,21],[0,53,392],[2,11,23],[3,18,36],[3,43,55],[3,38,50],[3,35,47],[3,35,47],[3,39,51],[3,40,52],[3,41,53],[0,44,387],[3,0,7],[2,12,16],[3,9,31],[3,44,68],[2,51,63],[2,26,35],[2,51,63],[2,36,48]], t[S]),
};
const libs = {"../../../wgsl/use/types": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
