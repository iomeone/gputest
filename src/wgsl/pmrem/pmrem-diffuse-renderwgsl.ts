/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/codec/octahedralwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getTargetMapping shCoefficients atlasTexture pmremDiffuseRender sqr ../../wgsl/codec/octahedral decodeOctahedral vec4<u32> link array<vec4<f32>> <storage> void compute export globalId vec3<u32> builtin(global_invocation_id) shCoefficients globalId mapping".split(' '));
const table = {[S]:_([0,1,2,3,4]),[W]:_([3]),[O]:[{[A]:0,[N]:_(5),[S]:_([6]),[K]:[{[N]:_(6),[J]:_(6)}]}],[X]:[{[A]:60,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(7),[Z]:_([8])}},{[A]:108,[R]:_(1),[G]:2,[V]:{[N]:_(1),[T]:_(9),[Z]:_([8]),[Q]:_(10)}},{[A]:162,[R]:_(2),[G]:2,[V]:{[N]:_(2),[T]:"texture_storage_2d<rgba16float, write>",[Z]:_([8])}}],[E]:[{[A]:229,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(11),[Z]:_([12,"workgroup_size(8, 8)",13]),[P]:[{[N]:_(14),[T]:_(15),[Z]:_([16])}],[I]:_([0,1,4,2])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  name: "pmrem/pmrem-diffuse-render.wgsl",
  code: _(["use '",5,"'::{ ",6," };\r\n\r\n@",8," fn ",0,"() -> ",7," {};\r\n\r\n@",8," var",10," ",1,": ",9,";\r\n@",8," var ",2,": texture_storage_2d<rgba16float, write>;\r\n\r\n@",12," @workgroup_size(8, 8)\r\n@",13," fn ",3,"(\r\n  @",16," ",14,": ",15,",\r\n) {\r\n  let ",19," = ",0,"();\r\n  let size = ",19,".zw - ",19,".xy;\r\n\r\n  if (any(",14,".xy >= vec2<u32>(size))) { return; }\r\n\r\n  let xyi = vec2<u32>(",14,".xy);\r\n  let uv = vec2<f32>(xyi) / vec2<f32>(size - 1);\r\n  let ray = ",6,"(uv * 2.0 - 1.0);\r\n\r\n  let sample = (\r\n    ",1,"[0] +\r\n    ",1,"[1] * ray.y +\r\n    ",1,"[2] * ray.z +\r\n    ",1,"[3] * ray.x +\r\n    ",1,"[4] * ray.y * ray.x +\r\n    ",1,"[5] * ray.y * ray.z +\r\n    ",1,"[6] * (3.0 * sqr(ray.z) - 1.0) +\r\n    ",1,"[7] * ray.x * ray.z +\r\n    ",1,"[8] * (sqr(ray.x) - sqr(ray.y))\r\n  );\r\n\r\n  textureStore(",2,", xyi + ",19,".xy, sample);\r\n}\r\n\r\nfn sqr(x: f32) -> f32 { return x * x; }\n"]).join(''),
  hash: 0x1abfccc2596f76,
  table,
  shake: [[60,[0,3]],[108,[1,3]],[162,[2,3]],[229,[3]],[1059,[4,3]]],
  tree: decompressAST([[1,0,55],[1,60,103],[1,48,100],[1,54,117],[0,67,897],[3,0,8],[3,9,30],[1,23,30],[2,11,29],[3,23,53],[2,74,90],[2,219,235],[2,59,73],[2,25,39],[2,33,47],[2,33,47],[2,33,47],[2,41,55],[2,41,55],[2,27,30],[2,25,39],[2,41,55],[2,21,24],[2,13,16],[2,36,48],[0,43,86],[2,7,10]], table[S]),
};

const libs = {"../../wgsl/codec/octahedral": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const pmremDiffuseRender = getSymbol("pmremDiffuseRender");
