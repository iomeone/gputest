/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getID getIndex getPickingID u32 optional link vec2<u32> export index return".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[X]:[{[A]:0,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:_(3),[Z]:_([4,5]),[P]:[{[N]:"i",[T]:_(3)}]}},{[A]:57,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:_(3),[Z]:_([4,5]),[P]:[{[N]:"i",[T]:_(3)}]}}],[E]:[{[A]:118,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(6),[Z]:_([7]),[P]:[{[N]:_(8),[T]:_(3)}],[I]:_([0,1])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "render/pick.wgsl",
  code: _(["@",4," @",5," fn ",0,"(i: u32) -> u32 { ",9," 0u; };\r\n@",4," @",5," fn ",1,"(i: u32) -> u32 { ",9," i; };\r\n\r\n@",7," fn ",2,"(",8,": u32) -> ",6," {\r\n  ",9," ",6,"(",0,"(",8,"), ",1,"(",8,"));\r\n}\n"]).join(''),
  hash: 0x17b911be9bc82a,
  table,
  shake: [[0,[0,2]],[57,[1,2]],[118,[2]]],
  tree: decompressAST([[4,0,54,0],[1,0,9],[1,10,15],[2,9,14],[4,38,94,1],[1,0,9],[1,10,15],[2,9,17],[0,42,147],[1,0,7],[2,11,23],[2,60,65],[2,14,22]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getPickingID = getSymbol("getPickingID");
