/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getInstancedFaceIndex symbols visibles symbol flags name vec2<u32> type export attr u32 parameters func exports".split(' '));
const t = {[_(1)]:_([0]),[_(2)]:_([0]),[_(13)]:[{"at":0,[_(3)]:_(0),[_(4)]:1,[_(12)]:{[_(5)]:_(0),[_(7)]:_(6),[_(9)]:_([8]),[_(11)]:[{[_(5)]:"v",[_(7)]:_(10)},{[_(5)]:"i",[_(7)]:_(10)}]}}]};
const data = {
  "name": "index/face",
  "code": _(["@",8," fn ",0,"(v: u32, i: u32) -> ",6," { return ",6,"(i, i * 3u + v); };"]).join(''),
  "hash": 75141342276461,
  "table": t,
  "shake": [[0,[0]]],
  "tree": decompressAST([[0,0,98],[1,0,7],[2,11,32]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getInstancedFaceIndex = getSymbol("getInstancedFaceIndex");
