/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/use/viewwgsl";
const {} = symbolDictionary;
const _ = decompressString("transformPosition getGridAutoState symbols visibles ../../wgsl/use/view name getViewPosition imported imports modules symbol flags vec4<f32> type optional link attr parameters func externals bool export base shift identifiers exports linkable transformPosition".split(' '));
const t = {[_(2)]:_([0,1]),[_(3)]:_([1]),[_(9)]:[{"at":0,[_(5)]:_(4),[_(2)]:_([6]),[_(8)]:[{[_(5)]:_(6),[_(7)]:_(6)}]}],[_(19)]:[{"at":51,[_(10)]:_(0),[_(11)]:6,[_(18)]:{[_(5)]:_(0),[_(13)]:_(12),[_(16)]:_([14,15]),[_(17)]:[{[_(5)]:"p",[_(13)]:_(12)}]}}],[_(25)]:[{"at":133,[_(10)]:_(1),[_(11)]:1,[_(18)]:{[_(5)]:_(1),[_(13)]:_(20),[_(16)]:_([21]),[_(17)]:[{[_(5)]:_(22),[_(13)]:_(12)},{[_(5)]:_(23),[_(13)]:_(12)}],[_(24)]:_([0])}}],[_(26)]:{[_(0)]:true}};
const data = {
  "name": "plot/grid-auto",
  "code": _(["use '",4,"'::{ ",6," };\r\n\r\n@",14," @",15," fn ",0,"(p: ",12,") -> ",12," { return p; };\r\n\r\n@",21," fn ",1,"(",22,": ",12,", ",23,": ",12,") -> ",20," {\r\n  let v = ",6,"().xyz;\r\n\r\n  let p1 = ",0,"(",22,").xyz;\r\n  let p2 = ",0,"(",22," + ",23," * 0.001).xyz;\r\n\r\n  let n = p2 - p1;\r\n  let d = dot(v - p1, n);\r\n  return d > 0;\r\n}"]).join(''),
  "hash": 905780661579946,
  "table": t,
  "shake": [[51,[0,1]],[133,[1]]],
  "tree": decompressAST([[1,0,46],[4,51,128,0],[1,0,9],[1,10,15],[2,9,26],[0,63,338],[1,0,7],[2,11,27],[2,73,88],[2,37,54],[2,41,58]], t[S]),
};
const libs = {"../../wgsl/use/view": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getGridAutoState = getSymbol("getGridAutoState");
