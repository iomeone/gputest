/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getTransformMatrix getCartesianPosition mat4x4<f32> optional link u32 export vector".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[X]:[{[A]:0,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:_(2),[Z]:_([3,4]),[P]:[{[N]:"i",[T]:_(5)}]}}],[E]:[{[A]:69,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:C,[Z]:_([6]),[P]:[{[N]:_(7),[T]:C}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "transform/cartesian.wgsl",
  code: _(["@",3," @",4," fn ",0,"(i: u32) -> ",2," { };\r\n\r\n@",6," fn ",1,"(",7,": ",C,") -> ",C," {\r\n  return ",0,"(0) * ",C,"(",7,".xyz, 1.0);\r\n}\n"]).join(''),
  hash: 0x46370e11b8808,
  table,
  shake: [[0,[0,1]],[69,[1]]],
  tree: decompressAST([[4,0,64,0],[1,0,9],[1,10,15],[2,9,27],[0,50,180],[1,0,7],[2,11,31],[2,65,83]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getCartesianPosition = getSymbol("getCartesianPosition");
