/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/mask/sdfwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSDF getOutline outlineSDF getFilledMask getOutlinedMask ../../wgsl/mask/sdf getUVScale scaleSDF f32 link vec2<f32> optional export sdf scale getUVScale scaleSDF getSDF return export outline select".split(' '));
const table = {[S]:_([0,1,2,3,4]),[W]:_([2,3,4]),[O]:[{[A]:0,[N]:_(5),[S]:_([6,7]),[K]:[{[N]:_(6),[J]:_(6)},{[N]:_(7),[J]:_(7)}]}],[X]:[{[A]:56,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(8),[Z]:_([9]),[P]:[{[N]:"uv",[T]:_(10)}]}},{[A]:96,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:_(8),[Z]:_([11,9])}}],[E]:[{[A]:154,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(8),[Z]:_([12]),[P]:[{[N]:_(13),[T]:_(8)},{[N]:_(14),[T]:_(8)}],[I]:_([1])}},{[A]:340,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(8),[Z]:_([12]),[P]:[{[N]:"uv",[T]:_(10)}],[I]:_([0])}},{[A]:535,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:_(8),[Z]:_([12]),[P]:[{[N]:"uv",[T]:_(10)}],[I]:_([2,0])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "mask/point.wgsl",
  code: _(["use '",5,"'::{ ",6,", ",7," };\r\n\r\n@",9," fn ",0,"(uv: ",10,") -> f32;\r\n@",11," @",9," fn ",1,"() -> f32 { ",18," 0.0; }\r\n\r\n@",12," fn ",2,"(sdf: f32, ",14,": f32) -> f32 {\r\n  let ",20," = ",1,"();\r\n  if (",20," > 0) { ",18," min(sdf, -sdf + ",20," * ",14,"); }\r\n  ",18," min(sdf, 0.4 - sdf);\r\n}\r\n\r\n@",12," fn ",3,"(uv: ",10,") -> f32 {\r\n  let l = ",0,"(uv);\r\n  let s = ",6,"(uv);\r\n  let a = ",7,"(l, s);\r\n  ",18," ",21,"(",21,"(0.0, 1.0, a >= 0.5), a, POINT_SMOOTH);\r\n}\r\n\r\n@",12," fn ",1,"dMask(uv: ",10,") -> f32 {\r\n  let s = ",6,"(uv);\r\n  let l = ",2,"(",0,"(uv), s);\r\n  let a = ",7,"(l, s);\r\n  ",18," ",21,"(",21,"(0.0, 1.0, a >= 0.5), a, POINT_SMOOTH);\r\n}\n"]).join(''),
  hash: 0x1843ff1839789d,
  table,
  shake: [[56,[0,3,4]],[96,[1,2,4]],[154,[2,4]],[340,[3]],[535,[4]]],
  tree: decompressAST([[1,0,51],[1,56,93],[4,40,94,1],[1,0,9],[1,10,15],[2,9,19],[0,39,221],[1,0,7],[2,11,21],[2,59,69],[0,116,307],[1,0,7],[2,11,24],[2,49,55],[2,23,33],[2,27,35],[0,85,293],[1,0,7],[2,11,26],[2,51,61],[2,27,37],[2,11,17],[2,27,35]], table[S]),
};

const libs = {"../../wgsl/mask/sdf": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const outlineSDF = getSymbol("outlineSDF");
export const getFilledMask = getSymbol("getFilledMask");
export const getOutlinedMask = getSymbol("getOutlinedMask");
