/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getOffset getSize getInterleaveIndex symbols visibles symbol flags name u32 type optional link attr func externals export parameters identifiers exports linkable return".split(' '));
const t = {[_(3)]:_([0,1,2]),[_(4)]:_([2]),[_(14)]:[{"at":0,[_(5)]:_(0),[_(6)]:6,[_(13)]:{[_(7)]:_(0),[_(9)]:_(8),[_(12)]:_([10,11])}},{"at":55,[_(5)]:_(1),[_(6)]:6,[_(13)]:{[_(7)]:_(1),[_(9)]:_(8),[_(12)]:_([10,11])}}],[_(18)]:[{"at":110,[_(5)]:_(2),[_(6)]:1,[_(13)]:{[_(7)]:_(2),[_(9)]:_(8),[_(12)]:_([15]),[_(16)]:[{[_(7)]:"i",[_(9)]:_(8)}],[_(17)]:_([1,0])}}],[_(19)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "index/interleave",
  "code": _(["@",10," @",11," fn ",0,"() -> u32 { ",20," 0u; };\r\n@",10," @",11," fn ",1,"() -> u32 { ",20," 1u; };\r\n\r\n@",15," fn ",2,"(i: u32) -> u32 {\r\n  ",20," i * ",1,"() + ",0,"();\r\n}"]).join(''),
  "hash": 7888919931128864,
  "table": t,
  "shake": [[0,[0,2]],[55,[1,2]],[110,[2]]],
  "tree": decompressAST([[4,0,52,0],[1,0,9],[1,10,15],[2,9,18],[4,36,86,1],[1,0,9],[1,10,15],[2,9,16],[0,36,124],[1,0,7],[2,11,29],[2,50,57],[2,12,21]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getInterleaveIndex = getSymbol("getInterleaveIndex");
