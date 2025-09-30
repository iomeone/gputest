/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getPassThruColor symbols visibles symbol flags name vec4<f32> type export attr color parameters func exports".split(' '));
const t = {[_(1)]:_([0]),[_(2)]:_([0]),[_(13)]:[{"at":0,[_(3)]:_(0),[_(4)]:1,[_(12)]:{[_(5)]:_(0),[_(7)]:_(6),[_(9)]:_([8]),[_(11)]:[{[_(5)]:_(10),[_(7)]:_(6)},{[_(5)]:"uv",[_(7)]:_(6)},{[_(5)]:"st",[_(7)]:_(6)}]}}]};
const data = {
  "name": "mask/passthru",
  "code": _(["@",8," fn ",0,"(",10,": ",6,", uv: ",6,", st: ",6,") -> ",6," {\r\n  if (HAS_ALPHA_TO_COVERAGE) {\r\n    return ",6,"(",10,".xyz, ",10,".a);\r\n  }\r\n  else {\r\n    return ",6,"(",10,".xyz * ",10,".a, ",10,".a);\r\n  }\r\n}"]).join(''),
  "hash": 7862833523332142,
  "table": t,
  "shake": [[0,[0]]],
  "tree": decompressAST([[0,0,241],[1,0,7],[2,11,27]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getPassThruColor = getSymbol("getPassThruColor");
