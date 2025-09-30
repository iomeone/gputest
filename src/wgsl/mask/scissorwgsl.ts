/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getScissorColor isScissored export color min4 bool return".split(' '));
const table = {[S]:_([0,1]),[W]:_([0,1]),[E]:[{[A]:0,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:C,[Z]:_([2]),[P]:[{[N]:_(3),[T]:C},{[N]:_(4),[T]:C}]}},{[A]:411,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(5),[Z]:_([2]),[P]:[{[N]:_(4),[T]:C}]}}]};
const data = {
  name: "mask/scissor.wgsl",
  code: _(["@",2," fn ",0,"(",3,": ",C,", ",4,": ",C,") -> ",C," {\r\n  let min2 = min(",4,".xy, ",4,".zw);\r\n  let m = min(min2.x, min2.y);\r\n\r\n  let dx = dpdx(m);\r\n  let dy = dpdy(m);\r\n  let l = (length(dx) + length(dy));\r\n\r\n  let alpha = clamp(m / l + 0.5, 0.0, 1.0);\r\n  if (HAS_ALPHA_TO_COVERAGE) {\r\n    ",6," ",C,"(",3,".xyz, ",3,".a * alpha);\r\n  }\r\n  else {\r\n    ",6," ",3," * alpha;\r\n  }\r\n}\r\n\r\n@",2," fn ",1,"(",4,": ",C,") -> ",5," {\r\n  let min2 = min(",4,".xy, ",4,".zw);\r\n  let m = min(min2.x, min2.y);\r\n  ",6," m < 0.0;\r\n}\n"]).join(''),
  hash: 0xd076f81241b54,
  table,
  shake: [[0,[0]],[411,[1]]],
  tree: decompressAST([[0,0,407],[1,0,7],[2,11,26],[0,400,540],[1,0,7],[2,11,22]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getScissorColor = getSymbol("getScissorColor");
export const isScissored = getSymbol("isScissored");
