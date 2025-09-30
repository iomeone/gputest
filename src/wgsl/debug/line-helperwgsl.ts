/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("counter positions colors segments emitPoint emitLine symbols visibles symbol flags name atomic<u32> type link attr qual variable array<vec4<f32>> array<i32> externals void export vec3<f32> parameters identifiers func exports linkable storage read_write counter positions colors segments".split(' '));
const t = {[_(6)]:_([0,1,2,3,4,5]),[_(7)]:_([4,5]),[_(19)]:[{"at":0,[_(8)]:_(0),[_(9)]:2,[_(16)]:{[_(10)]:_(0),[_(12)]:_(11),[_(14)]:_([13]),[_(15)]:"<storage, read_write>"}},{"at":54,[_(8)]:_(1),[_(9)]:2,[_(16)]:{[_(10)]:_(1),[_(12)]:_(17),[_(14)]:_([13]),[_(15)]:"<storage, read_write>"}},{"at":115,[_(8)]:_(2),[_(9)]:2,[_(16)]:{[_(10)]:_(2),[_(12)]:_(17),[_(14)]:_([13]),[_(15)]:"<storage, read_write>"}},{"at":173,[_(8)]:_(3),[_(9)]:2,[_(16)]:{[_(10)]:_(3),[_(12)]:_(18),[_(14)]:_([13]),[_(15)]:"<storage, read_write>"}}],[_(26)]:[{"at":229,[_(8)]:_(4),[_(9)]:1,[_(25)]:{[_(10)]:_(4),[_(12)]:_(20),[_(14)]:_([21]),[_(23)]:[{[_(10)]:"p",[_(12)]:_(22)},{[_(10)]:"c",[_(12)]:_(22)}],[_(24)]:_([0,1,2,3])}},{"at":429,[_(8)]:_(5),[_(9)]:1,[_(25)]:{[_(10)]:_(5),[_(12)]:_(20),[_(14)]:_([21]),[_(23)]:[{[_(10)]:"a",[_(12)]:_(22)},{[_(10)]:"b",[_(12)]:_(22)},{[_(10)]:"c",[_(12)]:_(22)}],[_(24)]:_([0,1,2,3])}}],[_(27)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true}};
const data = {
  "name": "debug/line-helper",
  "code": _(["@",13," var<",28,", ",29,"> ",0,": ",11,";\r\n@",13," var<",28,", ",29,"> ",1,": ",17,";\r\n@",13," var<",28,", ",29,"> ",2,": ",17,";\r\n@",13," var<",28,", ",29,"> ",3,": ",18,";\r\n\r\n@",21," fn ",4,"(p: ",22,", c: ",22,") {\r\n  let index = atomicAdd(&",0,", 1u);\r\n  ",1,"[index] = vec4<f32>(p, 1.0);\r\n  ",2,"[index] = vec4<f32>(c, 1.0);\r\n  ",3,"[index] = 0;\r\n}\r\n\r\n@",21," fn ",5,"(a: ",22,", b: ",22,", c: ",22,") {\r\n  let index = atomicAdd(&",0,", 2u);\r\n  ",1,"[index] = vec4<f32>(a, 1.0);\r\n  ",1,"[index + 1] = vec4<f32>(b, 1.0);\r\n  ",2,"[index] = vec4<f32>(c, 1.0);\r\n  ",2,"[index + 1] = vec4<f32>(c, 1.0);\r\n  ",3,"[index] = 1;\r\n  ",3,"[index + 1] = 2;\r\n}"]).join(''),
  "hash": 518166023813663,
  "table": t,
  "shake": [[0,[0,4,5]],[54,[1,4,5]],[115,[2,4,5]],[173,[3,4,5]],[229,[4]],[429,[5]]],
  "tree": decompressAST([[1,0,52],[1,54,113],[1,61,117],[1,58,110],[0,56,252],[1,0,7],[2,11,20],[2,66,73],[2,17,26],[2,41,47],[2,38,46],[0,27,351],[1,0,7],[2,11,19],[2,79,86],[2,17,26],[2,41,50],[2,45,51],[2,38,44],[2,42,50],[2,24,32]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const emitPoint = getSymbol("emitPoint");
export const emitLine = getSymbol("emitLine");
