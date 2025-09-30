/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("counter positions colors segments emitPoint emitLine atomic<u32> link array<vec4<f32>> array<i32> void export storage read_write counter positions colors segments".split(' '));
const table = {[S]:_([0,1,2,3,4,5]),[W]:_([4,5]),[X]:[{[A]:0,[R]:_(0),[G]:2,[V]:{[N]:_(0),[T]:_(6),[Z]:_([7]),[Q]:"<storage, read_write>"}},{[A]:54,[R]:_(1),[G]:2,[V]:{[N]:_(1),[T]:_(8),[Z]:_([7]),[Q]:"<storage, read_write>"}},{[A]:115,[R]:_(2),[G]:2,[V]:{[N]:_(2),[T]:_(8),[Z]:_([7]),[Q]:"<storage, read_write>"}},{[A]:173,[R]:_(3),[G]:2,[V]:{[N]:_(3),[T]:_(9),[Z]:_([7]),[Q]:"<storage, read_write>"}}],[E]:[{[A]:229,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:_(10),[Z]:_([11]),[P]:[{[N]:"p",[T]:D},{[N]:"c",[T]:D}],[I]:_([0,1,2,3])}},{[A]:429,[R]:_(5),[G]:1,[F]:{[N]:_(5),[T]:_(10),[Z]:_([11]),[P]:[{[N]:"a",[T]:D},{[N]:"b",[T]:D},{[N]:"c",[T]:D}],[I]:_([0,1,2,3])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true}};
const data = {
  name: "debug/line-helper.wgsl",
  code: _(["@",7," var<",12,", ",13,"> ",0,": ",6,";\r\n@",7," var<",12,", ",13,"> ",1,": ",8,";\r\n@",7," var<",12,", ",13,"> ",2,": ",8,";\r\n@",7," var<",12,", ",13,"> ",3,": ",9,";\r\n\r\n@",11," fn ",4,"(p: ",D,", c: ",D,") {\r\n  let index = atomicAdd(&",0,", 1u);\r\n  ",1,"[index] = ",C,"(p, 1.0);\r\n  ",2,"[index] = ",C,"(c, 1.0);\r\n  ",3,"[index] = 0;\r\n}\r\n\r\n@",11," fn ",5,"(a: ",D,", b: ",D,", c: ",D,") {\r\n  let index = atomicAdd(&",0,", 2u);\r\n  ",1,"[index] = ",C,"(a, 1.0);\r\n  ",1,"[index + 1] = ",C,"(b, 1.0);\r\n  ",2,"[index] = ",C,"(c, 1.0);\r\n  ",2,"[index + 1] = ",C,"(c, 1.0);\r\n  ",3,"[index] = 1;\r\n  ",3,"[index + 1] = 2;\r\n}\n"]).join(''),
  hash: 0x6490e89eb96f2,
  table,
  shake: [[0,[0,4,5]],[54,[1,4,5]],[115,[2,4,5]],[173,[3,4,5]],[229,[4]],[429,[5]]],
  tree: decompressAST([[1,0,52],[1,54,113],[1,61,117],[1,58,110],[0,56,252],[1,0,7],[2,11,20],[2,66,73],[2,17,26],[2,41,47],[2,38,46],[0,27,351],[1,0,7],[2,11,19],[2,79,86],[2,17,26],[2,41,50],[2,45,51],[2,38,44],[2,42,50],[2,24,32]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const emitPoint = getSymbol("emitPoint");
export const emitLine = getSymbol("emitLine");
