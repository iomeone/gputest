/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("circleSDF diamondSDF squareSDF triangleSDF upSDF downSDF leftSDF rightSDF f32 export vec2<f32> export return triangleSDF".split(' '));
const table = {[S]:_([0,1,2,3,4,5,6,7]),[W]:_([0,1,2,3,4,5,6,7]),[E]:[{[A]:0,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:_(8),[Z]:_([9]),[P]:[{[N]:"uv",[T]:_(10)}]}},{[A]:107,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(8),[Z]:_([9]),[P]:[{[N]:"uv",[T]:_(10)}]}},{[A]:228,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(8),[Z]:_([9]),[P]:[{[N]:"uv",[T]:_(10)}]}},{[A]:350,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(8),[Z]:_([9]),[P]:[{[N]:"uv",[T]:_(10)}]}},{[A]:549,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:_(8),[Z]:_([9]),[P]:[{[N]:"uv",[T]:_(10)}],[I]:_([3])}},{[A]:623,[R]:_(5),[G]:1,[F]:{[N]:_(5),[T]:_(8),[Z]:_([9]),[P]:[{[N]:"uv",[T]:_(10)}],[I]:_([3])}},{[A]:719,[R]:_(6),[G]:1,[F]:{[N]:_(6),[T]:_(8),[Z]:_([9]),[P]:[{[N]:"uv",[T]:_(10)}],[I]:_([3])}},{[A]:814,[R]:_(7),[G]:1,[F]:{[N]:_(7),[T]:_(8),[Z]:_([9]),[P]:[{[N]:"uv",[T]:_(10)}],[I]:_([3])}}]};
const data = {
  name: "mask/sdf.wgsl",
  code: _(["@",9," fn ",0,"(uv: ",10,") -> f32 {\r\n  let xy = uv * 2.0 - 1.0;\r\n  ",12," 1.0 - length(xy);\r\n}\r\n\r\n@",9," fn ",1,"(uv: ",10,") -> f32 {\r\n  let xy = uv * 2.0 - 1.0;\r\n  ",12," 1.0 - (abs(xy.x) + abs(xy.y));\r\n}\r\n\r\n@",9," fn ",2,"(uv: ",10,") -> f32 {\r\n  let xy = uv * 2.0 - 1.0;\r\n  ",12," 1.0 - max(abs(xy.x), abs(xy.y));\r\n}\r\n\r\n@",9," fn ",3,"(uv: ",10,") -> f32 {\r\n  let xy = uv * 2.0 - 1.0;\r\n  let a = xy.y - 0.5;\r\n  let b = dot(",10,"(abs(xy.x), xy.y), ",10,"(0.866, -0.5));\r\n  ",12," 1.0 - min(a, b);\r\n}\r\n\r\n@",9," fn ",4,"(uv: ",10,") -> f32 {\r\n  ",12," ",3,"(uv);\r\n}\r\n\r\n@",9," fn ",5,"(uv: ",10,") -> f32 {\r\n  ",12," ",3,"(",10,"(uv.x, -uv.y));\r\n}\r\n\r\n@",9," fn ",6,"(uv: ",10,") -> f32 {\r\n  ",12," ",3,"(",10,"(uv.y, uv.x));\r\n}\r\n\r\n@",9," fn ",7,"(uv: ",10,") -> f32 {\r\n  ",12," ",3,"(",10,"(-uv.y, uv.x));\r\n}\n"]).join(''),
  hash: 0x1e300e2525efd2,
  table,
  shake: [[0,[0]],[107,[1]],[228,[2]],[350,[3,4,5,6,7]],[549,[4]],[623,[5]],[719,[6]],[814,[7]]],
  tree: decompressAST([[0,0,103],[1,0,7],[2,11,20],[0,96,213],[1,0,7],[2,11,21],[0,110,228],[1,0,7],[2,11,20],[0,111,306],[1,0,7],[2,11,22],[0,188,258],[1,0,7],[2,11,16],[2,40,51],[0,23,115],[1,0,7],[2,11,18],[2,42,53],[0,43,134],[1,0,7],[2,11,18],[2,42,53],[0,42,135],[1,0,7],[2,11,19],[2,43,54]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const circleSDF = getSymbol("circleSDF");
export const diamondSDF = getSymbol("diamondSDF");
export const squareSDF = getSymbol("squareSDF");
export const triangleSDF = getSymbol("triangleSDF");
export const upSDF = getSymbol("upSDF");
export const downSDF = getSymbol("downSDF");
export const leftSDF = getSymbol("leftSDF");
export const rightSDF = getSymbol("rightSDF");
