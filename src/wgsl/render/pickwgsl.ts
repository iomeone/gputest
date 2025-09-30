/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getID getIndex getPickingID symbols visibles symbol flags name u32 type optional link attr parameters func externals vec2<u32> export index identifiers exports linkable return".split(' '));
const t = {[_(3)]:_([0,1,2]),[_(4)]:_([2]),[_(15)]:[{"at":0,[_(5)]:_(0),[_(6)]:6,[_(14)]:{[_(7)]:_(0),[_(9)]:_(8),[_(12)]:_([10,11]),[_(13)]:[{[_(7)]:"i",[_(9)]:_(8)}]}},{"at":57,[_(5)]:_(1),[_(6)]:6,[_(14)]:{[_(7)]:_(1),[_(9)]:_(8),[_(12)]:_([10,11]),[_(13)]:[{[_(7)]:"i",[_(9)]:_(8)}]}}],[_(20)]:[{"at":118,[_(5)]:_(2),[_(6)]:1,[_(14)]:{[_(7)]:_(2),[_(9)]:_(16),[_(12)]:_([17]),[_(13)]:[{[_(7)]:_(18),[_(9)]:_(8)}],[_(19)]:_([0,1])}}],[_(21)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "render/pick",
  "code": _(["@",10," @",11," fn ",0,"(i: u32) -> u32 { ",22," 0u; };\r\n@",10," @",11," fn ",1,"(i: u32) -> u32 { ",22," i; };\r\n\r\n@",17," fn ",2,"(",18,": u32) -> ",16," {\r\n  ",22," ",16,"(",0,"(",18,"), ",1,"(",18,"));\r\n}"]).join(''),
  "hash": 4928432755048243,
  "table": t,
  "shake": [[0,[0,2]],[57,[1,2]],[118,[2]]],
  "tree": decompressAST([[4,0,54,0],[1,0,9],[1,10,15],[2,9,14],[4,38,94,1],[1,0,9],[1,10,15],[2,9,17],[0,42,147],[1,0,7],[2,11,23],[2,60,65],[2,14,22]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getPickingID = getSymbol("getPickingID");
