/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../shader/wgsl";
import m0 from "../../../../wgsl/use/arraywgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSize velocityTextureOut velocityTextureIn main ../../../../wgsl/use/array wrapIndex2i vec2<u32> link texture_2d<f32> void compute globalId vec3<u32> builtin(global_invocation_id) wrapIndex2i velocityTextureIn globalId center textureLoad".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([3]),[O]:[{[A]:0,[N]:_(4),[S]:_([5]),[K]:[{[N]:_(5),[J]:_(5)}]}],[X]:[{[A]:54,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(6),[Z]:_([7])}},{[A]:93,[R]:_(1),[G]:2,[V]:{[N]:_(1),[T]:"texture_storage_2d<rgba32float, write>",[Z]:_([7])}},{[A]:164,[R]:_(2),[G]:2,[V]:{[N]:_(2),[T]:_(8),[Z]:_([7])}}],[E]:[{[A]:213,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(9),[Z]:_([10,"workgroup_size(8, 8)"]),[P]:[{[N]:_(11),[T]:_(12),[Z]:_([13])}],[I]:_([0,2,1])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  name: "cfd-texture/advect.wgsl",
  code: _(["use '",4,"'::{ ",5," };\r\n\r\n@",7," fn ",0,"() -> ",6," {};\r\n\r\n@",7," var ",1,": texture_storage_2d<rgba32float, write>;\r\n@",7," var ",2,": ",8,";\r\n\r\n@",10," @workgroup_size(8, 8)\r\nfn ",3,"(\r\n  @",13," ",11,": ",12,",\r\n) {\r\n  let size = ",0,"();\r\n\r\n  if (any(",11,".xy >= size)) { return; }\r\n  let ",17," = vec2<i32>(",11,".xy);\r\n\r\n  let sample = ",18,"(",2,", ",17,", 0);\r\n  let xy = vec2<f32>(",17,") + sample.xy * f32(TIME_STEP);\r\n\r\n  let xyi = floor(xy);\r\n  let ff = xy - xyi;\r\n  let ij = vec2<i32>(xyi);\r\n\r\n  let itl = ",5,"(ij                  , size);\r\n  let itr = ",5,"(ij + vec2<i32>(1, 0), size);\r\n  let ibl = ",5,"(ij + vec2<i32>(0, 1), size);\r\n  let ibr = ",5,"(ij + vec2<i32>(1, 1), size);\r\n\r\n  let tl = ",18,"(",2,", itl, 0);\r\n  let tr = ",18,"(",2,", itr, 0);\r\n  let bl = ",18,"(",2,", ibl, 0);\r\n  let br = ",18,"(",2,", ibr, 0);\r\n\r\n  let value = mix(mix(tl, tr, ff.x), mix(bl, br, ff.x), ff.y);\r\n  textureStore(",1,", ",17,", value);\r\n}\n"]).join(''),
  hash: 0xcf4c9f13fb5f4,
  table,
  shake: [[54,[0,3]],[93,[1,3]],[164,[2,3]],[213,[3]]],
  tree: decompressAST([[1,0,49],[1,54,88],[1,39,108],[1,71,116],[0,49,1007],[3,0,8],[3,9,30],[2,26,30],[3,9,39],[2,71,78],[2,128,145],[2,182,193],[2,54,65],[2,54,65],[2,54,65],[2,67,84],[2,52,69],[2,52,69],[2,52,69],[2,110,128]], table[S]),
};

const libs = {"../../../../wgsl/use/array": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
