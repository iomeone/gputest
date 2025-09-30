/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getIndex symbols visibles symbol flags name u32 type export attr parameters func exports".split(' '));
const t = {[_(1)]:_([0]),[_(2)]:_([0]),[_(12)]:[{"at":0,[_(3)]:_(0),[_(4)]:1,[_(11)]:{[_(5)]:_(0),[_(7)]:_(6),[_(9)]:_([8]),[_(10)]:[{[_(5)]:"i",[_(7)]:_(6)}]}}]};
const data = {
  "name": "instance/identity",
  "code": _(["@",8," fn ",0,"(i: u32) -> u32 { return i; }"]).join(''),
  "hash": 1344717481719576,
  "table": t,
  "shake": [[0,[0]]],
  "tree": decompressAST([[0,0,48],[1,0,7],[2,11,19]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getIndex = getSymbol("getIndex");
