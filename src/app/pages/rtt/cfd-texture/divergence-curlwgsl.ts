/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../shader/wgsl";
import m0 from "../../../../wgsl/use/arraywgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSize velocityTexture divergenceTexture curlTexture main ../../../../wgsl/use/array wrapIndex2i vec2<u32> link texture_2d<f32> void compute globalId vec3<u32> builtin(global_invocation_id) wrapIndex2i velocityTexture globalId center textureLoad".split(' '));
const table = {[S]:_([0,1,2,3,4]),[W]:_([4]),[O]:[{[A]:0,[N]:_(5),[S]:_([6]),[K]:[{[N]:_(6),[J]:_(6)}]}],[X]:[{[A]:54,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(7),[Z]:_([8])}},{[A]:93,[R]:_(1),[G]:2,[V]:{[N]:_(1),[T]:_(9),[Z]:_([8])}},{[A]:140,[R]:_(2),[G]:2,[V]:{[N]:_(2),[T]:"texture_storage_2d<r32float, write>",[Z]:_([8])}},{[A]:207,[R]:_(3),[G]:2,[V]:{[N]:_(3),[T]:"texture_storage_2d<r32float, write>",[Z]:_([8])}}],[E]:[{[A]:270,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:_(10),[Z]:_([11,"workgroup_size(8, 8)"]),[P]:[{[N]:_(12),[T]:_(13),[Z]:_([14])}],[I]:_([0,1,2,3])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true}};
const data = {
  name: "cfd-texture/divergence-curl.wgsl",
  code: _(["use '",5,"'::{ ",6," };\r\n\r\n@",8," fn ",0,"() -> ",7," {};\r\n\r\n@",8," var ",1,": ",9,";\r\n\r\n@",8," var ",2,": texture_storage_2d<r32float, write>;\r\n@",8," var ",3,": texture_storage_2d<r32float, write>;\r\n\r\n@",11," @workgroup_size(8, 8)\r\nfn ",4,"(\r\n  @",14," ",12,": ",13,",\r\n) {\r\n  let size = ",0,"();\r\n\r\n  if (any(",12,".xy >= size)) { return; }\r\n  let ",18," = vec2<i32>(",12,".xy);\r\n\r\n  let left   = ",6,"(",18," - vec2<i32>(1, 0), size);\r\n  let right  = ",6,"(",18," + vec2<i32>(1, 0), size);\r\n  let top    = ",6,"(",18," - vec2<i32>(0, 1), size);\r\n  let bottom = ",6,"(",18," + vec2<i32>(0, 1), size);\r\n\r\n  let vl = ",19,"(",1,", left, 0);\r\n  let vr = ",19,"(",1,", right, 0);\r\n  let vt = ",19,"(",1,", top, 0);\r\n  let vb = ",19,"(",1,", bottom, 0);\r\n\r\n  let ux1 = vl.x;\r\n  let ux2 = vr.x;\r\n  let vy1 = vt.y;\r\n  let vy2 = vb.y;\r\n  let div = -((ux2 - ux1) + (vy2 - vy1)) * .5;\r\n\r\n  let uy1 = vl.y;\r\n  let uy2 = vr.y;\r\n  let vx1 = vt.x;\r\n  let vx2 = vb.x;\r\n  let curl = -((uy2 - uy1) - (vx2 - vx1)) * .5;\r\n\r\n  textureStore(",2,", ",18,", ",C,"(div, 0.0, 0.0, 0.0));\r\n  textureStore(",3,", ",18,", ",C,"(curl, 0.0, 0.0, 0.0));\r\n}\n"]).join(''),
  hash: 0x8e0f8b510d87d,
  table,
  shake: [[54,[0,4]],[93,[1,4]],[140,[2,4]],[207,[3,4]],[270,[4]]],
  tree: decompressAST([[1,0,49],[1,54,88],[1,39,82],[1,47,112],[1,67,126],[0,63,1132],[3,0,8],[3,9,30],[2,26,30],[3,9,39],[2,71,78],[2,116,127],[2,61,72],[2,61,72],[2,61,72],[2,71,86],[2,51,66],[2,52,67],[2,50,65],[2,300,317],[2,75,86]], table[S]),
};

const libs = {"../../../../wgsl/use/array": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
