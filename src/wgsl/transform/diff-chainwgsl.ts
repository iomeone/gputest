/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("transformPositionA getDifferentialA getDifferentialB getChainDifferential symbols visibles symbol flags name vec4<f32> type link attr origin parameters func vector contravariant bool externals export identifiers exports linkable origin vector contravariant".split(' '));
const t = {[_(4)]:_([0,1,2,3]),[_(5)]:_([3]),[_(19)]:[{"at":0,[_(6)]:_(0),[_(7)]:2,[_(15)]:{[_(8)]:_(0),[_(10)]:_(9),[_(12)]:_([11]),[_(14)]:[{[_(8)]:_(13),[_(10)]:_(9)}]}},{"at":64,[_(6)]:_(1),[_(7)]:2,[_(15)]:{[_(8)]:_(1),[_(10)]:_(9),[_(12)]:_([11]),[_(14)]:[{[_(8)]:_(16),[_(10)]:_(9)},{[_(8)]:_(13),[_(10)]:_(9)},{[_(8)]:_(17),[_(10)]:_(18)}]}},{"at":164,[_(6)]:_(2),[_(7)]:2,[_(15)]:{[_(8)]:_(2),[_(10)]:_(9),[_(12)]:_([11]),[_(14)]:[{[_(8)]:_(16),[_(10)]:_(9)},{[_(8)]:_(13),[_(10)]:_(9)},{[_(8)]:_(17),[_(10)]:_(18)}]}}],[_(22)]:[{"at":266,[_(6)]:_(3),[_(7)]:1,[_(15)]:{[_(8)]:_(3),[_(10)]:_(9),[_(12)]:_([20]),[_(14)]:[{[_(8)]:_(16),[_(10)]:_(9)},{[_(8)]:_(13),[_(10)]:_(9)},{[_(8)]:_(17),[_(10)]:_(18)}],[_(21)]:_([1,2,0])}}],[_(23)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  "name": "transform/diff-chain",
  "code": _(["@",11," fn ",0,"(",13,": ",9,") -> ",9,";\r\n\r\n@",11," fn ",1,"(",16,": ",9,", ",13,": ",9,", ",17,": ",18,") -> ",9,";\r\n@",11," fn ",2,"(",16,": ",9,", ",13,": ",9,", ",17,": ",18,") -> ",9,";\r\n\r\n@",20," fn ",3,"(",16,": ",9,", ",13,": ",9,", ",17,": ",18,") -> ",9," {\r\n  let v = ",1,"(",16,", ",13,", ",17,");\r\n  return ",2,"(v, ",0,"(",13,"), ",17,");\r\n}"]).join(''),
  "hash": 6627707942320733,
  "table": t,
  "shake": [[0,[0,3]],[64,[1,3]],[164,[2,3]],[266,[3]]],
  "tree": decompressAST([[1,0,59],[1,64,161],[1,100,197],[0,102,344],[1,0,7],[2,11,31],[2,106,122],[2,59,75],[2,20,38]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getChainDifferential = getSymbol("getChainDifferential");
