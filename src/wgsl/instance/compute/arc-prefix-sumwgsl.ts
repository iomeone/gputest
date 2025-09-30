/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getDispatchSize getStep getTrim arcLengthBuffer main u32 link vec2<u32> array<f32> void compute workgroup_size(64) export globalId vec3<u32> builtin(global_invocation_id) arcLengthBuffer globalId".split(' '));
const table = {[S]:_([0,1,2,3,4]),[W]:_([4]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(5),[Z]:_([6])}},{[A]:38,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:_(5),[Z]:_([6])}},{[A]:68,[R]:_(2),[G]:2,[F]:{[N]:_(2),[T]:_(7),[Z]:_([6]),[P]:[{[N]:"i",[T]:_(5)}]}},{[A]:110,[R]:_(3),[G]:2,[V]:{[N]:_(3),[T]:_(8),[Z]:_([6]),[Q]:"<storage, read_write>"}}],[E]:[{[A]:173,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:_(9),[Z]:_([10,11,12]),[P]:[{[N]:_(13),[T]:_(14),[Z]:_([15])}],[I]:_([0,2,1,3])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true}};
const data = {
  name: "compute/arc-prefix-sum.wgsl",
  code: _(["@",6," fn ",0,"() -> u32;\r\n\r\n@",6," fn ",1,"() -> u32;\r\n\r\n@",6," fn ",2,"(i: u32) -> ",7,";\r\n\r\n@",6," var<storage, read_write> ",3,": ",8,";\r\n\r\n@",10," @",11,"\r\n@",12," fn ",4,"(\r\n  @",15," ",13,": ",14,",\r\n) {\r\n  let dispatchSize = ",0,"();\r\n  if (",13,".x >= dispatchSize) { return; }\r\n\r\n  let i = ",13,".x;\r\n  \r\n  let start = ",2,"(i).x;\r\n  let index = i - start;\r\n\r\n  let step = ",1,"();\r\n  let mask = (index >> step) & 1u;\r\n\r\n  if (mask != 0) {\r\n    let base = start + ((index >> (step + 1u)) << (step + 1u));\r\n    let stride = (1u << step) - 1u;\r\n\r\n    ",3,"[i] = ",3,"[i] + ",3,"[base + stride];\r\n  }\r\n}\n"]).join(''),
  hash: 0x12e2ec0be27d07,
  table,
  shake: [[0,[0,4]],[38,[1,4]],[68,[2,4]],[110,[3,4]],[173,[4]]],
  tree: decompressAST([[1,0,33],[1,38,63],[1,30,67],[1,42,101],[0,63,617],[3,0,8],[3,9,28],[1,21,28],[2,11,15],[3,9,39],[2,79,94],[2,110,117],[2,56,63],[2,178,193],[2,21,36],[2,21,36]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
