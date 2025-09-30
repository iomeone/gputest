/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getIndirectTransformMatrix getIndirectNormalMatrix getInstanceMap transformMatrix normalMatrix loadInstance getTransformMatrix getNormalMatrix mat4x4<f32> link u32 mat3x3<f32> optional void export mat4x4 mat3x3 return transformMatrix normalMatrix export".split(' '));
const table = {[S]:_([0,1,2,3,4,5,6,7]),[W]:_([5,6,7]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(8),[Z]:_([9]),[P]:[{[N]:"i",[T]:_(10)}]}},{[A]:61,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:_(11),[Z]:_([9]),[P]:[{[N]:"i",[T]:_(10)}]}},{[A]:121,[R]:_(2),[G]:6,[F]:{[N]:_(2),[T]:_(10),[Z]:_([12,9]),[P]:[{[N]:"i",[T]:_(10)}]}}],[E]:[{[A]:274,[R]:_(5),[G]:1,[F]:{[N]:_(5),[T]:_(13),[Z]:_([14]),[P]:[{[N]:"i",[T]:_(10)}],[I]:_([2,3,0,4,1])}},{[A]:454,[R]:_(6),[G]:1,[F]:{[N]:_(6),[T]:_(8),[Z]:_([14]),[I]:_([3])}},{[A]:530,[R]:_(7),[G]:1,[F]:{[N]:_(7),[T]:_(11),[Z]:_([14]),[I]:_([4])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  name: "transform/instance.wgsl",
  code: _(["@",9," fn ",0,"(i: u32) -> ",8,";\r\n@",9," fn ",1,"(i: u32) -> ",11,";\r\n\r\n@",12," @",9," fn ",2,"(i: u32) -> u32 { ",17," i; }\r\n\r\nvar<private> ",3,": ",8,";\r\nvar<private> ",4,": ",11,";\r\n\r\n@",14," fn ",5,"(i: u32) {\r\n  let index = ",2,"(i);\r\n  ",3," = ",0,"(index);\r\n  ",4," = ",1,"(index);\r\n}\r\n\r\n@",14," fn ",6,"() -> ",8," { ",17," ",3,"; }\r\n@",14," fn ",7,"() -> ",11," { ",17," ",4,"; }\n"]).join(''),
  hash: 0x1f6ac9ef442dd0,
  table,
  shake: [[0,[0,5]],[61,[1,5]],[121,[2,5]],[183,[3,5,6]],[229,[4,5,7]],[274,[5]],[454,[6]],[530,[7]]],
  tree: decompressAST([[1,0,58],[1,61,116],[4,60,122,2],[1,0,9],[1,10,15],[2,9,23],[0,43,89],[2,17,32],[0,29,70],[2,15,27],[0,30,206],[1,0,7],[2,11,23],[2,38,52],[2,22,37],[2,18,44],[2,38,50],[2,15,38],[0,38,112],[1,0,7],[2,11,29],[2,45,60],[0,20,88],[1,0,7],[2,11,26],[2,42,54]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const loadInstance = getSymbol("loadInstance");
export const getTransformMatrix = getSymbol("getTransformMatrix");
export const getNormalMatrix = getSymbol("getNormalMatrix");
