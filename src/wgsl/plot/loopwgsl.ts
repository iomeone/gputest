/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("loopSurface symbols visibles symbol flags name vec3<u32> type export attr index size offset vec2<i32> parameters func exports offset".split(' '));
const t = {[_(1)]:_([0]),[_(2)]:_([0]),[_(16)]:[{"at":0,[_(3)]:_(0),[_(4)]:1,[_(15)]:{[_(5)]:_(0),[_(7)]:_(6),[_(9)]:_([8]),[_(14)]:[{[_(5)]:_(10),[_(7)]:_(6)},{[_(5)]:_(11),[_(7)]:_(6)},{[_(5)]:_(12),[_(7)]:_(13)}]}}]};
const data = {
  "name": "plot/loop",
  "code": _(["@",8," fn ",0,"(",10,": ",6,", ",11,": ",6,", ",12,": ",13,") -> ",6," {\r\n  var sx = i32(",10,".x) + ",12,".x;\r\n  if (LOOP_X) {\r\n    if (sx < 0) { sx = sx + i32(",11,".x); }\r\n    if (sx >= i32(",11,".x)) { sx = sx - i32(",11,".x); }\r\n  }\r\n  else {\r\n    if (sx < 0) { sx = 0; }\r\n    if (sx >= i32(",11,".x)) { sx = i32(",11,".x) - 1; }\r\n  }\r\n\r\n  var sy = i32(",10,".y) + ",12,".y;\r\n  if (LOOP_Y) {\r\n    if (sy < 0) { sy = sy + i32(",11,".y); }\r\n    if (sy >= i32(",11,".y)) { sy = sy - i32(",11,".y); }\r\n  }\r\n  else {\r\n    if (sy < 0) { sy = 0; }\r\n    if (sy >= i32(",11,".y)) { sy = i32(",11,".y) - 1; }\r\n  }\r\n\r\n  return ",6,"(u32(sx), u32(sy), ",10,".z);\r\n}"]).join(''),
  "hash": 1019515891030513,
  "table": t,
  "shake": [[0,[0]]],
  "tree": decompressAST([[0,0,658],[1,0,7],[2,11,22]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const loopSurface = getSymbol("loopSurface");
