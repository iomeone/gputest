/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getTransformMatrix getStereographicBend getStereographicNormalize getStereographicPosition mat4x4<f32> link f32 optional export position return position stereoBend matrix".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([3]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(4),[Z]:_([5])}},{[A]:49,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:_(6),[Z]:_([7,5])}},{[A]:116,[R]:_(2),[G]:6,[F]:{[N]:_(2),[T]:_(6),[Z]:_([7,5])}}],[E]:[{[A]:190,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:C,[Z]:_([8]),[P]:[{[N]:_(9),[T]:C}],[I]:_([1,2,0])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  name: "transform/stereographic.wgsl",
  code: _(["@",5," fn ",0,"() -> ",4,";\r\n\r\n@",7," @",5," fn ",1,"() -> f32 { ",10," 0.0; };\r\n@",7," @",5," fn ",2,"() -> f32 { ",10," 1.0; };\r\n\r\n@",8," fn ",3,"(",9,": ",C,") -> ",C," {\r\n  let ",12," = ",1,"();\r\n  let stereoNormalize = ",2,"();\r\n\r\n  let ",13," = ",0,"();\r\n\r\n  if (",12," > 0.0001) {\r\n    if (",9,".z == -1.0) {\r\n      ",10," ",C,"(0.0);\r\n    }\r\n\r\n    let pos = ",9,".xyz;\r\n    let r = mix(1.0, length(pos), stereoNormalize);\r\n\r\n    let z = (pos.z + r);\r\n    let iz = 1.0/z;\r\n    let proj = pos.xy * iz;\r\n\r\n    var f = ",12,";\r\n    let mixed = mix(pos.xy, proj, f);\r\n    let out = ",D,"(mixed, mix(pos.z, r, f));\r\n\r\n    ",10," ",13," * ",C,"(out, 1.0);\r\n  }\r\n  ",10," ",13," * ",C,"(",9,".xyz, 1.0);\r\n}\n"]).join(''),
  hash: 0xfb3b38e687e12,
  table,
  shake: [[0,[0,3]],[49,[1,3]],[116,[2,3]],[190,[3]]],
  tree: decompressAST([[1,0,44],[4,49,113,1],[1,0,9],[1,10,15],[2,9,29],[4,48,117,2],[1,0,9],[1,10,15],[2,9,34],[0,55,744],[1,0,7],[2,11,35],[2,81,101],[2,49,74],[2,47,65]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getStereographicPosition = getSymbol("getStereographicPosition");
