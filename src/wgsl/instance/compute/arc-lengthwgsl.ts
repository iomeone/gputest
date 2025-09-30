/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getDispatchSize getPosition getTrim arcLengthBuffer main u32 link vec2<u32> array<f32> void compute workgroup_size(64) export globalId vec3<u32> builtin(global_invocation_id) getPosition globalId".split(' '));
const table = {[S]:_([0,1,2,3,4]),[W]:_([4]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(5),[Z]:_([6])}},{[A]:38,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:C,[Z]:_([6]),[P]:[{[N]:"i",[T]:_(5)}]}},{[A]:82,[R]:_(2),[G]:2,[F]:{[N]:_(2),[T]:_(7),[Z]:_([6]),[P]:[{[N]:"i",[T]:_(5)}]}},{[A]:124,[R]:_(3),[G]:2,[V]:{[N]:_(3),[T]:_(8),[Z]:_([6]),[Q]:"<storage, read_write>"}}],[E]:[{[A]:187,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:_(9),[Z]:_([10,11,12]),[P]:[{[N]:_(13),[T]:_(14),[Z]:_([15])}],[I]:_([0,2,1,3])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true}};
const data = {
  name: "compute/arc-length.wgsl",
  code: _(["@",6," fn ",0,"() -> u32;\r\n\r\n@",6," fn ",1,"(i: u32) -> ",C,";\r\n@",6," fn ",2,"(i: u32) -> ",7,";\r\n\r\n@",6," var<storage, read_write> ",3,": ",8,";\r\n\r\n@",10," @",11,"\r\n@",12," fn ",4,"(\r\n  @",15," ",13,": ",14,",\r\n) {\r\n  let dispatchSize = ",0,"();\r\n  if (",13,".x >= dispatchSize) { return; }\r\n\r\n  let i = ",13,".x;\r\n  \r\n  let start = ",2,"(i).x;\r\n  let i1 = select(i, i - 1, i > start);\r\n\r\n  let a = ",1,"(i);\r\n  let b = ",1,"(i1);\r\n\r\n  ",3,"[i] = length(b - a);\r\n}\n"]).join(''),
  hash: 0x196191cf013281,
  table,
  shake: [[0,[0,4]],[38,[1,4]],[82,[2,4]],[124,[3,4]],[187,[4]]],
  tree: decompressAST([[1,0,33],[1,38,79],[1,44,81],[1,42,101],[0,63,457],[3,0,8],[3,9,28],[1,21,28],[2,11,15],[3,9,39],[2,79,94],[2,110,117],[2,68,79],[2,27,38],[2,22,37]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
