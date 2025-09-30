/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("transformPositionA getDifferentialA getDifferentialB getChainDifferential link origin vector contravariant bool export origin vector contravariant".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([3]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:C,[Z]:_([4]),[P]:[{[N]:_(5),[T]:C}]}},{[A]:64,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:C,[Z]:_([4]),[P]:[{[N]:_(6),[T]:C},{[N]:_(5),[T]:C},{[N]:_(7),[T]:_(8)}]}},{[A]:164,[R]:_(2),[G]:2,[F]:{[N]:_(2),[T]:C,[Z]:_([4]),[P]:[{[N]:_(6),[T]:C},{[N]:_(5),[T]:C},{[N]:_(7),[T]:_(8)}]}}],[E]:[{[A]:266,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:C,[Z]:_([9]),[P]:[{[N]:_(6),[T]:C},{[N]:_(5),[T]:C},{[N]:_(7),[T]:_(8)}],[I]:_([1,2,0])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  name: "transform/diff-chain.wgsl",
  code: _(["@",4," fn ",0,"(",5,": ",C,") -> ",C,";\r\n\r\n@",4," fn ",1,"(",6,": ",C,", ",5,": ",C,", ",7,": ",8,") -> ",C,";\r\n@",4," fn ",2,"(",6,": ",C,", ",5,": ",C,", ",7,": ",8,") -> ",C,";\r\n\r\n@",9," fn ",3,"(",6,": ",C,", ",5,": ",C,", ",7,": ",8,") -> ",C," {\r\n  let v = ",1,"(",6,", ",5,", ",7,");\r\n  return ",2,"(v, ",0,"(",5,"), ",7,");\r\n}\n"]).join(''),
  hash: 0x10dd906a5d3835,
  table,
  shake: [[0,[0,3]],[64,[1,3]],[164,[2,3]],[266,[3]]],
  tree: decompressAST([[1,0,59],[1,64,161],[1,100,197],[0,102,344],[1,0,7],[2,11,31],[2,106,122],[2,59,75],[2,20,38]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getChainDifferential = getSymbol("getChainDifferential");
