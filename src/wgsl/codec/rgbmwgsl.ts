/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("decodeRGBM16 symbols visibles symbol flags name vec4<f32> type export attr color parameters func exports".split(' '));
const t = {[_(1)]:_([0]),[_(2)]:_([0]),[_(13)]:[{"at":0,[_(3)]:_(0),[_(4)]:1,[_(12)]:{[_(5)]:_(0),[_(7)]:_(6),[_(9)]:_([8]),[_(11)]:[{[_(5)]:_(10),[_(7)]:_(6)}]}}]};
const data = {
  "name": "codec/rgbm",
  "code": _(["@",8," fn ",0,"(",10,": ",6,") -> ",6," {\r\n  return ",6,"(16.0 * ",10,".rgb * ",10,".a, 1.0);\r\n};"]).join(''),
  "hash": 2205439247557558,
  "table": t,
  "shake": [[0,[0]]],
  "tree": decompressAST([[0,0,113],[1,0,7],[2,11,23]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const decodeRGBM16 = getSymbol("decodeRGBM16");
