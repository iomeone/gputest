/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getUVScale getUVWScale scaleSDF circleSDF diamondSDF squareSDF triangleSDF upSDF downSDF leftSDF rightSDF f32 export vec2<f32> uvw sdf scale export return length triangleSDF".split(' '));
const table = {[S]:_([0,1,2,3,4,5,6,7,8,9,10]),[W]:_([0,1,2,3,4,5,6,7,8,9,10]),[E]:[{[A]:0,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:_(11),[Z]:_([12]),[P]:[{[N]:"uv",[T]:_(13)}]}},{[A]:156,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(11),[Z]:_([12]),[P]:[{[N]:_(14),[T]:D}]}},{[A]:316,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(11),[Z]:_([12]),[P]:[{[N]:_(15),[T]:_(11)},{[N]:_(16),[T]:_(11)}]}},{[A]:479,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(11),[Z]:_([12]),[P]:[{[N]:"uv",[T]:_(13)}]}},{[A]:586,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:_(11),[Z]:_([12]),[P]:[{[N]:"uv",[T]:_(13)}]}},{[A]:707,[R]:_(5),[G]:1,[F]:{[N]:_(5),[T]:_(11),[Z]:_([12]),[P]:[{[N]:"uv",[T]:_(13)}]}},{[A]:829,[R]:_(6),[G]:1,[F]:{[N]:_(6),[T]:_(11),[Z]:_([12]),[P]:[{[N]:"uv",[T]:_(13)}]}},{[A]:1028,[R]:_(7),[G]:1,[F]:{[N]:_(7),[T]:_(11),[Z]:_([12]),[P]:[{[N]:"uv",[T]:_(13)}],[I]:_([6])}},{[A]:1102,[R]:_(8),[G]:1,[F]:{[N]:_(8),[T]:_(11),[Z]:_([12]),[P]:[{[N]:"uv",[T]:_(13)}],[I]:_([6])}},{[A]:1198,[R]:_(9),[G]:1,[F]:{[N]:_(9),[T]:_(11),[Z]:_([12]),[P]:[{[N]:"uv",[T]:_(13)}],[I]:_([6])}},{[A]:1293,[R]:_(10),[G]:1,[F]:{[N]:_(10),[T]:_(11),[Z]:_([12]),[P]:[{[N]:"uv",[T]:_(13)}],[I]:_([6])}}]};
const data = {
  name: "mask/sdf.wgsl",
  code: _(["@",12," fn ",0,"(uv: ",13,") -> f32 {\r\n  let dx = dpdx(uv);\r\n  let dy = dpdy(uv);\r\n  // implicit * 2 / 2\r\n  ",18," (",19,"(dx) + ",19,"(dy));\r\n}\r\n\r\n@",12," fn ",1,"(uvw: ",D,") -> f32 {\r\n  let dx = dpdx(uvw);\r\n  let dy = dpdy(uvw);\r\n  // implicit * 2 / 2\r\n  ",18," (",19,"(dx) + ",19,"(dy));\r\n}\r\n\r\n@",12," fn ",2,"(sdf: f32, ",16,": f32) -> f32 {\r\n  let d = sdf / ",16," + 0.5;\r\n  ",18," clamp(d, 0.0, 1.0) * max(0.0, min(1.0, 2.0 / ",16,") * 2.0 - 1.0);\r\n}\r\n\r\n@",12," fn ",3,"(uv: ",13,") -> f32 {\r\n  let xy = uv * 2.0 - 1.0;\r\n  ",18," 1.0 - ",19,"(xy);\r\n}\r\n\r\n@",12," fn ",4,"(uv: ",13,") -> f32 {\r\n  let xy = uv * 2.0 - 1.0;\r\n  ",18," 1.0 - (abs(xy.x) + abs(xy.y));\r\n}\r\n\r\n@",12," fn ",5,"(uv: ",13,") -> f32 {\r\n  let xy = uv * 2.0 - 1.0;\r\n  ",18," 1.0 - max(abs(xy.x), abs(xy.y));\r\n}\r\n\r\n@",12," fn ",6,"(uv: ",13,") -> f32 {\r\n  let xy = uv * 2.0 - 1.0;\r\n  let a = xy.y - 0.5;\r\n  let b = dot(",13,"(abs(xy.x), xy.y), ",13,"(0.866, -0.5));\r\n  ",18," 1.0 - min(a, b);\r\n}\r\n\r\n@",12," fn ",7,"(uv: ",13,") -> f32 {\r\n  ",18," ",6,"(uv);\r\n}\r\n\r\n@",12," fn ",8,"(uv: ",13,") -> f32 {\r\n  ",18," ",6,"(",13,"(uv.x, -uv.y));\r\n}\r\n\r\n@",12," fn ",9,"(uv: ",13,") -> f32 {\r\n  ",18," ",6,"(",13,"(uv.y, uv.x));\r\n}\r\n\r\n@",12," fn ",10,"(uv: ",13,") -> f32 {\r\n  ",18," ",6,"(",13,"(-uv.y, uv.x));\r\n}\n"]).join(''),
  hash: 0x1b107b77b55cbd,
  table,
  shake: [[0,[0]],[156,[1]],[316,[2]],[479,[3]],[586,[4]],[707,[5]],[829,[6,7,8,9,10]],[1028,[7]],[1102,[8]],[1198,[9]],[1293,[10]]],
  tree: decompressAST([[0,0,152],[1,0,7],[2,11,21],[0,145,301],[1,0,7],[2,11,22],[0,149,308],[1,0,7],[2,11,19],[0,152,255],[1,0,7],[2,11,20],[0,96,213],[1,0,7],[2,11,21],[0,110,228],[1,0,7],[2,11,20],[0,111,306],[1,0,7],[2,11,22],[0,188,258],[1,0,7],[2,11,16],[2,40,51],[0,23,115],[1,0,7],[2,11,18],[2,42,53],[0,43,134],[1,0,7],[2,11,18],[2,42,53],[0,42,135],[1,0,7],[2,11,19],[2,43,54]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getUVScale = getSymbol("getUVScale");
export const getUVWScale = getSymbol("getUVWScale");
export const scaleSDF = getSymbol("scaleSDF");
export const circleSDF = getSymbol("circleSDF");
export const diamondSDF = getSymbol("diamondSDF");
export const squareSDF = getSymbol("squareSDF");
export const triangleSDF = getSymbol("triangleSDF");
export const upSDF = getSymbol("upSDF");
export const downSDF = getSymbol("downSDF");
export const leftSDF = getSymbol("leftSDF");
export const rightSDF = getSymbol("rightSDF");
