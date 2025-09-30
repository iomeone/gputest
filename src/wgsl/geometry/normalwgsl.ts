/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getOrthoVector export return".split(' '));
const table = {[S]:_([0]),[W]:_([0]),[E]:[{[A]:0,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:D,[Z]:_([1]),[P]:[{[N]:"v",[T]:D}]}}]};
const data = {
  name: "geometry/normal.wgsl",
  code: _(["@",1," fn ",0,"(v: ",D,") -> ",D," {\r\n  let a = abs(v);\r\n  if (a.x < a.y) {\r\n    if (a.x < a.z) {\r\n      ",2," ",D,"(0.0, -v.z, v.y);\r\n    }\r\n    ",2," ",D,"(-v.y, v.x, 0.0);\r\n  }\r\n  else {\r\n    if (a.y < a.z) {\r\n      ",2," ",D,"(v.z, 0.0, -v.x);\r\n    }\r\n    ",2," ",D,"(-v.y, v.x, 0.0);\r\n  }\r\n}\n"]).join(''),
  hash: 0x1279a99fb38215,
  table,
  shake: [[0,[0]]],
  tree: decompressAST([[0,0,334],[1,0,7],[2,11,25]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getOrthoVector = getSymbol("getOrthoVector");
