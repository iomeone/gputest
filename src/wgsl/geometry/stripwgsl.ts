/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getStripIndex getStripUV getStripGridIndex getStripTubeUV getStripGridUV vec2<u32> export vertex u32 vec2<f32> detail export vertex return getStripGridIndex detail".split(' '));
const table = {[S]:_([0,1,2,3,4]),[W]:_([0,1,2,3,4]),[E]:[{[A]:0,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:_(5),[Z]:_([6]),[P]:[{[N]:_(7),[T]:_(8)}]}},{[A]:135,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(9),[Z]:_([6]),[P]:[{[N]:_(7),[T]:_(8)}],[I]:_([0])}},{[A]:235,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(5),[Z]:_([6]),[P]:[{[N]:_(7),[T]:_(8)},{[N]:_(10),[T]:_(8)}]}},{[A]:503,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(9),[Z]:_([6]),[P]:[{[N]:_(7),[T]:_(8)},{[N]:_(10),[T]:_(8)}],[I]:_([2])}},{[A]:685,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:_(9),[Z]:_([6]),[P]:[{[N]:_(7),[T]:_(8)},{[N]:_(10),[T]:_(8)}],[I]:_([2])}}]};
const data = {
  name: "geometry/strip.wgsl",
  code: _(["@",6," fn ",0,"(",7,": u32) -> ",5," {\r\n  let x = ",7," >> 1u;\r\n  let y = ",7," & 1u;\r\n  ",13," ",5,"(x, y);\r\n}\r\n\r\n@",6," fn ",1,"(",7,": u32) -> ",9," {\r\n  ",13," ",9,"(",0,"(",7,"));\r\n}\r\n\r\n@",6," fn ",2,"(",7,": u32, ",10,": u32) -> ",5," {\r\n  let n = 2 * (",10," + 3);\r\n\r\n  let i = ",7," / n;\r\n  let v = u32(clamp(i32(",7," % n) - 1, 0, i32(n - 3)));\r\n\r\n  let x = 1 - (v & 1u) + i;\r\n  let y = v >> 1;\r\n\r\n  ",13," ",5,"(x, y);\r\n}\r\n\r\n@",6," fn ",3,"(",7,": u32, ",10,": u32) -> ",9," {\r\n  let xy = ",9,"(",2,"(",7,", ",10,"));\r\n  ",13," ",9,"(xy.x, xy.y / f32(",10," + 1));\r\n}\r\n\r\n@",6," fn ",4,"(",7,": u32, ",10,": u32) -> ",9," {\r\n  let xy = ",9,"(",2,"(",7,", ",10,"));\r\n  ",13," ",9,"(xy.x / f32(",10," + 1), xy.y / f32(",10," + 1));\r\n}\n"]).join(''),
  hash: 0x11cfb3b6de0274,
  table,
  shake: [[0,[0,1]],[135,[1]],[235,[2,3,4]],[503,[3]],[685,[4]]],
  tree: decompressAST([[0,0,131],[1,0,7],[2,11,24],[0,124,220],[1,0,7],[2,11,21],[2,59,72],[0,30,294],[1,0,7],[2,11,28],[0,257,435],[1,0,7],[2,11,25],[2,78,95],[0,93,289],[1,0,7],[2,11,25],[2,78,95]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getStripIndex = getSymbol("getStripIndex");
export const getStripUV = getSymbol("getStripUV");
export const getStripGridIndex = getSymbol("getStripGridIndex");
export const getStripTubeUV = getSymbol("getStripTubeUV");
export const getStripGridUV = getSymbol("getStripGridUV");
