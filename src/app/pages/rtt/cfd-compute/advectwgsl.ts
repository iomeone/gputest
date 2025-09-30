/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
import m0 from "../../../../wgsl/use/arraywgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSize velocityBufferOut velocityBufferIn main ../../../../wgsl/use/array sizeToModulus2 packIndex2 wrapIndex2 vec2<u32> link array<vec4<f32>> <storage> void compute globalId vec3<u32> builtin(global_invocation_id) packIndex2 wrapIndex2 velocityBufferIn globalId fragmentId modulus center".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([3]),[O]:[{[A]:0,[N]:_(4),[S]:_([5,6,7]),[K]:[{[N]:_(5),[J]:_(5)},{[N]:_(6),[J]:_(6)},{[N]:_(7),[J]:_(7)}]}],[X]:[{[A]:81,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(8),[Z]:_([9])}},{[A]:120,[R]:_(1),[G]:2,[V]:{[N]:_(1),[T]:_(10),[Z]:_([9]),[Q]:"<storage, read_write>"}},{[A]:189,[R]:_(2),[G]:2,[V]:{[N]:_(2),[T]:_(10),[Z]:_([9]),[Q]:_(11)}}],[E]:[{[A]:247,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(12),[Z]:_([13,"workgroup_size(8, 8)"]),[P]:[{[N]:_(14),[T]:_(15),[Z]:_([16])}],[I]:_([0,2,1])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  name: "cfd-compute/advect.wgsl",
  code: _(["use '",4,"'::{ ",5,", ",6,", ",7," };\r\n\r\n@",9," fn ",0,"() -> ",8," {};\r\n\r\n@",9," var<storage, read_write> ",1,": ",10,";\r\n@",9," var",11," ",2,": ",10,";\r\n\r\n@",13," @workgroup_size(8, 8)\r\nfn ",3,"(\r\n  @",16," ",14,": ",15,",\r\n) {\r\n  let size = ",0,"();\r\n  if (any(",14,".xy >= size)) { return; }\r\n  let ",21," = ",14,".xy;\r\n\r\n  let ",22," = ",5,"(size);\r\n  let ",23," = ",6,"(",21,", ",22,");\r\n\r\n  let sample = ",2,"[",23,"];\r\n  let xy = vec2<f32>(",21,") + sample.xy * f32(TIME_STEP);\r\n\r\n  let xyi = floor(xy);\r\n  let ff = xy - xyi;\r\n  let ij = vec2<i32>(xyi);\r\n\r\n  let tl = ",2,"[",6,"(",7,"(ij + vec2<i32>(0, 0), size), ",22,")];\r\n  let tr = ",2,"[",6,"(",7,"(ij + vec2<i32>(1, 0), size), ",22,")];\r\n  let bl = ",2,"[",6,"(",7,"(ij + vec2<i32>(0, 1), size), ",22,")];\r\n  let br = ",2,"[",6,"(",7,"(ij + vec2<i32>(1, 1), size), ",22,")];\r\n\r\n  let value = mix(mix(tl, tr, ff.x), mix(bl, br, ff.x), ff.y);\r\n  ",1,"[",23,"] = value;\r\n}\n"]).join(''),
  hash: 0x1103e6f9cdac39,
  table,
  shake: [[81,[0,3]],[120,[1,3]],[189,[2,3]],[247,[3]]],
  tree: decompressAST([[1,0,76],[1,81,115],[1,39,106],[1,69,123],[0,58,1008],[3,0,8],[3,9,30],[2,26,30],[3,9,39],[2,71,78],[2,108,122],[2,38,48],[2,51,67],[2,180,196],[2,17,27],[2,11,21],[2,63,79],[2,17,27],[2,11,21],[2,63,79],[2,17,27],[2,11,21],[2,63,79],[2,17,27],[2,11,21],[2,120,137]], table[S]),
};

const libs = {"../../../../wgsl/use/array": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
