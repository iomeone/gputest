/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getTexture getTextureColor symbols visibles symbol flags name vec4<f32> type optional link attr vec2<f32> parameters func externals export color identifiers exports linkable".split(' '));
const t = {[_(2)]:_([0,1]),[_(3)]:_([1]),[_(15)]:[{"at":0,[_(4)]:_(0),[_(5)]:6,[_(14)]:{[_(6)]:_(0),[_(8)]:_(7),[_(11)]:_([9,10]),[_(13)]:[{[_(6)]:"uv",[_(8)]:_(12)}]}}],[_(19)]:[{"at":104,[_(4)]:_(1),[_(5)]:1,[_(14)]:{[_(6)]:_(1),[_(8)]:_(7),[_(11)]:_([16]),[_(13)]:[{[_(6)]:_(17),[_(8)]:_(7)},{[_(6)]:"uv",[_(8)]:_(7)},{[_(6)]:"st",[_(8)]:_(7)}],[_(18)]:_([0])}}],[_(20)]:{[_(0)]:true}};
const data = {
  "name": "mask/textured",
  "code": _(["@",9," @",10," fn ",0,"(uv: ",12,") -> ",7," { return ",7,"(1.0, 1.0, 1.0, 1.0); };\r\n\r\n@",16," fn ",0,"Color(",17,": ",7,", uv: ",7,", st: ",7,") -> ",7," {\r\n  return ",17," * ",0,"(uv.xy);\r\n}"]).join(''),
  "hash": 2421114591858017,
  "table": t,
  "shake": [[0,[0,1]],[104,[1]]],
  "tree": decompressAST([[4,0,99,0],[1,0,9],[1,10,15],[2,9,19],[0,85,214],[1,0,7],[2,11,26],[2,97,107]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getTextureColor = getSymbol("getTextureColor");
