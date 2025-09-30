/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("bv2rgb export color".split(' '));
const table = {[S]:_([0]),[W]:_([0]),[E]:[{[A]:134,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:C,[Z]:_([1]),[P]:[{[N]:_(2),[T]:C}]}}]};
const data = {
  name: "solar-system/bv2rgb.wgsl",
  code: _(["// Based on:\r\n// https://stackoverflow.com/questions/21977786/star-b-v-",2,"-index-to-apparent-rgb-",2,"\r\n\r\n// Star B-V ",2," to RGB\r\n@",1," fn ",0,"(",2,": ",C,") -> ",C," {\r\n\r\n    var t: f32;\r\n    var r: f32 = 0.0;\r\n    var g: f32 = 0.0;\r\n    var b: f32 = 0.0;\r\n\r\n    let bv = clamp(",2,".x, -0.4, 2.0);\r\n    let vmag = ",2,".y;\r\n\r\n         if ((bv >= -0.40) && (bv < 0.00)) { t = (bv + 0.40) / (0.00 + 0.40); r = 0.61 + (0.11 * t) + (0.1 * t * t); }\r\n    else if ((bv >=  0.00) && (bv < 0.40)) { t = (bv - 0.00) / (0.40 - 0.00); r = 0.83 + (0.17 * t);                 }\r\n    else if ((bv >=  0.40) && (bv < 2.10)) { t = (bv - 0.40) / (2.10 - 0.40); r = 1.00;                              }\r\n         if ((bv >= -0.40) && (bv < 0.00)) { t = (bv + 0.40) / (0.00 + 0.40); g = 0.70 + (0.07 * t) + (0.1 * t * t); }\r\n    else if ((bv >=  0.00) && (bv < 0.40)) { t = (bv - 0.00) / (0.40 - 0.00); g = 0.87 + (0.11 * t);                 }\r\n    else if ((bv >=  0.40) && (bv < 1.60)) { t = (bv - 0.40) / (1.60 - 0.40); g = 0.98 - (0.16 * t);                 }\r\n    else if ((bv >=  1.60) && (bv < 2.00)) { t = (bv - 1.60) / (2.00 - 1.60); g = 0.82              - (0.5 * t * t); }\r\n         if ((bv >= -0.40) && (bv < 0.40)) { t = (bv + 0.40) / (0.40 + 0.40); b = 1.00;                              }\r\n    else if ((bv >=  0.40) && (bv < 1.50)) { t = (bv - 0.40) / (1.50 - 0.40); b = 1.00 - (0.47 * t) + (0.1 * t * t); }\r\n    else if ((bv >=  1.50) && (bv < 1.94)) { t = (bv - 1.50) / (1.94 - 1.50); b = 0.63              - (0.6 * t * t); }\r\n\r\n    // https://en.wikipedia.org/wiki/Apparent_magnitude\r\n    let v = pow(2.512, -vmag) * 100.0;\r\n\r\n    return min(",C,"(1.414), ",C,"(r * v, g * v, b * v, 1));\r\n};\n"]).join(''),
  hash: 0x1bf47a714370a7,
  table,
  shake: [[134,[0]]],
  tree: decompressAST([[0,134,1716],[1,0,7],[2,11,17]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const bv2rgb = getSymbol("bv2rgb");
