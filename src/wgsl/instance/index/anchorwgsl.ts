/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getAnchor getAnchorIndex infer(T) link instanceIndex u32 vec2<u32> export".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:{[N]:"T",[Z]:_([2])},[Z]:_([3]),[P]:[{[N]:_(4),[T]:_(5)}],[H]:[{[N]:"T",[A]:-1}]}}],[E]:[{[A]:58,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(6),[Z]:_([7]),[P]:[{[N]:"v",[T]:_(5)},{[N]:"i",[T]:_(5)}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "index/anchor.wgsl",
  code: _(["@",3," fn ",0,"(",4,": u32) -> @",2," T;\r\n\r\n@",7," fn ",0,"Index(v: u32, i: u32) -> ",6," { return ",6,"(i, ",0,"(i).x); };\n"]).join(''),
  hash: 0x15138592bb2b35,
  table,
  shake: [[0,[0,1]],[58,[1]]],
  tree: decompressAST([[1,0,53],[0,58,153],[1,0,7],[2,11,25],[2,66,75]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getAnchorIndex = getSymbol("getAnchorIndex");
