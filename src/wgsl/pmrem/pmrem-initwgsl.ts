/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/codec/octahedralwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getTargetMapping getCubeMap scratchTexture atlasTexture textureDump pmremInit ../../wgsl/codec/octahedral decodeOctahedral vec4<u32> link optional uvw level f32 array<vec4<f32>> void compute export globalId vec3<u32> builtin(global_invocation_id) globalId mapping sample".split(' '));
const table = {[S]:_([0,1,2,3,4,5]),[W]:_([5]),[O]:[{[A]:0,[N]:_(6),[S]:_([7]),[K]:[{[N]:_(7),[J]:_(7)}]}],[X]:[{[A]:60,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(8),[Z]:_([9])}},{[A]:108,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:C,[Z]:_([10,9]),[P]:[{[N]:_(11),[T]:D},{[N]:_(12),[T]:_(13)}]}},{[A]:210,[R]:_(2),[G]:2,[V]:{[N]:_(2),[T]:"texture_storage_2d<rgba16float, write>",[Z]:_([9])}},{[A]:277,[R]:_(3),[G]:2,[V]:{[N]:_(3),[T]:"texture_storage_2d<rgba16float, write>",[Z]:_([9])}},{[A]:344,[R]:_(4),[G]:2,[V]:{[N]:_(4),[T]:_(14),[Z]:_([9]),[Q]:"<storage, read_write>"}}],[E]:[{[A]:470,[R]:_(5),[G]:1,[F]:{[N]:_(5),[T]:_(15),[Z]:_([16,"workgroup_size(8, 8)",17]),[P]:[{[N]:_(18),[T]:_(19),[Z]:_([20])}],[I]:_([0,1,4,3,2])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true,[_(4)]:true}};
const data = {
  name: "pmrem/pmrem-init.wgsl",
  code: _(["use '",6,"'::{ ",7," };\r\n\r\n@",9," fn ",0,"() -> ",8," {};\r\n\r\n@",10," @",9," fn ",1,"(uvw: ",D,", ",12,": f32) -> ",C," { return ",C,"(0.0); };\r\n\r\n@",9," var ",2,": texture_storage_2d<rgba16float, write>;\r\n@",9," var ",3,": texture_storage_2d<rgba16float, write>;\r\n\r\n@",9," var<storage, read_write> ",4,": ",14,";\r\n\r\n//@",9," fn getScratchTexture(uv: vec2<f32>) -> ",C,";\r\n\r\n@",16," @workgroup_size(8, 8)\r\n@",17," fn ",5,"(\r\n  @",20," ",18,": ",19,",\r\n) {\r\n  let ",22," = ",0,"();\r\n  let size = ",22,".zw - ",22,".xy;\r\n\r\n  if (any(",18,".xy >= vec2<u32>(size))) { return; }\r\n\r\n  let xyi = vec2<u32>(",18,".xy);\r\n  let uv = vec2<f32>(xyi) / vec2<f32>(size - 1);\r\n  let uvo = (uv * 2.0 - 1.0);\r\n\r\n  let ray = ",7,"(uvo);\r\n  let ",23," = ",1,"(ray, 0.0);\r\n\r\n  let xyi4 = xyi / 4;\r\n  let index = xyi4.x + xyi4.y * 256;\r\n  ",4,"[index] = ",23,";\r\n\r\n  textureStore(",3,", xyi + ",22,".xy, ",23,");\r\n  textureStore(",2,", xyi, ",23,");\r\n}\n"]).join(''),
  hash: 0xebfad2333a67c,
  table,
  shake: [[60,[0,5]],[108,[1,5]],[210,[2,5]],[277,[3,5]],[344,[4,5]],[470,[5]]],
  tree: decompressAST([[1,0,55],[1,60,103],[4,48,145,1],[1,0,9],[1,10,15],[2,9,19],[1,83,148],[1,67,130],[1,67,128],[0,126,772],[3,0,8],[3,9,30],[1,23,30],[2,11,20],[3,14,44],[2,74,90],[2,252,268],[2,39,49],[2,88,99],[2,47,59],[2,57,71]], table[S]),
};

const libs = {"../../wgsl/codec/octahedral": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const pmremInit = getSymbol("pmremInit");
