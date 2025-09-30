/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getScissorColor isScissored symbols visibles symbol flags name vec4<f32> type export attr color min4 parameters func bool exports return".split(' '));
const t = {[_(2)]:_([0,1]),[_(3)]:_([0,1]),[_(16)]:[{"at":0,[_(4)]:_(0),[_(5)]:1,[_(14)]:{[_(6)]:_(0),[_(8)]:_(7),[_(10)]:_([9]),[_(13)]:[{[_(6)]:_(11),[_(8)]:_(7)},{[_(6)]:_(12),[_(8)]:_(7)}]}},{"at":411,[_(4)]:_(1),[_(5)]:1,[_(14)]:{[_(6)]:_(1),[_(8)]:_(15),[_(10)]:_([9]),[_(13)]:[{[_(6)]:_(12),[_(8)]:_(7)}]}}]};
const data = {
  "name": "mask/scissor",
  "code": _(["@",9," fn ",0,"(",11,": ",7,", ",12,": ",7,") -> ",7," {\r\n  let min2 = min(",12,".xy, ",12,".zw);\r\n  let m = min(min2.x, min2.y);\r\n\r\n  let dx = dpdx(m);\r\n  let dy = dpdy(m);\r\n  let l = (length(dx) + length(dy));\r\n\r\n  let alpha = clamp(m / l + 0.5, 0.0, 1.0);\r\n  if (HAS_ALPHA_TO_COVERAGE) {\r\n    ",17," ",7,"(",11,".xyz, ",11,".a * alpha);\r\n  }\r\n  else {\r\n    ",17," ",11," * alpha;\r\n  }\r\n}\r\n\r\n@",9," fn ",1,"(",12,": ",7,") -> ",15," {\r\n  let min2 = min(",12,".xy, ",12,".zw);\r\n  let m = min(min2.x, min2.y);\r\n  ",17," m < 0.0;\r\n}"]).join(''),
  "hash": 8612017705489407,
  "table": t,
  "shake": [[0,[0]],[411,[1]]],
  "tree": decompressAST([[0,0,407],[1,0,7],[2,11,26],[0,400,540],[1,0,7],[2,11,22]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getScissorColor = getSymbol("getScissorColor");
export const isScissored = getSymbol("isScissored");
