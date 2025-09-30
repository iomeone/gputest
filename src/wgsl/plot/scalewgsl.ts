/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getScaleValue getScaleDirection getScaleOrigin STEP getScalePosition f32 link u32 i32 export index".split(' '));
const table = {[S]:_([0,1,2,3,4]),[W]:_([4]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(5),[Z]:_([6]),[P]:[{[N]:"i",[T]:_(7)}]}},{[A]:40,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:_(8),[Z]:_([6])}},{[A]:78,[R]:_(2),[G]:2,[F]:{[N]:_(2),[T]:C,[Z]:_([6])}}],[E]:[{[A]:158,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:C,[Z]:_([9]),[P]:[{[N]:_(10),[T]:_(7)}],[I]:_([1,3,2,0])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  name: "plot/scale.wgsl",
  code: _(["@",6," fn ",0,"(i: u32) -> f32;\r\n@",6," fn ",1,"() -> i32;\r\n@",6," fn ",2,"() -> ",C,";\r\n\r\nconst ",3," = vec2<f32>(0.0, 1.0);\r\n\r\n@",9," fn ",4,"(",10,": u32) -> ",C," {\r\n\r\n  let dir = ",1,"();\r\n\r\n  var step: ",C,";\r\n  if (dir == 0) { step = ",3,".yxxx; }\r\n  if (dir == 1) { step = ",3,".xyxx; }\r\n  if (dir == 2) { step = ",3,".xxyx; }\r\n  if (dir == 3) { step = ",3,".xxxy; }\r\n\r\n  return ",2,"() + step * ",0,"(",10,");\r\n}\n"]).join(''),
  hash: 0x1a39d27a5b49aa,
  table,
  shake: [[0,[0,4]],[40,[1,4]],[78,[2,4]],[117,[3,4]],[158,[4]]],
  tree: decompressAST([[1,0,37],[1,40,75],[1,38,76],[0,39,76],[2,10,14],[0,31,366],[1,0,7],[2,11,27],[2,59,76],[2,73,77],[2,39,43],[2,39,43],[2,39,43],[2,25,39],[2,26,39]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getScalePosition = getSymbol("getScalePosition");
