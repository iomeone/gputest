/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("GAMMA toLinear toLinear2 toLinear3 toLinear4 toGamma toGamma2 toGamma3 toGamma4 f32 export vec2<f32> export return".split(' '));
const table = {[S]:_([0,1,2,3,4,5,6,7,8]),[W]:_([1,2,3,4,5,6,7,8]),[E]:[{[A]:22,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(9),[Z]:_([10]),[P]:[{[N]:"v",[T]:_(9)}],[I]:_([0])}},{[A]:90,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(11),[Z]:_([10]),[P]:[{[N]:"v",[T]:_(11)}],[I]:_([0])}},{[A]:182,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:D,[Z]:_([10]),[P]:[{[N]:"v",[T]:D}],[I]:_([0])}},{[A]:274,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:C,[Z]:_([10]),[P]:[{[N]:"v",[T]:C}],[I]:_([3])}},{[A]:369,[R]:_(5),[G]:1,[F]:{[N]:_(5),[T]:_(9),[Z]:_([10]),[P]:[{[N]:"v",[T]:_(9)}],[I]:_([0])}},{[A]:442,[R]:_(6),[G]:1,[F]:{[N]:_(6),[T]:_(11),[Z]:_([10]),[P]:[{[N]:"v",[T]:_(11)}],[I]:_([0])}},{[A]:539,[R]:_(7),[G]:1,[F]:{[N]:_(7),[T]:D,[Z]:_([10]),[P]:[{[N]:"v",[T]:D}],[I]:_([0])}},{[A]:636,[R]:_(8),[G]:1,[F]:{[N]:_(8),[T]:C,[Z]:_([10]),[P]:[{[N]:"v",[T]:C}],[I]:_([7])}}]};
const data = {
  name: "use/gamma.wgsl",
  code: _(["const ",0," = 2.2;\r\n\r\n@",10," fn ",1,"(v: f32) -> f32 {\r\n  ",13," pow(v, ",0,");\r\n}\r\n\r\n@",10," fn ",1,"2(v: ",11,") -> ",11," {\r\n  ",13," pow(v, ",11,"(",0,"));\r\n}\r\n\r\n@",10," fn ",1,"3(v: ",D,") -> ",D," {\r\n  ",13," pow(v, ",D,"(",0,"));\r\n}\r\n\r\n@",10," fn ",1,"4(v: ",C,") -> ",C," {\r\n  ",13," vec4(",1,"3(v.rgb), v.a);\r\n}\r\n\r\n@",10," fn ",5,"(v: f32) -> f32 {\r\n  ",13," pow(v, 1.0 / ",0,");\r\n}\r\n\r\n@",10," fn ",5,"2(v: ",11,") -> ",11," {\r\n  ",13," pow(v, ",11,"(1.0 / ",0,"));\r\n}\r\n\r\n@",10," fn ",5,"3(v: ",D,") -> ",D," {\r\n  ",13," pow(v, ",D,"(1.0 / ",0,"));\r\n}\r\n\r\n@",10," fn ",5,"4(v: ",C,") -> ",C," {\r\n  ",13," ",C,"(",5,"3(v.rgb), v.a);\r\n}\n"]).join(''),
  hash: 0x8c6739bdaac0c,
  table,
  shake: [[0,[0,1,2,3,4,5,6,7,8]],[22,[1]],[90,[2]],[182,[3,4]],[274,[4]],[369,[5]],[442,[6]],[539,[7,8]],[636,[8]]],
  tree: decompressAST([[0,0,18],[2,6,11],[0,16,80],[1,0,7],[2,11,19],[2,43,48],[0,14,102],[1,0,7],[2,11,20],[2,66,71],[0,15,103],[1,0,7],[2,11,20],[2,66,71],[0,15,106],[1,0,7],[2,11,20],[2,54,63],[0,30,99],[1,0,7],[2,11,18],[2,48,53],[0,14,107],[1,0,7],[2,11,19],[2,71,76],[0,15,108],[1,0,7],[2,11,19],[2,71,76],[0,15,109],[1,0,7],[2,11,19],[2,58,66]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const toLinear = getSymbol("toLinear");
export const toLinear2 = getSymbol("toLinear2");
export const toLinear3 = getSymbol("toLinear3");
export const toLinear4 = getSymbol("toLinear4");
export const toGamma = getSymbol("toGamma");
export const toGamma2 = getSymbol("toGamma2");
export const toGamma3 = getSymbol("toGamma3");
export const toGamma4 = getSymbol("toGamma4");
