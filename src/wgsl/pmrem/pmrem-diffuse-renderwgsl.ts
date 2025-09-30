/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/codec/octahedralwgsl";
const {} = symbolDictionary;
const _ = decompressString("getTargetMapping shCoefficients atlasTexture pmremDiffuseRender sqr symbols visibles ../../wgsl/codec/octahedral name decodeOctahedral imported imports modules symbol flags vec4<u32> type link attr func array<vec4<f32>> <storage> qual variable externals void compute export globalId vec3<u32> builtin(global_invocation_id) parameters identifiers exports linkable shCoefficients globalId mapping".split(' '));
const t = {[_(5)]:_([0,1,2,3,4]),[_(6)]:_([3]),[_(12)]:[{"at":0,[_(8)]:_(7),[_(5)]:_([9]),[_(11)]:[{[_(8)]:_(9),[_(10)]:_(9)}]}],[_(24)]:[{"at":60,[_(13)]:_(0),[_(14)]:2,[_(19)]:{[_(8)]:_(0),[_(16)]:_(15),[_(18)]:_([17])}},{"at":108,[_(13)]:_(1),[_(14)]:2,[_(23)]:{[_(8)]:_(1),[_(16)]:_(20),[_(18)]:_([17]),[_(22)]:_(21)}},{"at":162,[_(13)]:_(2),[_(14)]:2,[_(23)]:{[_(8)]:_(2),[_(16)]:"texture_storage_2d<rgba16float, write>",[_(18)]:_([17])}}],[_(33)]:[{"at":229,[_(13)]:_(3),[_(14)]:1,[_(19)]:{[_(8)]:_(3),[_(16)]:_(25),[_(18)]:_([26,"workgroup_size(8, 8)",27]),[_(31)]:[{[_(8)]:_(28),[_(16)]:_(29),[_(18)]:_([30])}],[_(32)]:_([0,1,4,2])}}],[_(34)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  "name": "pmrem/pmrem-diffuse-render",
  "code": _(["use '",7,"'::{ ",9," };\r\n\r\n@",17," fn ",0,"() -> ",15," {};\r\n\r\n@",17," var",21," ",1,": ",20,";\r\n@",17," var ",2,": texture_storage_2d<rgba16float, write>;\r\n\r\n@",26," @workgroup_size(8, 8)\r\n@",27," fn ",3,"(\r\n  @",30," ",28,": ",29,",\r\n) {\r\n  let ",37," = ",0,"();\r\n  let size = ",37,".zw - ",37,".xy;\r\n\r\n  if (any(",28,".xy >= vec2<u32>(size))) { return; }\r\n\r\n  let xyi = vec2<u32>(",28,".xy);\r\n  let uv = vec2<f32>(xyi) / vec2<f32>(size - 1);\r\n  let ray = ",9,"(uv * 2.0 - 1.0);\r\n\r\n  let sample = (\r\n    ",1,"[0] +\r\n    ",1,"[1] * ray.y +\r\n    ",1,"[2] * ray.z +\r\n    ",1,"[3] * ray.x +\r\n    ",1,"[4] * ray.y * ray.x +\r\n    ",1,"[5] * ray.y * ray.z +\r\n    ",1,"[6] * (3.0 * sqr(ray.z) - 1.0) +\r\n    ",1,"[7] * ray.x * ray.z +\r\n    ",1,"[8] * (sqr(ray.x) - sqr(ray.y))\r\n  );\r\n\r\n  textureStore(",2,", xyi + ",37,".xy, sample);\r\n}\r\n\r\nfn sqr(x: f32) -> f32 { return x * x; }"]).join(''),
  "hash": 8279160108693601,
  "table": t,
  "shake": [[60,[0,3]],[108,[1,3]],[162,[2,3]],[229,[3]],[1059,[4,3]]],
  "tree": decompressAST([[1,0,55],[1,60,103],[1,48,100],[1,54,117],[0,67,897],[3,0,8],[3,9,30],[1,23,30],[2,11,29],[3,23,53],[2,74,90],[2,219,235],[2,59,73],[2,25,39],[2,33,47],[2,33,47],[2,33,47],[2,41,55],[2,41,55],[2,27,30],[2,25,39],[2,41,55],[2,21,24],[2,13,16],[2,36,48],[0,43,86],[2,7,10]], t[S]),
};
const libs = {"../../wgsl/codec/octahedral": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const pmremDiffuseRender = getSymbol("pmremDiffuseRender");
