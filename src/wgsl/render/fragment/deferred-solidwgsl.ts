/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/codec/octahedralwgsl";
const {} = symbolDictionary;
const _ = decompressString("GBufferSample getFragment getScissor main symbols visibles ../../../wgsl/codec/octahedral name encodeOctahedral imported imports modules symbol flags vec4<f32> type optional link attr color parameters func scissor externals fragment fragCoord builtin(position) fragColor location(0) fragUV location(1) fragST location(2) fragScissor location(3) identifiers exports linkable GBufferSample location return outColor".split(' '));
const t = {[_(4)]:_([0,1,2,3]),[_(5)]:_([3]),[_(11)]:[{"at":0,[_(7)]:_(6),[_(4)]:_([8]),[_(10)]:[{[_(7)]:_(8),[_(9)]:_(8)}]}],[_(23)]:[{"at":237,[_(12)]:_(1),[_(13)]:6,[_(21)]:{[_(7)]:_(1),[_(15)]:_(14),[_(18)]:_([16,17]),[_(20)]:[{[_(7)]:_(19),[_(15)]:_(14)},{[_(7)]:"uv",[_(15)]:_(14)},{[_(7)]:"st",[_(15)]:_(14)}]}},{"at":350,[_(12)]:_(2),[_(13)]:6,[_(21)]:{[_(7)]:_(2),[_(15)]:_(14),[_(18)]:_([16,17]),[_(20)]:[{[_(7)]:_(19),[_(15)]:_(14)},{[_(7)]:_(22),[_(15)]:_(14)}]}}],[_(36)]:[{"at":452,[_(12)]:_(3),[_(13)]:1,[_(21)]:{[_(7)]:_(3),[_(15)]:_(0),[_(18)]:_([24]),[_(20)]:[{[_(7)]:_(25),[_(15)]:_(14),[_(18)]:_([26])},{[_(7)]:_(27),[_(15)]:_(14),[_(18)]:_([28])},{[_(7)]:_(29),[_(15)]:_(14),[_(18)]:_([30])},{[_(7)]:_(31),[_(15)]:_(14),[_(18)]:_([32])},{[_(7)]:_(33),[_(15)]:_(14),[_(18)]:_([34])}],[_(35)]:_([0,1,2,0])}}],[_(37)]:{[_(1)]:true,[_(2)]:true}};
const data = {
  "name": "fragment/deferred-solid",
  "code": _(["use '",6,"'::{ ",8," };\r\n\r\nstruct ",0," {\r\n  @",28," albedo: ",14,",\r\n  @",30," normal: ",14,",\r\n  @",32," material: ",14,",\r\n  @",34," emissive: ",14,",\r\n};\r\n\r\n@",16," @",17," fn ",1,"(",19,": ",14,", uv: ",14,", st: ",14,") -> ",14," { ",40," ",19,"; }\r\n\r\n@",16," @",17," fn ",2,"(",19,": ",14,", ",22,": ",14,") -> ",14," { ",40," ",19,"; }\r\n\r\n@",24,"\r\nfn ",3,"(\r\n  @",26," ",25,": ",14,",\r\n  @",28," ",27,": ",14,",\r\n  @",30," ",29,": ",14,",\r\n  @",32," ",31,": ",14,",\r\n  @",34," ",33,": ",14,",\r\n) -> ",0," {\r\n\r\n  var ",41," = ",1,"(",27,", ",29,", ",31,");\r\n\r\n  if (HAS_SCISSOR) { ",41," = ",2,"(",41,", ",33,"); }\r\n  if (",41,".a <= 0.0) { discard; }\r\n\r\n  if (",41,".a < 1.0) {\r\n    let bits = vec2<u32>(",25,".xy) % 2;\r\n    let level = (0.5 + f32(bits.x ^ ((bits.x ^ bits.y) << 1))) / 4.0;\r\n    if (",41,".a < level) { discard; }\r\n  }\r\n\r\n  ",40," ",0,"(\r\n    ",14,"(0.0),\r\n    ",14,"(",8,"(vec3<f32>(0.0, 0.0, -1.0)), 0.0, 0.0),\r\n    ",14,"(0.0),\r\n    ",14,"(",41,".rgb, 1.0),\r\n  );\r\n}"]).join(''),
  "hash": 5849378673090214,
  "table": t,
  "shake": [[59,[0,3]],[237,[1,3]],[350,[2,3]],[452,[3]]],
  "tree": decompressAST([[1,0,58],[0,59,232],[2,11,24],[3,19,31],[3,35,47],[3,35,47],[3,37,49],[4,41,150,1],[1,0,9],[1,10,15],[2,9,20],[4,94,192,2],[1,0,9],[1,10,15],[2,9,19],[0,83,863],[3,0,9],[2,14,18],[3,9,27],[3,44,56],[3,38,50],[3,35,47],[3,35,47],[2,43,56],[2,36,47],[2,75,85],[2,280,293],[2,51,67]], t[S]),
};
const libs = {"../../../wgsl/codec/octahedral": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
