/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getScissorMin getScissorMax getScissorLoop getScissorLevel symbols visibles symbol flags name vec4<f32> type link attr func optional externals export position parameters identifiers exports linkable position select".split(' '));
const t = {[_(4)]:_([0,1,2,3]),[_(5)]:_([3]),[_(15)]:[{"at":0,[_(6)]:_(0),[_(7)]:2,[_(13)]:{[_(8)]:_(0),[_(10)]:_(9),[_(12)]:_([11])}},{"at":43,[_(6)]:_(1),[_(7)]:2,[_(13)]:{[_(8)]:_(1),[_(10)]:_(9),[_(12)]:_([11])}},{"at":86,[_(6)]:_(2),[_(7)]:6,[_(13)]:{[_(8)]:_(2),[_(10)]:_(9),[_(12)]:_([14,11])}}],[_(20)]:[{"at":181,[_(6)]:_(3),[_(7)]:1,[_(13)]:{[_(8)]:_(3),[_(10)]:_(9),[_(12)]:_([16]),[_(18)]:[{[_(8)]:_(17),[_(10)]:_(9)}],[_(19)]:_([0,1,2])}}],[_(21)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  "name": "transform/scissor",
  "code": _(["@",11," fn ",0,"() -> ",9," {};\r\n@",11," fn ",1,"() -> ",9," {};\r\n@",14," @",11," fn ",2,"() -> ",9," { return ",9,"(0.0, 0.0, 0.0, 0.0); };\r\n\r\n@",16," fn ",3,"(",17,": ",9,") -> ",9," {\r\n\r\n  var smin = ",0,"();\r\n  var smax = ",1,"();\r\n  let sloop = ",2,"();\r\n\r\n  if (HAS_SCISSOR_LOOP) {\r\n    smin = ",23,"(smin, smin + sloop, smin < -sloop);\r\n    smin = ",23,"(smin, smin - sloop, smin > sloop);\r\n    smax = ",23,"(smax, smax + sloop, smax < -sloop);\r\n    smax = ",23,"(smax, smax - sloop, smax > sloop);\r\n  }\r\n\r\n  var pmin = ",17," - smin;\r\n  var pmax = smax - ",17,";\r\n\r\n  if (HAS_SCISSOR_LOOP) {\r\n    pmin = ",23,"(pmin, pmin + sloop, pmin < -sloop);\r\n    pmin = ",23,"(pmin, pmin - sloop, pmin > sloop);\r\n    pmax = ",23,"(pmax, pmax + sloop, pmax < -sloop);\r\n    pmax = ",23,"(pmax, pmax - sloop, pmax > sloop);\r\n  }\r\n\r\n  return ",23,"(pmin, pmax, abs(pmin) > abs(pmax));\r\n};"]).join(''),
  "hash": 3223774049185856,
  "table": t,
  "shake": [[0,[0,3]],[43,[1,3]],[86,[2,3]],[181,[3]]],
  "tree": decompressAST([[1,0,40],[1,43,83],[4,43,133,2],[1,0,9],[1,10,15],[2,9,23],[0,76,861],[1,0,7],[2,11,26],[2,68,81],[2,31,44],[2,32,46]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getScissorLevel = getSymbol("getScissorLevel");
