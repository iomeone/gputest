/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/typeswgsl";
const {} = symbolDictionary;
const _ = decompressString("getVertex VertexOutput VertexOutputWithDepth main mainWithDepth symbols visibles ../../../wgsl/use/types name SolidVertex imported imports modules symbol flags type link attr u32 parameters func externals vertex vertexIndex builtin(vertex_index) instanceIndex builtin(instance_index) identifiers export exports linkable getVertex VertexOutput builtin position location VertexOutputWithDepth vertexIndex instanceIndex".split(' '));
const t = {[_(5)]:_([0,1,2,3,4]),[_(6)]:_([3,4]),[_(12)]:[{"at":0,[_(8)]:_(7),[_(5)]:_([9]),[_(11)]:[{[_(8)]:_(9),[_(10)]:_(9)}]}],[_(21)]:[{"at":51,[_(13)]:_(0),[_(14)]:2,[_(20)]:{[_(8)]:_(0),[_(15)]:_(9),[_(17)]:_([16]),[_(19)]:[{[_(8)]:"v",[_(15)]:_(18)},{[_(8)]:"i",[_(15)]:_(18)}]}}],[_(29)]:[{"at":586,[_(13)]:_(3),[_(14)]:1,[_(20)]:{[_(8)]:_(3),[_(15)]:_(1),[_(17)]:_([22]),[_(19)]:[{[_(8)]:_(23),[_(15)]:_(18),[_(17)]:_([24])},{[_(8)]:_(25),[_(15)]:_(18),[_(17)]:_([26])}],[_(27)]:_([1,0,1])}},{"at":876,[_(13)]:_(4),[_(14)]:1,[_(20)]:{[_(8)]:_(4),[_(15)]:_(2),[_(17)]:_([22,28]),[_(19)]:[{[_(8)]:_(23),[_(15)]:_(18),[_(17)]:_([24])},{[_(8)]:_(25),[_(15)]:_(18),[_(17)]:_([26])}],[_(27)]:_([2,0,2])}}],[_(30)]:{[_(0)]:true}};
const data = {
  "name": "vertex/virtual-depth",
  "code": _(["use '",7,"'::{ ",9," };\r\n\r\n@",16," fn ",0,"(v: u32, i: u32) -> ",9," {};\r\n\r\nstruct ",1," {\r\n  @",33,"(",34,") ",34,": vec4<f32>,\r\n  @",35,"(0) fragAlpha: f32,\r\n  @",35,"(1) fragUV: vec4<f32>,\r\n  @",35,"(2) fragST: vec4<f32>,\r\n  @",35,"(3) fragScissor: vec4<f32>,\r\n};\r\n\r\nstruct ",1,"WithDepth {\r\n  @",33,"(",34,") ",34,": vec4<f32>,\r\n  @",35,"(0) fragAlpha: f32,\r\n  @",35,"(1) fragUV: vec4<f32>,\r\n  @",35,"(2) fragST: vec4<f32>,\r\n  @",35,"(3) fragPosition: vec4<f32>,\r\n  @",35,"(4) fragScissor: vec4<f32>,\r\n};\r\n\r\n@",22,"\r\nfn ",3,"(\r\n  @",33,"(",22,"_index) ",22,"Index: u32,\r\n  @",26," ",25,": u32,\r\n) -> ",1," {\r\n  let v = ",0,"(",22,"Index, ",25,");\r\n\r\n  return ",1,"(\r\n    v.",34,",\r\n    v.color.a,\r\n    v.uv,\r\n    v.st,\r\n    v.scissor,\r\n  );\r\n}\r\n\r\n@",22,"\r\n@",28," fn ",3,"WithDepth(\r\n  @",33,"(",22,"_index) ",22,"Index: u32,\r\n  @",26," ",25,": u32,\r\n) -> ",1,"WithDepth {\r\n  let v = ",0,"(",22,"Index, ",25,");\r\n\r\n  return ",1,"WithDepth(\r\n    v.",34,",\r\n    v.color.a,\r\n    v.uv,\r\n    v.st,\r\n    v.world,\r\n    v.scissor,\r\n  );\r\n}"]).join(''),
  "hash": 3086833968788598,
  "table": t,
  "shake": [[51,[0,3,4]],[104,[1,3]],[318,[2,4]],[586,[3]],[876,[4]]],
  "tree": decompressAST([[1,0,46],[1,51,103],[0,53,266],[2,11,23],[3,18,36],[3,43,55],[3,32,44],[3,35,47],[3,35,47],[0,40,303],[2,11,32],[3,27,45],[3,43,55],[3,32,44],[3,35,47],[3,35,47],[3,41,53],[0,44,330],[3,0,7],[2,12,16],[3,9,31],[3,44,68],[2,51,63],[2,26,35],[2,51,63],[0,97,432],[3,0,7],[1,9,16],[2,11,24],[3,18,40],[3,44,68],[2,51,72],[2,35,44],[2,51,72]], t[S]),
};
const libs = {"../../../wgsl/use/types": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
export const mainWithDepth = getSymbol("mainWithDepth");
