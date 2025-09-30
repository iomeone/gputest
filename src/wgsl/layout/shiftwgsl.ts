/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getOffset getShiftedRectangle vec2<f32> link export rectangle rectangle offset".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(2),[Z]:_([3])}}],[E]:[{[A]:38,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:C,[Z]:_([4]),[P]:[{[N]:_(5),[T]:C}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "layout/shift.wgsl",
  code: _(["@",3," fn ",0,"() -> ",2,";\r\n\r\n@",4," fn ",1,"(",5,": ",C,") -> ",C," {\r\n  let ",7," = ",0,"();\r\n  return ",C,"(",5,".xy + ",7,", ",5,".zw + ",7,");\r\n}\n"]).join(''),
  hash: 0x1f609b844317a3,
  table,
  shake: [[0,[0,1]],[38,[1]]],
  tree: decompressAST([[1,0,33],[0,38,204],[1,0,7],[2,11,30],[2,73,82]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getShiftedRectangle = getSymbol("getShiftedRectangle");
