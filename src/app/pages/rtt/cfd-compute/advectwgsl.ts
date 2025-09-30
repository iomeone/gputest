/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../shader/wgsl";
import m0 from "../../../../wgsl/use/arraywgsl";
const {} = symbolDictionary;
const _ = decompressString("getSize velocityBufferOut velocityBufferIn main symbols visibles ../../../../wgsl/use/array name sizeToModulus2 packIndex2 wrapIndex2 imported imports modules symbol flags vec2<u32> type link attr func array<vec4<f32>> qual variable <storage> externals void compute globalId vec3<u32> builtin(global_invocation_id) parameters identifiers exports linkable packIndex2 wrapIndex2 velocityBufferIn globalId fragmentId modulus center".split(' '));
const t = {[_(4)]:_([0,1,2,3]),[_(5)]:_([3]),[_(13)]:[{"at":0,[_(7)]:_(6),[_(4)]:_([8,9,10]),[_(12)]:[{[_(7)]:_(8),[_(11)]:_(8)},{[_(7)]:_(9),[_(11)]:_(9)},{[_(7)]:_(10),[_(11)]:_(10)}]}],[_(25)]:[{"at":81,[_(14)]:_(0),[_(15)]:2,[_(20)]:{[_(7)]:_(0),[_(17)]:_(16),[_(19)]:_([18])}},{"at":120,[_(14)]:_(1),[_(15)]:2,[_(23)]:{[_(7)]:_(1),[_(17)]:_(21),[_(19)]:_([18]),[_(22)]:"<storage, read_write>"}},{"at":189,[_(14)]:_(2),[_(15)]:2,[_(23)]:{[_(7)]:_(2),[_(17)]:_(21),[_(19)]:_([18]),[_(22)]:_(24)}}],[_(33)]:[{"at":247,[_(14)]:_(3),[_(15)]:1,[_(20)]:{[_(7)]:_(3),[_(17)]:_(26),[_(19)]:_([27,"workgroup_size(8, 8)"]),[_(31)]:[{[_(7)]:_(28),[_(17)]:_(29),[_(19)]:_([30])}],[_(32)]:_([0,2,1])}}],[_(34)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  "name": "cfd-compute/advect",
  "code": _(["use '",6,"'::{ ",8,", ",9,", ",10," };\r\n\r\n@",18," fn ",0,"() -> ",16," {};\r\n\r\n@",18," var<storage, read_write> ",1,": ",21,";\r\n@",18," var",24," ",2,": ",21,";\r\n\r\n@",27," @workgroup_size(8, 8)\r\nfn ",3,"(\r\n  @",30," ",28,": ",29,",\r\n) {\r\n  let size = ",0,"();\r\n  if (any(",28,".xy >= size)) { return; }\r\n  let ",39," = ",28,".xy;\r\n\r\n  let ",40," = ",8,"(size);\r\n  let ",41," = ",9,"(",39,", ",40,");\r\n\r\n  let sample = ",2,"[",41,"];\r\n  let xy = vec2<f32>(",39,") + sample.xy * f32(TIME_STEP);\r\n\r\n  let xyi = floor(xy);\r\n  let ff = xy - xyi;\r\n  let ij = vec2<i32>(xyi);\r\n\r\n  let tl = ",2,"[",9,"(",10,"(ij + vec2<i32>(0, 0), size), ",40,")];\r\n  let tr = ",2,"[",9,"(",10,"(ij + vec2<i32>(1, 0), size), ",40,")];\r\n  let bl = ",2,"[",9,"(",10,"(ij + vec2<i32>(0, 1), size), ",40,")];\r\n  let br = ",2,"[",9,"(",10,"(ij + vec2<i32>(1, 1), size), ",40,")];\r\n\r\n  let value = mix(mix(tl, tr, ff.x), mix(bl, br, ff.x), ff.y);\r\n  ",1,"[",41,"] = value;\r\n}"]).join(''),
  "hash": 8631227449348967,
  "table": t,
  "shake": [[81,[0,3]],[120,[1,3]],[189,[2,3]],[247,[3]]],
  "tree": decompressAST([[1,0,76],[1,81,115],[1,39,106],[1,69,123],[0,58,1008],[3,0,8],[3,9,30],[2,26,30],[3,9,39],[2,71,78],[2,108,122],[2,38,48],[2,51,67],[2,180,196],[2,17,27],[2,11,21],[2,63,79],[2,17,27],[2,11,21],[2,63,79],[2,17,27],[2,11,21],[2,63,79],[2,17,27],[2,11,21],[2,120,137]], t[S]),
};
const libs = {"../../../../wgsl/use/array": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
