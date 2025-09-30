/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("PrintData export vertex atomic<u32> vector vectors array<vec4<f32>>".split(' '));
const table = {[Y]:_([0]),[S]:_([0]),[W]:_([0]),[E]:[{[A]:0,[R]:_(0),[G]:1,[U]:{[N]:_(0),[Z]:_([1]),[M]:[{[N]:_(2),[T]:_(3)},{[N]:_(4),[T]:_(3)},{[N]:_(5),[T]:_(6)}]}}]};
const data = {
  name: "debug/print.wgsl",
  code: _(["@",1," ",U," ",0," {\r\n  ",2,": ",3,",\r\n\r\n  ",4,": ",3,",\r\n  ",4,"s: ",6,",\r\n};\n"]).join(''),
  hash: 0x415ca27d4254b,
  table,
  shake: [[0,[0]]],
  tree: decompressAST([[0,0,109],[1,0,7],[2,15,24]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const PrintData = getSymbol("PrintData");
