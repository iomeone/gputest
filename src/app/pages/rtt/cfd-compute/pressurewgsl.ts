/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../shader/wgsl";
import m0 from "../../../../wgsl/use/arraywgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSize divergenceBuffer pressureBufferOut pressureBufferIn main ../../../../wgsl/use/array sizeToModulus2 packIndex2 wrapIndex2 vec2<u32> link array<f32> <storage> void compute globalId vec3<u32> builtin(global_invocation_id) packIndex2 wrapIndex2 storage pressureBufferIn globalId fragmentId modulus center".split(' '));
const table = {[S]:_([0,1,2,3,4]),[W]:_([4]),[O]:[{[A]:0,[N]:_(5),[S]:_([6,7,8]),[K]:[{[N]:_(6),[J]:_(6)},{[N]:_(7),[J]:_(7)},{[N]:_(8),[J]:_(8)}]}],[X]:[{[A]:81,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(9),[Z]:_([10])}},{[A]:120,[R]:_(1),[G]:2,[V]:{[N]:_(1),[T]:_(11),[Z]:_([10]),[Q]:_(12)}},{[A]:172,[R]:_(2),[G]:2,[V]:{[N]:_(2),[T]:_(11),[Z]:_([10]),[Q]:"<storage, read_write>"}},{[A]:235,[R]:_(3),[G]:2,[V]:{[N]:_(3),[T]:_(11),[Z]:_([10]),[Q]:_(12)}}],[E]:[{[A]:287,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:_(13),[Z]:_([14,"workgroup_size(8, 8)"]),[P]:[{[N]:_(15),[T]:_(16),[Z]:_([17])}],[I]:_([0,3,1,2])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true}};
const data = {
  name: "cfd-compute/pressure.wgsl",
  code: _(["use '",5,"'::{ ",6,", ",7,", ",8," };\r\n\r\n@",10," fn ",0,"() -> ",9," {};\r\n\r\n@",10," var",12," ",1,": ",11,";\r\n\r\n@",10," var<",20,", read_write> ",2,": ",11,";\r\n@",10," var",12," ",3,": ",11,";\r\n\r\n@",14," @workgroup_size(8, 8)\r\nfn ",4,"(\r\n  @",17," ",15,": ",16,",\r\n) {\r\n  let size = ",0,"();\r\n  if (any(",15,".xy >= size)) { return; }\r\n  let ",23," = ",15,".xy;\r\n\r\n  let ",24," = ",6,"(size);\r\n  let ",25," = ",7,"(",23,", ",24,");\r\n\r\n  let left   = ",7,"(",8,"(vec2<i32>(",23,") - vec2<i32>(1, 0), size), ",24,");\r\n  let right  = ",7,"(",8,"(vec2<i32>(",23,") + vec2<i32>(1, 0), size), ",24,");\r\n  let top    = ",7,"(",8,"(vec2<i32>(",23,") - vec2<i32>(0, 1), size), ",24,");\r\n  let bottom = ",7,"(",8,"(vec2<i32>(",23,") + vec2<i32>(0, 1), size), ",24,");\r\n\r\n  let p1 = ",3,"[left];\r\n  let p2 = ",3,"[right];\r\n  let p3 = ",3,"[top];\r\n  let p4 = ",3,"[bottom];\r\n\r\n  let div = ",1,"[",25,"];\r\n\r\n  let p = (div + p1 + p2 + p3 + p4) / 4.0;\r\n\r\n  ",2,"[",25,"] = p;\r\n}\n"]).join(''),
  hash: 0x1d5873ccdbad96,
  table,
  shake: [[81,[0,4]],[120,[1,4]],[172,[2,4]],[235,[3,4]],[287,[4]]],
  tree: decompressAST([[1,0,76],[1,81,115],[1,39,87],[1,52,113],[1,63,111],[0,52,1005],[3,0,8],[3,9,30],[2,26,30],[3,9,39],[2,71,78],[2,108,122],[2,38,48],[2,51,61],[2,11,21],[2,85,95],[2,11,21],[2,85,95],[2,11,21],[2,85,95],[2,11,21],[2,83,99],[2,36,52],[2,37,53],[2,35,51],[2,41,57],[2,77,94]], table[S]),
};

const libs = {"../../../../wgsl/use/array": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
