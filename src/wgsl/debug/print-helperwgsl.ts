/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/debug/printwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("data positions colors segments printPoint printLine printData ../../wgsl/debug/print PrintData link array<vec4<f32>> array<i32> void export position color start end vector storage read_write positions colors segments export atomicAdd vector".split(' '));
const table = {[S]:_([0,1,2,3,4,5,6]),[W]:_([4,5,6]),[O]:[{[A]:0,[N]:_(7),[S]:_([8]),[K]:[{[N]:_(8),[J]:_(8)}]}],[X]:[{[A]:48,[R]:_(0),[G]:2,[V]:{[N]:_(0),[T]:_(8),[Z]:_([9]),[Q]:"<storage, read_write>"}},{[A]:97,[R]:_(1),[G]:2,[V]:{[N]:_(1),[T]:_(10),[Z]:_([9]),[Q]:"<storage, read_write>"}},{[A]:158,[R]:_(2),[G]:2,[V]:{[N]:_(2),[T]:_(10),[Z]:_([9]),[Q]:"<storage, read_write>"}},{[A]:216,[R]:_(3),[G]:2,[V]:{[N]:_(3),[T]:_(11),[Z]:_([9]),[Q]:"<storage, read_write>"}}],[E]:[{[A]:272,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:_(12),[Z]:_([13]),[P]:[{[N]:_(14),[T]:C},{[N]:_(15),[T]:C}],[I]:_([0,1,2,3])}},{[A]:467,[R]:_(5),[G]:1,[F]:{[N]:_(5),[T]:_(12),[Z]:_([13]),[P]:[{[N]:_(16),[T]:C},{[N]:_(17),[T]:C},{[N]:_(15),[T]:C}],[I]:_([0,1,2,3])}},{[A]:760,[R]:_(6),[G]:1,[F]:{[N]:_(6),[T]:_(12),[Z]:_([13]),[P]:[{[N]:_(18),[T]:C}],[I]:_([0])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true}};
const data = {
  name: "debug/print-helper.wgsl",
  code: _(["use '",7,"'::{ ",8," };\r\n\r\n@",9," var<",19,", ",20,"> ",0,": ",8,";\r\n@",9," var<",19,", ",20,"> ",1,": ",10,";\r\n@",9," var<",19,", ",20,"> ",2,": ",10,";\r\n@",9," var<",19,", ",20,"> ",3,": ",11,";\r\n\r\n@",13," fn ",4,"(",14,": ",C,", ",15,": ",C,") {\r\n  let index = ",25,"(&",0,".vertex, 1u);\r\n  ",1,"[index] = ",14,";\r\n  ",2,"[index] = ",15,";\r\n  ",3,"[index] = 0;\r\n}\r\n\r\n@",13," fn ",5,"(",16,": ",C,", end: ",C,", ",15,": ",C,") {\r\n  let index = ",25,"(&",0,".vertex, 2u);\r\n  ",1,"[index] = ",16,";\r\n  ",1,"[index + 1] = end;\r\n  ",2,"[index] = ",15,";\r\n  ",2,"[index + 1] = ",15,";\r\n  ",3,"[index] = 1;\r\n  ",3,"[index + 1] = 2;\r\n}\r\n\r\n@",13," fn ",6,"(",18,": ",C,") {\r\n  let index = ",25,"(&",0,".",18,", 1u);\r\n  ",0,".",18,"s[index] = ",18,";\r\n}\n"]).join(''),
  hash: 0xee8a88769b860,
  table,
  shake: [[48,[0,4,5,6]],[97,[1,4,5]],[158,[2,4,5]],[216,[3,4,5]],[272,[4]],[467,[5]],[760,[6]]],
  tree: decompressAST([[1,0,43],[1,48,95],[1,49,108],[1,61,117],[1,58,110],[0,56,247],[1,0,7],[2,11,21],[2,78,82],[2,21,30],[2,32,38],[2,26,34],[0,27,316],[1,0,7],[2,11,20],[2,90,94],[2,21,30],[2,29,38],[2,31,37],[2,26,32],[2,30,38],[2,24,32],[0,31,152],[1,0,7],[2,11,20],[2,57,61],[2,21,25]], table[S]),
};

const libs = {"../../wgsl/debug/print": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const printPoint = getSymbol("printPoint");
export const printLine = getSymbol("printLine");
export const printData = getSymbol("printData");
