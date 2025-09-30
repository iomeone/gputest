/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("depthWeight normalWeight f32 export".split(' '));
const table = {[S]:_([0,1]),[W]:_([0,1]),[E]:[{[A]:0,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:_(2),[Z]:_([3]),[P]:[{[N]:"a",[T]:_(2)},{[N]:"b",[T]:_(2)}]}},{[A]:198,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(2),[Z]:_([3]),[P]:[{[N]:"a",[T]:D},{[N]:"b",[T]:D}]}}]};
const data = {
  name: "ssao/ssao-weight.wgsl",
  code: _(["@",3," fn ",0,"(a: f32, b: f32) -> f32 {\r\n  return max(0.0,\r\n    min(\r\n      select(0.0, a / b, b > 0),\r\n      select(0.0, b / a, a > 0),\r\n    ) * DEPTH_RAMP - (DEPTH_RAMP - 1.0)\r\n  );\r\n}\r\n\r\n@",3," fn ",1,"(a: ",D,", b: ",D,") -> f32 {\r\n  return max(0.0, dot(a, b) * NORMAL_RAMP - (NORMAL_RAMP - 1.0));\r\n}\n"]).join(''),
  hash: 0x229b190e01e2d,
  table,
  shake: [[0,[0]],[198,[1]]],
  tree: decompressAST([[0,0,194],[1,0,7],[2,11,22],[0,187,317],[1,0,7],[2,11,23]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const depthWeight = getSymbol("depthWeight");
export const normalWeight = getSymbol("normalWeight");
