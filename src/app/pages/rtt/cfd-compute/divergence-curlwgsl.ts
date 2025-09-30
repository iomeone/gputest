/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
import m0 from "../../../../wgsl/use/arraywgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSize velocityBuffer divergenceBuffer curlBuffer main ../../../../wgsl/use/array sizeToModulus2 packIndex2 wrapIndex2 vec2<u32> link array<vec4<f32>> <storage> array<f32> void compute globalId vec3<u32> builtin(global_invocation_id) packIndex2 wrapIndex2 storage velocityBuffer globalId fragmentId modulus center".split(' '));
const table = {[S]:_([0,1,2,3,4]),[W]:_([4]),[O]:[{[A]:0,[N]:_(5),[S]:_([6,7,8]),[K]:[{[N]:_(6),[J]:_(6)},{[N]:_(7),[J]:_(7)},{[N]:_(8),[J]:_(8)}]}],[X]:[{[A]:81,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(9),[Z]:_([10])}},{[A]:120,[R]:_(1),[G]:2,[V]:{[N]:_(1),[T]:_(11),[Z]:_([10]),[Q]:_(12)}},{[A]:176,[R]:_(2),[G]:2,[V]:{[N]:_(2),[T]:_(13),[Z]:_([10]),[Q]:"<storage, read_write>"}},{[A]:238,[R]:_(3),[G]:2,[V]:{[N]:_(3),[T]:_(13),[Z]:_([10]),[Q]:"<storage, read_write>"}}],[E]:[{[A]:296,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:_(14),[Z]:_([15,"workgroup_size(8, 8)"]),[P]:[{[N]:_(16),[T]:_(17),[Z]:_([18])}],[I]:_([0,1,2,3])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true}};
const data = {
  name: "cfd-compute/divergence-curl.wgsl",
  code: _(["use '",5,"'::{ ",6,", ",7,", ",8," };\r\n\r\n@",10," fn ",0,"() -> ",9," {};\r\n\r\n@",10," var",12," ",1,": ",11,";\r\n\r\n@",10," var<",21,", read_write> ",2,": ",13,";\r\n@",10," var<",21,", read_write> ",3,": ",13,";\r\n\r\n@",15," @workgroup_size(8, 8)\r\nfn ",4,"(\r\n  @",18," ",16,": ",17,",\r\n) {\r\n  let size = ",0,"();\r\n  if (any(",16,".xy >= size)) { return; }\r\n  let ",24," = ",16,".xy;\r\n\r\n  let ",25," = ",6,"(size);\r\n  let ",26," = ",7,"(",24,", ",25,");\r\n\r\n  let left   = ",7,"(",8,"(vec2<i32>(",24,") + vec2<i32>(-1, 0), size), ",25,");\r\n  let right  = ",7,"(",8,"(vec2<i32>(",24,") + vec2<i32>( 1, 0), size), ",25,");\r\n  let top    = ",7,"(",8,"(vec2<i32>(",24,") + vec2<i32>(0, -1), size), ",25,");\r\n  let bottom = ",7,"(",8,"(vec2<i32>(",24,") + vec2<i32>(0,  1), size), ",25,");\r\n\r\n  let vl = ",1,"[left];\r\n  let vr = ",1,"[right];\r\n  let vt = ",1,"[top];\r\n  let vb = ",1,"[bottom];\r\n\r\n  let ux1 = vl.x;\r\n  let ux2 = vr.x;\r\n  let vy1 = vt.y;\r\n  let vy2 = vb.y;\r\n  let div = -((ux2 - ux1) + (vy2 - vy1)) * .5;\r\n\r\n  let uy1 = vl.y;\r\n  let uy2 = vr.y;\r\n  let vx1 = vt.x;\r\n  let vx2 = vb.x;\r\n  let curl = -((uy2 - uy1) - (vx2 - vx1)) * .5;\r\n\r\n  ",2,"[",26,"] = div;\r\n  ",3,"[",26,"] = curl;\r\n}\n"]).join(''),
  hash: 0x19a80f7c2c395c,
  table,
  shake: [[81,[0,4]],[120,[1,4]],[176,[2,4]],[238,[3,4]],[296,[4]]],
  tree: decompressAST([[1,0,76],[1,81,115],[1,39,91],[1,56,116],[1,62,116],[0,58,1204],[3,0,8],[3,9,30],[2,26,30],[3,9,39],[2,71,78],[2,108,122],[2,38,48],[2,51,61],[2,11,21],[2,86,96],[2,11,21],[2,86,96],[2,11,21],[2,86,96],[2,11,21],[2,84,98],[2,34,48],[2,35,49],[2,33,47],[2,282,298],[2,35,45]], table[S]),
};

const libs = {"../../../../wgsl/use/array": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
