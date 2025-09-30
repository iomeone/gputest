/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/use/arraywgsl";
const {} = symbolDictionary;
const _ = decompressString("getSize getSample setSample memoSample symbols visibles ../../wgsl/use/array name packIndex2 sizeToModulus2 imported imports modules symbol flags vec2<u32> type link attr func u32 parameters identifiers void infer(T) inferred externals compute export globalId vec3<u32> builtin(global_invocation_id) exports linkable".split(' '));
const t = {[_(4)]:_([0,"T",1,2,3]),[_(5)]:_([3]),[_(12)]:[{"at":0,[_(7)]:_(6),[_(4)]:_([8,9]),[_(11)]:[{[_(7)]:_(8),[_(10)]:_(8)},{[_(7)]:_(9),[_(10)]:_(9)}]}],[_(26)]:[{"at":63,[_(13)]:_(0),[_(14)]:2,[_(19)]:{[_(7)]:_(0),[_(16)]:_(15),[_(18)]:_([17])}},{"at":118,[_(13)]:_(1),[_(14)]:2,[_(19)]:{[_(7)]:_(1),[_(16)]:"T",[_(18)]:_([17]),[_(21)]:[{[_(7)]:"i",[_(16)]:_(20)}],[_(22)]:_(["T"])}},{"at":152,[_(13)]:_(2),[_(14)]:2,[_(19)]:{[_(7)]:_(2),[_(16)]:_(23),[_(18)]:_([17]),[_(21)]:[{[_(7)]:"i",[_(16)]:_(20)},{[_(7)]:"v",[_(16)]:"T",[_(18)]:_([24])}],[_(22)]:_(["T"]),[_(25)]:[{[_(7)]:"T","at":1}]}}],[_(32)]:[{"at":199,[_(13)]:_(3),[_(14)]:1,[_(19)]:{[_(7)]:_(3),[_(16)]:_(23),[_(18)]:_([27,"workgroup_size(8, 8)",28]),[_(21)]:[{[_(7)]:_(29),[_(16)]:_(30),[_(18)]:_([31])}],[_(22)]:_([0,2,1])}}],[_(33)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  "name": "compute/memo2",
  "code": _(["use '",6,"'::{ ",8,", ",9," };\r\n\r\n@",17," fn ",0,"() -> ",15," {};\r\n\r\n@infer ",16," T;\r\n@",17," fn ",1,"(i: u32) -> T;\r\n@",17," fn ",2,"(i: u32, @",24," v: T);\r\n\r\n@",27," @workgroup_size(8, 8)\r\n@",28," fn ",3,"(\r\n  @",31," ",29,": ",30,",\r\n) {\r\n  let size = ",0,"();\r\n  let xy = ",15,"(",29,".xy);\r\n  if (any(xy >= size)) { return; }\r\n\r\n  let m = ",9,"(size);\r\n  let i = ",8,"(xy, m);\r\n  ",2,"(i, ",1,"(i));\r\n}"]).join(''),
  "hash": 4029557326344602,
  "table": t,
  "shake": [[63,[0,4]],[102,[1,2,4,3]],[118,[2,4]],[152,[3,4]],[199,[4]]],
  "tree": decompressAST([[1,0,58],[1,63,97],[1,39,53],[1,16,47],[1,34,76],[0,47,357],[3,0,8],[3,9,30],[1,23,30],[2,11,21],[3,15,45],[2,71,78],[2,96,110],[2,33,43],[2,22,31],[2,13,22]], t[S]),
};
const libs = {"../../wgsl/use/array": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const memoSample = getSymbol("memoSample");
