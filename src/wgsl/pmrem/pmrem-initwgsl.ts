/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/codec/octahedralwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getTargetMapping getCubeMap scratchTexture atlasTexture textureDump pmremInit ../../wgsl/codec/octahedral wrapOctahedral decodeOctahedral vec4<u32> link optional uvw level f32 array<vec4<f32>> void compute export globalId vec3<u32> builtin(global_invocation_id) globalId mapping sample".split(' '));
const table = {[S]:_([0,1,2,3,4,5]),[W]:_([5]),[O]:[{[A]:0,[N]:_(6),[S]:_([7,8]),[K]:[{[N]:_(7),[J]:_(7)},{[N]:_(8),[J]:_(8)}]}],[X]:[{[A]:76,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(9),[Z]:_([10])}},{[A]:124,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:C,[Z]:_([11,10]),[P]:[{[N]:_(12),[T]:D},{[N]:_(13),[T]:_(14)}]}},{[A]:226,[R]:_(2),[G]:2,[V]:{[N]:_(2),[T]:"texture_storage_2d<rgba16float, write>",[Z]:_([10])}},{[A]:293,[R]:_(3),[G]:2,[V]:{[N]:_(3),[T]:"texture_storage_2d<rgba16float, write>",[Z]:_([10])}},{[A]:360,[R]:_(4),[G]:2,[V]:{[N]:_(4),[T]:_(15),[Z]:_([10]),[Q]:"<storage, read_write>"}}],[E]:[{[A]:486,[R]:_(5),[G]:1,[F]:{[N]:_(5),[T]:_(16),[Z]:_([17,"workgroup_size(8, 8)",18]),[P]:[{[N]:_(19),[T]:_(20),[Z]:_([21])}],[I]:_([0,1,4,3,2])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true,[_(4)]:true}};
const data = {
  name: "pmrem/pmrem-init.wgsl",
  code: _(["use '",6,"'::{ ",7,", ",8," };\r\n\r\n@",10," fn ",0,"() -> ",9," {};\r\n\r\n@",11," @",10," fn ",1,"(uvw: ",D,", ",13,": f32) -> ",C," { return ",C,"(0.0); };\r\n\r\n@",10," var ",2,": texture_storage_2d<rgba16float, write>;\r\n@",10," var ",3,": texture_storage_2d<rgba16float, write>;\r\n\r\n@",10," var<storage, read_write> ",4,": ",15,";\r\n\r\n//@",10," fn getScratchTexture(uv: vec2<f32>) -> ",C,";\r\n\r\n@",17," @workgroup_size(8, 8)\r\n@",18," fn ",5,"(\r\n  @",21," ",19,": ",20,",\r\n) {\r\n  let ",23," = ",0,"();\r\n  let size = ",23,".zw - ",23,".xy;\r\n\r\n  if (any(",19,".xy >= vec2<u32>(size))) { return; }\r\n\r\n  let xyi = vec2<u32>(",19,".xy);\r\n  let uv = vec2<f32>(xyi) / vec2<f32>(size - 1);\r\n  let uvo = (uv * 2.0 - 1.0);\r\n\r\n  let ray = ",8,"(uvo);\r\n  let ",24," = ",1,"(ray, 0.0);\r\n\r\n  let xyi4 = xyi / 4;\r\n  let index = xyi4.x + xyi4.y * 256;\r\n  ",4,"[index] = ",24,";\r\n\r\n  textureStore(",3,", xyi + ",23,".xy, ",24,");\r\n  textureStore(",2,", xyi, ",24,");\r\n}\n"]).join(''),
  hash: 0xdc4a00dc4aa8f,
  table,
  shake: [[76,[0,5]],[124,[1,5]],[226,[2,5]],[293,[3,5]],[360,[4,5]],[486,[5]]],
  tree: decompressAST([[1,0,71],[1,76,119],[4,48,145,1],[1,0,9],[1,10,15],[2,9,19],[1,83,148],[1,67,130],[1,67,128],[0,126,772],[3,0,8],[3,9,30],[1,23,30],[2,11,20],[3,14,44],[2,74,90],[2,252,268],[2,39,49],[2,88,99],[2,47,59],[2,57,71]], table[S]),
};

const libs = {"../../wgsl/codec/octahedral": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const pmremInit = getSymbol("pmremInit");
