/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getFlip getOffset getLayoutPosition vec2<f32> link export position position".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(3),[Z]:_([4])}},{[A]:34,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:_(3),[Z]:_([4])}}],[E]:[{[A]:72,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:C,[Z]:_([5]),[P]:[{[N]:_(6),[T]:C}],[I]:_([0,1])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "layout/layout.wgsl",
  code: _(["@",4," fn ",0,"() -> ",3,";\r\n@",4," fn ",1,"() -> ",3,";\r\n\r\n@",5," fn ",2,"(",6,": ",C,") -> ",C," {\r\n  let flip = ",0,"();\r\n  let offset = ",1,"();\r\n\r\n  var xy = select(",6,".xy, flip - ",6,".xy, flip > ",3,"(0.0));\r\n  return ",C,"(xy + offset, ",6,".zw);\r\n}\n"]).join(''),
  hash: 0xa63aed52f12db,
  table,
  shake: [[0,[0,2]],[34,[1,2]],[72,[2]]],
  tree: decompressAST([[1,0,31],[1,34,67],[0,38,284],[1,0,7],[2,11,28],[2,68,75],[2,27,36]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getLayoutPosition = getSymbol("getLayoutPosition");
