/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getOffset getSize getInterleaveIndex u32 optional link export return".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[X]:[{[A]:0,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:_(3),[Z]:_([4,5])}},{[A]:55,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:_(3),[Z]:_([4,5])}}],[E]:[{[A]:110,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(3),[Z]:_([6]),[P]:[{[N]:"i",[T]:_(3)}],[I]:_([1,0])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "index/interleave.wgsl",
  code: _(["@",4," @",5," fn ",0,"() -> u32 { ",7," 0u; };\r\n@",4," @",5," fn ",1,"() -> u32 { ",7," 1u; };\r\n\r\n@",6," fn ",2,"(i: u32) -> u32 {\r\n  ",7," i * ",1,"() + ",0,"();\r\n}\n"]).join(''),
  hash: 0x7f910ef95897b,
  table,
  shake: [[0,[0,2]],[55,[1,2]],[110,[2]]],
  tree: decompressAST([[4,0,52,0],[1,0,9],[1,10,15],[2,9,18],[4,36,86,1],[1,0,9],[1,10,15],[2,9,16],[0,36,124],[1,0,7],[2,11,29],[2,50,57],[2,12,21]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getInterleaveIndex = getSymbol("getInterleaveIndex");
