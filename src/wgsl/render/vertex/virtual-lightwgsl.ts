/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/typeswgsl";
const {} = symbolDictionary;
const _ = decompressString("getVertex VertexOutput main symbols visibles ../../../wgsl/use/types name LightVertex imported imports modules symbol flags type link attr u32 parameters func externals vertex vertexIndex builtin(vertex_index) instanceIndex builtin(instance_index) identifiers exports linkable VertexOutput builtin position".split(' '));
const t = {[_(3)]:_([0,1,2]),[_(4)]:_([2]),[_(10)]:[{"at":0,[_(6)]:_(5),[_(3)]:_([7]),[_(9)]:[{[_(6)]:_(7),[_(8)]:_(7)}]}],[_(19)]:[{"at":51,[_(11)]:_(0),[_(12)]:2,[_(18)]:{[_(6)]:_(0),[_(13)]:_(7),[_(15)]:_([14]),[_(17)]:[{[_(6)]:"i",[_(13)]:_(16)}]}}],[_(26)]:[{"at":300,[_(11)]:_(2),[_(12)]:1,[_(18)]:{[_(6)]:_(2),[_(13)]:_(1),[_(15)]:_([20]),[_(17)]:[{[_(6)]:_(21),[_(13)]:_(16),[_(15)]:_([22])},{[_(6)]:_(23),[_(13)]:_(16),[_(15)]:_([24])}],[_(25)]:_([1,0,1])}}],[_(27)]:{[_(0)]:true}};
const data = {
  "name": "vertex/virtual-light",
  "code": _(["use '",5,"'::{ ",7," };\r\n\r\n@",14," fn ",0,"(i: u32) -> ",7," {};\r\n//@optional @",14," fn toColorSpace(c: vec4<f32>) -> vec4<f32> { return c; }\r\n\r\nstruct ",1," {\r\n  @",29,"(",30,") ",30,": vec4<f32>,\r\n  @location(0) @interpolate(flat) lightIndex: u32,\r\n};\r\n\r\n@",20,"\r\nfn ",2,"(\r\n  @",29,"(",20,"_index) ",20,"Index: u32,\r\n  @",24," ",23,": u32,\r\n) -> ",1," {\r\n  let v = ",0,"(",20,"Index, ",23,");\r\n  let p = v.",30,";\r\n\r\n  return ",1,"(\r\n    p,\r\n    v.index,\r\n  );\r\n}"]).join(''),
  "hash": 3546261557242785,
  "table": t,
  "shake": [[51,[0,2]],[96,[1,2]],[300,[2]]],
  "tree": decompressAST([[1,0,46],[1,51,95],[0,45,244],[2,87,99],[3,18,36],[3,43,55],[3,13,31],[0,43,303],[3,0,7],[2,12,16],[3,9,31],[3,44,68],[2,51,63],[2,26,35],[2,74,86]], t[S]),
};
const libs = {"../../../wgsl/use/types": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
