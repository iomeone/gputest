/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getVertex loadInstance getMappedInstance getInstancedVertex symbols visibles symbol flags name infer(T) attr type link vertexIndex u32 instanceIndex parameters identifiers inferred func void vec2<u32> optional externals export exports linkable vertexIndex instanceIndex elementIndex mappedIndex".split(' '));
const t = {[_(4)]:_(["T",0,1,2,3]),[_(5)]:_([3]),[_(23)]:[{"at":18,[_(6)]:_(0),[_(7)]:2,[_(19)]:{[_(8)]:_(0),[_(11)]:{[_(8)]:"T",[_(10)]:_([9])},[_(10)]:_([12]),[_(16)]:[{[_(8)]:_(13),[_(11)]:_(14)},{[_(8)]:_(15),[_(11)]:_(14)}],[_(17)]:_(["T"]),[_(18)]:[{[_(8)]:"T","at":-1}]}},{"at":92,[_(6)]:_(1),[_(7)]:2,[_(19)]:{[_(8)]:_(1),[_(11)]:_(20),[_(10)]:_([12]),[_(16)]:[{[_(8)]:"i",[_(11)]:_(14)}]}},{"at":130,[_(6)]:_(2),[_(7)]:6,[_(19)]:{[_(8)]:_(2),[_(11)]:_(21),[_(10)]:_([22,12]),[_(16)]:[{[_(8)]:"v",[_(11)]:_(14)},{[_(8)]:"i",[_(11)]:_(14)}]}}],[_(25)]:[{"at":228,[_(6)]:_(3),[_(7)]:1,[_(19)]:{[_(8)]:_(3),[_(11)]:"T",[_(10)]:_([24]),[_(16)]:[{[_(8)]:_(13),[_(11)]:_(14)},{[_(8)]:_(15),[_(11)]:_(14)}],[_(17)]:_(["T",2,1,0])}}],[_(26)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  "name": "vertex/instanced",
  "code": _(["@infer ",11," T;\r\n\r\n@",12," fn ",0,"(",13,": u32, ",15,": u32) -> @",9," T;\r\n@",12," fn ",1,"(i: u32) { };\r\n\r\n@",22," @",12," fn ",2,"(v: u32, i: u32) -> ",21," { return ",21,"(i, i); };\r\n\r\n@",24," fn ",3,"(",13,": u32, ",15,": u32) -> T {\r\n  var ",29,": u32;\r\n\r\n  if (HAS_INSTANCES) {\r\n    let ",30," = ",2,"(",13,", ",15,");\r\n    ",29," = ",30,".x;\r\n\r\n    let uniformIndex = ",30,".y;\r\n    ",1,"(uniformIndex);\r\n  }\r\n  else {\r\n    ",29," = ",15,";\r\n  }\r\n\r\n  return ",0,"(",13,", ",29,");\r\n};"]).join(''),
  "hash": 2044235800368569,
  "table": t,
  "shake": [[0,[0,1,4]],[18,[1,4]],[92,[2,4]],[130,[3,4]],[228,[4]]],
  "tree": decompressAST([[1,0,14],[1,18,89],[1,74,107],[4,38,131,3],[1,0,9],[1,10,15],[2,9,26],[0,79,492],[1,0,7],[2,11,29],[2,60,61],[2,79,96],[2,128,140],[2,95,104]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getInstancedVertex = getSymbol("getInstancedVertex");
