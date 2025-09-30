/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSDF getOutline getUVScale scaleSDF outlineSDF getFilledMask getOutlinedMask f32 link vec2<f32> optional export getSDF return getUVScale scaleSDF outline".split(' '));
const table = {[S]:_([0,1,2,3,4,5,6]),[W]:_([5,6]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(7),[Z]:_([8]),[P]:[{[N]:"uv",[T]:_(9)}]}},{[A]:40,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:_(7),[Z]:_([10,8])}}],[E]:[{[A]:579,[R]:_(5),[G]:1,[F]:{[N]:_(5),[T]:_(7),[Z]:_([11]),[P]:[{[N]:"uv",[T]:_(9)}],[I]:_([0,2,3])}},{[A]:710,[R]:_(6),[G]:1,[F]:{[N]:_(6),[T]:_(7),[Z]:_([11]),[P]:[{[N]:"uv",[T]:_(9)}],[I]:_([2,4,0,3])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "mask/point.wgsl",
  code: _(["@",8," fn ",0,"(uv: ",9,") -> f32;\r\n@",10," @",8," fn ",1,"() -> f32 { ",13," 0.0; }\r\n\r\nfn ",2,"(uv: ",9,") -> f32 {\r\n  let dx = dpdx(uv);\r\n  let dy = dpdy(uv);\r\n  // implicit * 2 / 2\r\n  ",13," (length(dx) + length(dy));\r\n}\r\n\r\nfn ",3,"(sdf: f32, scale: f32) -> f32 {\r\n  let d = sdf / scale + 0.5;\r\n  ",13," clamp(d, 0.0, 1.0) * max(0.0, min(1.0, 2.0 / scale) * 2.0 - 1.0);\r\n}\r\n\r\nfn ",4,"(sdf: f32, scale: f32) -> f32 {\r\n  let ",16," = ",1,"();\r\n  if (",16," > 0) { ",13," min(sdf, -sdf + ",16," * scale); }\r\n  ",13," min(sdf, 0.4 - sdf);\r\n}\r\n\r\n@",11," fn ",5,"(uv: ",9,") -> f32 {\r\n  let l = ",0,"(uv);\r\n  let s = ",2,"(uv);\r\n  ",13," ",3,"(l, s);\r\n}\r\n\r\n@",11," fn ",1,"dMask(uv: ",9,") -> f32 {\r\n  let s = ",2,"(uv);\r\n  let l = ",4,"(",0,"(uv), s);\r\n  ",13," ",3,"(l, s);\r\n}\n"]).join(''),
  hash: 0x1faf9bf6ba0af3,
  table,
  shake: [[0,[0,5,6]],[40,[1,4,6]],[94,[2,5,6]],[242,[3,5,6]],[397,[4,6]],[579,[5]],[710,[6]]],
  tree: decompressAST([[1,0,37],[4,40,94,1],[1,0,9],[1,10,15],[2,9,19],[0,35,183],[2,7,17],[0,141,296],[2,7,15],[0,148,326],[2,7,17],[2,59,69],[0,116,243],[1,0,7],[2,11,24],[2,49,55],[2,23,33],[2,26,34],[0,22,166],[1,0,7],[2,11,26],[2,51,61],[2,27,37],[2,11,17],[2,26,34]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getFilledMask = getSymbol("getFilledMask");
export const getOutlinedMask = getSymbol("getOutlinedMask");
