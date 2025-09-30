/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../../shader/wgsl";
import m0 from "../../../../../wgsl/use/viewwgsl";
const {} = symbolDictionary;
const _ = decompressString("toColorSpace VertexOutput main symbols visibles ../../../../../wgsl/use/view name worldToClip imported imports modules symbol flags vec4<f32> type optional link attr parameters func externals vertex instanceIndex u32 builtin(instance_index) position location(0) normal location(1) color location(2) vec2<f32> location(3) identifiers exports linkable VertexOutput position location".split(' '));
const t = {[_(3)]:_([0,1,2]),[_(4)]:_([2]),[_(10)]:[{"at":0,[_(6)]:_(5),[_(3)]:_([7]),[_(9)]:[{[_(6)]:_(7),[_(8)]:_(7)}]}],[_(20)]:[{"at":56,[_(11)]:_(0),[_(12)]:6,[_(19)]:{[_(6)]:_(0),[_(14)]:_(13),[_(17)]:_([15,16]),[_(18)]:[{[_(6)]:"c",[_(14)]:_(13)}]}}],[_(34)]:[{"at":357,[_(11)]:_(2),[_(12)]:1,[_(19)]:{[_(6)]:_(2),[_(14)]:_(1),[_(17)]:_([21]),[_(18)]:[{[_(6)]:_(22),[_(14)]:_(23),[_(17)]:_([24])},{[_(6)]:_(25),[_(14)]:_(13),[_(17)]:_([26])},{[_(6)]:_(27),[_(14)]:_(13),[_(17)]:_([28])},{[_(6)]:_(29),[_(14)]:_(13),[_(17)]:_([30])},{[_(6)]:"uv",[_(14)]:_(31),[_(17)]:_([32])}],[_(33)]:_([1,1,0])}}],[_(35)]:{[_(0)]:true}};
const data = {
  "name": "vertex/mesh",
  "code": _(["use '",5,"'::{ ",7," };\r\n\r\n@",15," @",16," fn ",0,"(c: ",13,") -> ",13," { return c; }\r\n\r\nstruct ",1," {\r\n  @builtin(",25,") ",25,": ",13,",\r\n  @",26," fragColor: ",13,",\r\n  @",28," fragUV: ",31,",\r\n  @",30," fragNormal: vec3<f32>,\r\n  @",32," fragPosition: vec3<f32>,\r\n};\r\n\r\n@",21,"\r\nfn ",2,"(\r\n  @",24," ",22,": u32,\r\n  @",26," ",25,": ",13,",\r\n  @",28," ",27,": ",13,",\r\n  @",30," ",29,": ",13,",\r\n  @",32," uv: ",31,",\r\n) -> ",1," {\r\n\r\n  var outPosition: ",13," = ",7,"(",25,");\r\n\r\n  return ",1,"(\r\n    outPosition,\r\n    ",0,"(",29,"),\r\n    uv,\r\n    ",27,".xyz,\r\n    ",25,".xyz,\r\n  );\r\n}"]).join(''),
  "hash": 1064537245484560,
  "table": t,
  "shake": [[56,[0,2]],[128,[1,2]],[357,[2]]],
  "tree": decompressAST([[1,0,51],[4,56,128,0],[1,0,9],[1,10,15],[2,9,21],[0,53,277],[2,11,23],[3,18,36],[3,43,55],[3,38,50],[3,35,47],[3,39,51],[0,45,449],[3,0,7],[2,12,16],[3,9,33],[3,48,60],[3,37,49],[3,35,47],[3,34,46],[2,34,46],[2,49,60],[2,35,47],[2,37,49]], t[S]),
};
const libs = {"../../../../../wgsl/use/view": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
