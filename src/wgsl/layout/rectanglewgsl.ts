/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("applyTransform transformRectangle optional link export rect applyTransform".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[X]:[{[A]:0,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:C,[Z]:_([2,3]),[P]:[{[N]:"p",[T]:C}]}}],[E]:[{[A]:78,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:C,[Z]:_([4]),[P]:[{[N]:_(5),[T]:C}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "layout/rectangle.wgsl",
  code: _(["@",2," @",3," fn ",0,"(p: ",C,") -> ",C," { return p; }\r\n\r\n@",4," fn ",1,"(",5,": ",C,") -> ",C," {\r\n  let ul = ",0,"(",C,"(",5,".xy, 0.5, 1.0));\r\n  let br = ",0,"(",C,"(",5,".zw, 0.5, 1.0));\r\n\r\n  return ",C,"(ul.xy, br.xy);\r\n}\n"]).join(''),
  hash: 0xf138d9fab39d2,
  table,
  shake: [[0,[0,1]],[78,[1]]],
  tree: decompressAST([[4,0,74,0],[1,0,9],[1,10,15],[2,9,23],[0,59,276],[1,0,7],[2,11,29],[2,63,77],[2,58,72]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const transformRectangle = getSymbol("transformRectangle");
