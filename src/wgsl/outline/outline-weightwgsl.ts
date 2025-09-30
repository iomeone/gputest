/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("depthWeight depthWeightPlus normalWeight facetWeight f32 export u32 export return select".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([0,1,2,3]),[E]:[{[A]:0,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:_(4),[Z]:_([5]),[P]:[{[N]:"a",[T]:_(4)},{[N]:"b",[T]:_(4)}]}},{[A]:198,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(4),[Z]:_([5]),[P]:[{[N]:"c",[T]:_(4)},{[N]:"l",[T]:_(4)},{[N]:"r",[T]:_(4)},{[N]:"t",[T]:_(4)},{[N]:"b",[T]:_(4)}],[I]:_([0])}},{[A]:364,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(4),[Z]:_([5]),[P]:[{[N]:"a",[T]:D},{[N]:"b",[T]:D}]}},{[A]:505,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(4),[Z]:_([5]),[P]:[{[N]:"a",[T]:_(6)},{[N]:"b",[T]:_(6)}]}}]};
const data = {
  name: "outline/outline-weight.wgsl",
  code: _(["@",5," fn ",0,"(a: f32, b: f32) -> f32 {\r\n  ",8," max(0.0,\r\n    min(\r\n      ",9,"(0.0, a / b, b > 0),\r\n      ",9,"(0.0, b / a, a > 0),\r\n    ) * DEPTH_RAMP - (DEPTH_RAMP - 1.0)\r\n  );\r\n}\r\n\r\n@",5," fn ",0,"Plus(c: f32, l: f32, r: f32, t: f32, b: f32) -> f32 {\r\n  let avg = (l + r + t + b) / 4.0;\r\n  ",8," min(1.0, ",0,"(c, avg) * 1.02);\r\n}\r\n\r\n@",5," fn ",2,"(a: ",D,", b: ",D,") -> f32 {\r\n  ",8," clamp(dot(a, b) * NORMAL_RAMP - (NORMAL_RAMP - 1.0), 0.0, 1.0);\r\n}\r\n\r\n@",5," fn ",3,"(a: u32, b: u32) -> f32 {\r\n  ",8," ",9,"(1.0, 0.0, a != b);\r\n}\n"]).join(''),
  hash: 0x191d1f19dcd8dd,
  table,
  shake: [[0,[0,1]],[198,[1]],[364,[2]],[505,[3]]],
  tree: decompressAST([[0,0,194],[1,0,7],[2,11,22],[0,187,349],[1,0,7],[2,11,26],[2,120,131],[0,35,172],[1,0,7],[2,11,23],[0,130,216],[1,0,7],[2,11,22]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const depthWeight = getSymbol("depthWeight");
export const depthWeightPlus = getSymbol("depthWeightPlus");
export const normalWeight = getSymbol("normalWeight");
export const facetWeight = getSymbol("facetWeight");
