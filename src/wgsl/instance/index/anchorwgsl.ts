/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getAnchor getAnchorIndex symbols visibles symbol flags name infer(T) attr type link instanceIndex u32 parameters inferred func externals vec2<u32> export identifiers exports linkable".split(' '));
const t = {[_(2)]:_([0,1]),[_(3)]:_([1]),[_(16)]:[{"at":0,[_(4)]:_(0),[_(5)]:2,[_(15)]:{[_(6)]:_(0),[_(9)]:{[_(6)]:"T",[_(8)]:_([7])},[_(8)]:_([10]),[_(13)]:[{[_(6)]:_(11),[_(9)]:_(12)}],[_(14)]:[{[_(6)]:"T","at":-1}]}}],[_(20)]:[{"at":58,[_(4)]:_(1),[_(5)]:1,[_(15)]:{[_(6)]:_(1),[_(9)]:_(17),[_(8)]:_([18]),[_(13)]:[{[_(6)]:"v",[_(9)]:_(12)},{[_(6)]:"i",[_(9)]:_(12)}],[_(19)]:_([0])}}],[_(21)]:{[_(0)]:true}};
const data = {
  "name": "index/anchor",
  "code": _(["@",10," fn ",0,"(",11,": u32) -> @",7," T;\r\n\r\n@",18," fn ",0,"Index(v: u32, i: u32) -> ",17," { return ",17,"(i, ",0,"(i).x); };"]).join(''),
  "hash": 5143013773608046,
  "table": t,
  "shake": [[0,[0,1]],[58,[1]]],
  "tree": decompressAST([[1,0,53],[0,58,153],[1,0,7],[2,11,25],[2,66,75]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getAnchorIndex = getSymbol("getAnchorIndex");
