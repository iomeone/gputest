/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/typeswgsl";
const {} = symbolDictionary;
const _ = decompressString("getVertex toColorSpace VertexOutput main symbols visibles ../../../wgsl/use/types name UIVertex imported imports modules symbol flags type link attr u32 parameters func vec4<f32> optional externals vertex vertexIndex builtin(vertex_index) instanceIndex builtin(instance_index) identifiers exports linkable toColorSpace VertexOutput builtin position location interpolate".split(' '));
const t = {[_(4)]:_([0,1,2,3]),[_(5)]:_([3]),[_(11)]:[{"at":0,[_(7)]:_(6),[_(4)]:_([8]),[_(10)]:[{[_(7)]:_(8),[_(9)]:_(8)}]}],[_(22)]:[{"at":48,[_(12)]:_(0),[_(13)]:2,[_(19)]:{[_(7)]:_(0),[_(14)]:_(8),[_(16)]:_([15]),[_(18)]:[{[_(7)]:"v",[_(14)]:_(17)},{[_(7)]:"i",[_(14)]:_(17)}]}},{"at":100,[_(12)]:_(1),[_(13)]:6,[_(19)]:{[_(7)]:_(1),[_(14)]:_(20),[_(16)]:_([21,15]),[_(18)]:[{[_(7)]:"c",[_(14)]:_(20)}]}}],[_(29)]:[{"at":1016,[_(12)]:_(3),[_(13)]:1,[_(19)]:{[_(7)]:_(3),[_(14)]:_(2),[_(16)]:_([23]),[_(18)]:[{[_(7)]:_(24),[_(14)]:_(17),[_(16)]:_([25])},{[_(7)]:_(26),[_(14)]:_(17),[_(16)]:_([27])}],[_(28)]:_([2,0,2,1])}}],[_(30)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "vertex/virtual-ui",
  "code": _(["use '",6,"'::{ ",8," };\r\n\r\n@",15," fn ",0,"(v: u32, i: u32) -> ",8," {};\r\n@",21," @",15," fn ",1,"(c: ",20,") -> ",20," { return c; }\r\n\r\nstruct ",2," {\r\n  @",33,"(",34,")               ",34,": ",20,",\r\n  @",35,"(0)                     fragUV: vec2<f32>,\r\n  @",35,"(1)                     fragTextureUV: vec2<f32>,\r\n  @",35,"(2)                     fragTextureST: vec2<f32>,\r\n  @",35,"(3)                     fragClipUV: ",20,",\r\n  @",35,"(4)                     fragSDFUV: vec2<f32>,\r\n  @",35,"(5)  @",36,"(flat) fragSDFConfig: ",20,",\r\n  @",35,"(6)  @",36,"(flat) fragRepeat: i32,\r\n  @",35,"(7)  @",36,"(flat) fragMode: i32,\r\n  @",35,"(8)  @",36,"(flat) fragShape: ",20,",\r\n  @",35,"(9)  @",36,"(flat) fragRadius: ",20,",\r\n  @",35,"(10) @",36,"(flat) fragBorder: ",20,",\r\n  @",35,"(11) @",36,"(flat) fragStroke: ",20,",\r\n  @",35,"(12) @",36,"(flat) fragFill: ",20,",\r\n};\r\n\r\n@",23,"\r\nfn ",3,"(\r\n  @",33,"(",23,"_index) ",23,"Index: u32,\r\n  @",27," ",26,": u32,\r\n) -> ",2," {\r\n  var v = ",0,"(",23,"Index, ",26,");\r\n\r\n  return ",2,"(\r\n    v.",34,",\r\n\r\n    v.uv,\r\n    v.textureUV,\r\n    v.textureST,\r\n    v.clipUV,\r\n    v.sdfUV,\r\n    v.sdfConfig,\r\n    v.repeat,\r\n    v.mode,\r\n    v.shape,\r\n    v.radius,\r\n    v.border,\r\n    ",1,"(v.stroke),\r\n    ",1,"(v.fill),\r\n  );\r\n}"]).join(''),
  "hash": 3489707639041581,
  "table": t,
  "shake": [[48,[0,3]],[100,[1,3]],[172,[2,3]],[1016,[3]]],
  "tree": decompressAST([[1,0,43],[1,48,97],[4,52,124,1],[1,0,9],[1,10,15],[2,9,21],[0,53,892],[2,11,23],[3,18,36],[3,57,69],[3,55,67],[3,62,74],[3,62,74],[3,59,71],[3,58,70],[3,14,32],[3,48,60],[3,14,32],[3,39,51],[3,14,32],[3,37,49],[3,14,32],[3,44,56],[3,14,32],[3,45,58],[3,14,32],[3,45,58],[3,14,32],[3,45,58],[3,14,32],[0,47,503],[3,0,7],[2,12,16],[3,9,31],[3,44,68],[2,51,63],[2,26,35],[2,51,63],[2,204,216],[2,29,41]], t[S]),
};
const libs = {"../../../wgsl/use/types": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
