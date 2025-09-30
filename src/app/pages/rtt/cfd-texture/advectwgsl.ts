/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../shader/wgsl";
import m0 from "../../../../wgsl/use/arraywgsl";
const {} = symbolDictionary;
const _ = decompressString("getSize velocityTextureOut velocityTextureIn main symbols visibles ../../../../wgsl/use/array name wrapIndex2i imported imports modules symbol flags vec2<u32> type link attr func variable texture_2d<f32> externals void compute globalId vec3<u32> builtin(global_invocation_id) parameters identifiers exports linkable wrapIndex2i velocityTextureIn globalId center textureLoad".split(' '));
const t = {[_(4)]:_([0,1,2,3]),[_(5)]:_([3]),[_(11)]:[{"at":0,[_(7)]:_(6),[_(4)]:_([8]),[_(10)]:[{[_(7)]:_(8),[_(9)]:_(8)}]}],[_(21)]:[{"at":54,[_(12)]:_(0),[_(13)]:2,[_(18)]:{[_(7)]:_(0),[_(15)]:_(14),[_(17)]:_([16])}},{"at":93,[_(12)]:_(1),[_(13)]:2,[_(19)]:{[_(7)]:_(1),[_(15)]:"texture_storage_2d<rgba32float, write>",[_(17)]:_([16])}},{"at":164,[_(12)]:_(2),[_(13)]:2,[_(19)]:{[_(7)]:_(2),[_(15)]:_(20),[_(17)]:_([16])}}],[_(29)]:[{"at":213,[_(12)]:_(3),[_(13)]:1,[_(18)]:{[_(7)]:_(3),[_(15)]:_(22),[_(17)]:_([23,"workgroup_size(8, 8)"]),[_(27)]:[{[_(7)]:_(24),[_(15)]:_(25),[_(17)]:_([26])}],[_(28)]:_([0,2,1])}}],[_(30)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  "name": "cfd-texture/advect",
  "code": _(["use '",6,"'::{ ",8," };\r\n\r\n@",16," fn ",0,"() -> ",14," {};\r\n\r\n@",16," var ",1,": texture_storage_2d<rgba32float, write>;\r\n@",16," var ",2,": ",20,";\r\n\r\n@",23," @workgroup_size(8, 8)\r\nfn ",3,"(\r\n  @",26," ",24,": ",25,",\r\n) {\r\n  let size = ",0,"();\r\n\r\n  if (any(",24,".xy >= size)) { return; }\r\n  let ",34," = vec2<i32>(",24,".xy);\r\n\r\n  let sample = ",35,"(",2,", ",34,", 0);\r\n  let xy = vec2<f32>(",34,") + sample.xy * f32(TIME_STEP);\r\n\r\n  let xyi = floor(xy);\r\n  let ff = xy - xyi;\r\n  let ij = vec2<i32>(xyi);\r\n\r\n  let itl = ",8,"(ij                  , size);\r\n  let itr = ",8,"(ij + vec2<i32>(1, 0), size);\r\n  let ibl = ",8,"(ij + vec2<i32>(0, 1), size);\r\n  let ibr = ",8,"(ij + vec2<i32>(1, 1), size);\r\n\r\n  let tl = ",35,"(",2,", itl, 0);\r\n  let tr = ",35,"(",2,", itr, 0);\r\n  let bl = ",35,"(",2,", ibl, 0);\r\n  let br = ",35,"(",2,", ibr, 0);\r\n\r\n  let value = mix(mix(tl, tr, ff.x), mix(bl, br, ff.x), ff.y);\r\n  textureStore(",1,", ",34,", value);\r\n}"]).join(''),
  "hash": 4745224395241456,
  "table": t,
  "shake": [[54,[0,3]],[93,[1,3]],[164,[2,3]],[213,[3]]],
  "tree": decompressAST([[1,0,49],[1,54,88],[1,39,108],[1,71,116],[0,49,1007],[3,0,8],[3,9,30],[2,26,30],[3,9,39],[2,71,78],[2,128,145],[2,182,193],[2,54,65],[2,54,65],[2,54,65],[2,67,84],[2,52,69],[2,52,69],[2,52,69],[2,110,128]], t[S]),
};
const libs = {"../../../../wgsl/use/array": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
