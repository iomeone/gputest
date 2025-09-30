/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getTransformMatrix getTransformBase getCartesian4DPosition mat4x4<f32> optional link u32 export vector".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[X]:[{[A]:0,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:_(3),[Z]:_([4,5]),[P]:[{[N]:"i",[T]:_(6)}]}},{[A]:67,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:C,[Z]:_([4,5]),[P]:[{[N]:"i",[T]:_(6)}]}}],[E]:[{[A]:132,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:C,[Z]:_([7]),[P]:[{[N]:_(8),[T]:C}],[I]:_([0,1])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "transform/cartesian-4d.wgsl",
  code: _(["@",4," @",5," fn ",0,"(i: u32) -> ",3," { };\r\n@",4," @",5," fn ",1,"(i: u32) -> ",C," { };\r\n\r\n@",7," fn ",2,"(",8,": ",C,") -> ",C," {\r\n  return ",0,"(0) * ",8," + ",1,"(0);\r\n}\n"]).join(''),
  hash: 0x1f0859605bcbb2,
  table,
  shake: [[0,[0,2]],[67,[1,2]],[132,[2]]],
  tree: decompressAST([[4,0,64,0],[1,0,9],[1,10,15],[2,9,27],[4,48,108,1],[1,0,9],[1,10,15],[2,9,25],[0,46,180],[1,0,7],[2,11,33],[2,67,85],[2,33,49]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getCartesian4DPosition = getSymbol("getCartesian4DPosition");
