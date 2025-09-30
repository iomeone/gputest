/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/codec/octahedralwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getTargetMapping getSourceMapping getScratchTexture scratchTexture atlasTexture pmremCopy ../../wgsl/codec/octahedral wrapOctahedral decodeOctahedral vec4<u32> link vec2<f32> level f32 void compute export globalId vec3<u32> builtin(global_invocation_id) globalId mapping sample".split(' '));
const table = {[S]:_([0,1,2,3,4,5]),[W]:_([5]),[O]:[{[A]:0,[N]:_(6),[S]:_([7,8]),[K]:[{[N]:_(7),[J]:_(7)},{[N]:_(8),[J]:_(8)}]}],[X]:[{[A]:76,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(9),[Z]:_([10])}},{[A]:122,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:_(9),[Z]:_([10])}},{[A]:170,[R]:_(2),[G]:2,[F]:{[N]:_(2),[T]:C,[Z]:_([10]),[P]:[{[N]:"uv",[T]:_(11)},{[N]:_(12),[T]:_(13)}]}},{[A]:241,[R]:_(3),[G]:2,[V]:{[N]:_(3),[T]:"texture_storage_2d<rgba16float, write>",[Z]:_([10])}},{[A]:308,[R]:_(4),[G]:2,[V]:{[N]:_(4),[T]:"texture_storage_2d<rgba16float, write>",[Z]:_([10])}}],[E]:[{[A]:375,[R]:_(5),[G]:1,[F]:{[N]:_(5),[T]:_(14),[Z]:_([15,"workgroup_size(8, 8)",16]),[P]:[{[N]:_(17),[T]:_(18),[Z]:_([19])}],[I]:_([0,1,2,4,3])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true,[_(4)]:true}};
const data = {
  name: "pmrem/pmrem-copy.wgsl",
  code: _(["use '",6,"'::{ ",7,", ",8," };\r\n\r\n@",10," fn ",0,"() -> ",9," {};\r\n@",10," fn ",1,"() -> ",9," {};\r\n\r\n@",10," fn ",2,"(uv: ",11,", ",12,": f32) -> ",C,";\r\n\r\n@",10," var ",3,": texture_storage_2d<rgba16float, write>;\r\n@",10," var ",4,": texture_storage_2d<rgba16float, write>;\r\n\r\n@",15," @workgroup_size(8, 8)\r\n@",16," fn ",5,"(\r\n  @",19," ",17,": ",18,",\r\n) {\r\n  let ",21," = ",0,"();\r\n  let size = ",21,".zw - ",21,".xy;\r\n\r\n  if (any(",17,".xy >= vec2<u32>(size))) { return; }\r\n\r\n  let xyi = vec2<u32>(",17,".xy);\r\n  let uv = ",11,"(xyi) / ",11,"(size - 1);\r\n  let uvo = uv;\r\n\r\n  var ",22,": ",C,";\r\n  {\r\n    let ",21," = ",1,"();\r\n    let size = ",21,".zw - ",21,".xy;\r\n\r\n    let uv2 = uvo * ",11,"(size - 1) + 0.5;\r\n    ",22," = ",2,"(uv2, 0.0);\r\n  }\r\n\r\n  textureStore(",4,", xyi + ",21,".xy, ",22,");\r\n  textureStore(",3,", xyi, ",22,");\r\n}\n"]).join(''),
  hash: 0x8ff555a36c229,
  table,
  shake: [[76,[0,5]],[122,[1,5]],[170,[2,5]],[241,[3,5]],[308,[4,5]],[375,[5]]],
  tree: decompressAST([[1,0,71],[1,76,119],[1,46,89],[1,48,114],[1,71,136],[1,67,130],[0,67,739],[3,0,8],[3,9,30],[1,23,30],[2,11,20],[3,14,44],[2,74,90],[2,275,291],[2,125,142],[2,52,64],[2,57,71]], table[S]),
};

const libs = {"../../wgsl/codec/octahedral": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const pmremCopy = getSymbol("pmremCopy");
