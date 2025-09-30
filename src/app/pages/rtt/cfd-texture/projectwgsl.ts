/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../shader/wgsl";
import m0 from "../../../../wgsl/use/arraywgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSize pressureTexture velocityTextureOut velocityTextureIn main ../../../../wgsl/use/array wrapIndex2i vec2<u32> link texture_2d<f32> void compute globalId vec3<u32> builtin(global_invocation_id) wrapIndex2i pressureTexture globalId center textureLoad sample".split(' '));
const table = {[S]:_([0,1,2,3,4]),[W]:_([4]),[O]:[{[A]:0,[N]:_(5),[S]:_([6]),[K]:[{[N]:_(6),[J]:_(6)}]}],[X]:[{[A]:54,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(7),[Z]:_([8])}},{[A]:93,[R]:_(1),[G]:2,[V]:{[N]:_(1),[T]:_(9),[Z]:_([8])}},{[A]:140,[R]:_(2),[G]:2,[V]:{[N]:_(2),[T]:"texture_storage_2d<rgba32float, write>",[Z]:_([8])}},{[A]:211,[R]:_(3),[G]:2,[V]:{[N]:_(3),[T]:_(9),[Z]:_([8])}}],[E]:[{[A]:260,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:_(10),[Z]:_([11,"workgroup_size(8, 8)"]),[P]:[{[N]:_(12),[T]:_(13),[Z]:_([14])}],[I]:_([0,1,3,2])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true}};
const data = {
  name: "cfd-texture/project.wgsl",
  code: _(["use '",5,"'::{ ",6," };\r\n\r\n@",8," fn ",0,"() -> ",7," {};\r\n\r\n@",8," var ",1,": ",9,";\r\n\r\n@",8," var ",2,": texture_storage_2d<rgba32float, write>;\r\n@",8," var ",3,": ",9,";\r\n\r\n@",11," @workgroup_size(8, 8)\r\nfn ",4,"(\r\n  @",14," ",12,": ",13,",\r\n) {\r\n  let size = ",0,"();\r\n\r\n  if (any(",12,".xy >= size)) { return; }\r\n  let ",18," = vec2<i32>(",12,".xy);\r\n\r\n  let left   = ",6,"(",18," - vec2<i32>(1, 0), size);\r\n  let right  = ",6,"(",18," + vec2<i32>(1, 0), size);\r\n  let top    = ",6,"(",18," - vec2<i32>(0, 1), size);\r\n  let bottom = ",6,"(",18," + vec2<i32>(0, 1), size);\r\n\r\n  let p1 = ",19,"(",1,", left, 0).x;\r\n  let p2 = ",19,"(",1,", right, 0).x;\r\n  let p3 = ",19,"(",1,", top, 0).x;\r\n  let p4 = ",19,"(",1,", bottom, 0).x;\r\n\r\n  var ",20," = ",19,"(",3,", ",18,", 0);\r\n\r\n  ",20,".x -= .5 * (p2 - p1);\r\n  ",20,".y -= .5 * (p4 - p3);\r\n  ",20,".z *= 0.99999;\r\n  ",20,".w *= 0.99999;\r\n\r\n  textureStore(",2,", ",18,", ",20,");\r\n}\n"]).join(''),
  hash: 0xe28193729b168,
  table,
  shake: [[54,[0,4]],[93,[1,4]],[140,[2,4]],[211,[3,4]],[260,[4]]],
  tree: decompressAST([[1,0,49],[1,54,88],[1,39,82],[1,47,116],[1,71,116],[0,49,954],[3,0,8],[3,9,30],[2,26,30],[3,9,39],[2,71,78],[2,116,127],[2,61,72],[2,61,72],[2,61,72],[2,71,86],[2,53,68],[2,54,69],[2,52,67],[2,61,78],[2,161,179]], table[S]),
};

const libs = {"../../../../wgsl/use/array": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
