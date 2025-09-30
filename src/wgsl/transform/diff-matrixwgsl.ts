/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getTransformMatrix getNormalMatrix getMatrixDifferential mat4x4<f32> link u32 mat3x3<f32> export vector origin contravariant bool vector".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(3),[Z]:_([4]),[P]:[{[N]:"i",[T]:_(5)}]}},{[A]:53,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:_(6),[Z]:_([4]),[P]:[{[N]:"i",[T]:_(5)}]}}],[E]:[{[A]:105,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:C,[Z]:_([7]),[P]:[{[N]:_(8),[T]:C},{[N]:_(9),[T]:C},{[N]:_(10),[T]:_(11)}],[I]:_([1,0])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "transform/diff-matrix.wgsl",
  code: _(["@",4," fn ",0,"(i: u32) -> ",3,";\r\n@",4," fn ",1,"(i: u32) -> ",6,";\r\n\r\n@",7," fn ",2,"(",8,": ",C,", ",9,": ",C,", ",10,": ",11,") -> ",C," {\r\n  if (",10,") { return ",C,"(",1,"(0u) * ",8,".xyz, ",8,".w); }\r\n  let v4 = ",0,"(0u) * ",C,"(",8,".xyz, 0.0);\r\n  return ",C,"(v4.xyz, ",8,".w);\r\n}\n"]).join(''),
  hash: 0xaa35c96a657dd,
  table,
  shake: [[0,[0,2]],[53,[1,2]],[105,[2]]],
  tree: decompressAST([[1,0,50],[1,53,100],[0,52,353],[1,0,7],[2,11,32],[2,137,152],[2,59,77]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getMatrixDifferential = getSymbol("getMatrixDifferential");
