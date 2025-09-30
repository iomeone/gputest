/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getTargetMapping getSourceMapping getScratchTexture scratchTexture atlasTexture pmremCopy vec4<u32> link vec2<f32> level f32 void compute export globalId vec3<u32> builtin(global_invocation_id) globalId mapping sample".split(' '));
const table = {[S]:_([0,1,2,3,4,5]),[W]:_([5]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(6),[Z]:_([7])}},{[A]:46,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:_(6),[Z]:_([7])}},{[A]:94,[R]:_(2),[G]:2,[F]:{[N]:_(2),[T]:C,[Z]:_([7]),[P]:[{[N]:"uv",[T]:_(8)},{[N]:_(9),[T]:_(10)}]}},{[A]:165,[R]:_(3),[G]:2,[V]:{[N]:_(3),[T]:"texture_storage_2d<rgba16float, write>",[Z]:_([7])}},{[A]:232,[R]:_(4),[G]:2,[V]:{[N]:_(4),[T]:"texture_storage_2d<rgba16float, write>",[Z]:_([7])}}],[E]:[{[A]:299,[R]:_(5),[G]:1,[F]:{[N]:_(5),[T]:_(11),[Z]:_([12,"workgroup_size(8, 8)",13]),[P]:[{[N]:_(14),[T]:_(15),[Z]:_([16])}],[I]:_([0,1,2,4,3])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true,[_(4)]:true}};
const data = {
  name: "pmrem/pmrem-copy.wgsl",
  code: _(["@",7," fn ",0,"() -> ",6," {};\r\n@",7," fn ",1,"() -> ",6," {};\r\n\r\n@",7," fn ",2,"(uv: ",8,", ",9,": f32) -> ",C,";\r\n\r\n@",7," var ",3,": texture_storage_2d<rgba16float, write>;\r\n@",7," var ",4,": texture_storage_2d<rgba16float, write>;\r\n\r\n@",12," @workgroup_size(8, 8)\r\n@",13," fn ",5,"(\r\n  @",16," ",14,": ",15,",\r\n) {\r\n  let ",18," = ",0,"();\r\n  let size = ",18,".zw - ",18,".xy;\r\n\r\n  if (any(",14,".xy >= vec2<u32>(size))) { return; }\r\n\r\n  let xyi = vec2<u32>(",14,".xy);\r\n  let uv = ",8,"(xyi) / ",8,"(size - 1);\r\n  let uvo = uv;\r\n\r\n  var ",19,": ",C,";\r\n  {\r\n    let ",18," = ",1,"();\r\n    let size = ",18,".zw - ",18,".xy;\r\n\r\n    let uv2 = uvo * ",8,"(size - 1) + 0.5;\r\n    ",19," = ",2,"(uv2, 0.0);\r\n  }\r\n\r\n  textureStore(",4,", xyi + ",18,".xy, ",19,");\r\n  textureStore(",3,", xyi, ",19,");\r\n}\n"]).join(''),
  hash: 0x3ccd2f33ef6de,
  table,
  shake: [[0,[0,5]],[46,[1,5]],[94,[2,5]],[165,[3,5]],[232,[4,5]],[299,[5]]],
  tree: decompressAST([[1,0,43],[1,46,89],[1,48,114],[1,71,136],[1,67,130],[0,67,739],[3,0,8],[3,9,30],[1,23,30],[2,11,20],[3,14,44],[2,74,90],[2,275,291],[2,125,142],[2,52,64],[2,57,71]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const pmremCopy = getSymbol("pmremCopy");
