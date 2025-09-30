/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("applyTransform getParent getSelf getCombinedClip getTransformedClip transformClip intersectClips symbols visibles symbol flags name vec4<f32> type optional link attr parameters func u32 externals export identifiers exports linkable applyTransform return getParent transformClip".split(' '));
const t = {[_(7)]:_([0,1,2,3,4,5,6]),[_(8)]:_([3,4]),[_(20)]:[{"at":0,[_(9)]:_(0),[_(10)]:6,[_(18)]:{[_(11)]:_(0),[_(13)]:_(12),[_(16)]:_([14,15]),[_(17)]:[{[_(11)]:"p",[_(13)]:_(12)}]}},{"at":78,[_(9)]:_(1),[_(10)]:2,[_(18)]:{[_(11)]:_(1),[_(13)]:_(12),[_(16)]:_([15]),[_(17)]:[{[_(11)]:"i",[_(13)]:_(19)}]}},{"at":120,[_(9)]:_(2),[_(10)]:6,[_(18)]:{[_(11)]:_(2),[_(13)]:_(12),[_(16)]:_([14,15]),[_(17)]:[{[_(11)]:"i",[_(13)]:_(19)}]}}],[_(23)]:[{"at":213,[_(9)]:_(3),[_(10)]:1,[_(18)]:{[_(11)]:_(3),[_(13)]:_(12),[_(16)]:_([21]),[_(17)]:[{[_(11)]:"i",[_(13)]:_(19)}],[_(22)]:_([5,1,2,6])}},{"at":364,[_(9)]:_(4),[_(10)]:1,[_(18)]:{[_(11)]:_(4),[_(13)]:_(12),[_(16)]:_([21]),[_(17)]:[{[_(11)]:"i",[_(13)]:_(19)}],[_(22)]:_([5,1])}}],[_(24)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  "name": "layout/clip",
  "code": _(["@",14," @",15," fn ",0,"(p: ",12,") -> ",12," { ",26," p; }\r\n\r\n@",15," fn ",1,"(i: u32) -> ",12,";\r\n@",14," @",15," fn ",2,"(i: u32) -> ",12," { ",26," ",12,"(0.0, 0.0, 0.0, 0.0); }\r\n\r\n@",21," fn ",3,"(i: u32) -> ",12," {\r\n  let a = ",5,"(",1,"(i));\r\n  let b = ",2,"(i);\r\n  ",26," ",6,"(a, b);\r\n}\r\n\r\n@",21," fn ",4,"(i: u32) -> ",12," {\r\n  ",26," ",5,"(",1,"(i));\r\n}\r\n\r\nfn ",5,"(rect: ",12,") -> ",12," {\r\n  let ul = ",0,"(",12,"(rect.xy, 0.5, 1.0));\r\n  let br = ",0,"(",12,"(rect.zw, 0.5, 1.0));\r\n\r\n  ",26," ",12,"(ul.xy, br.xy);\r\n}\r\n\r\nfn ",6,"(a: ",12,", b: ",12,") -> ",12," {\r\n  ",26," ",12,"(max(a.xy, b.xy), min(a.zw, b.zw));\r\n}"]).join(''),
  "hash": 4394809853346702,
  "table": t,
  "shake": [[0,[0,5,3,4]],[78,[1,3,4]],[120,[2,3]],[213,[3]],[364,[4]],[458,[5,3,4]],[666,[6,3]]],
  "tree": decompressAST([[4,0,74,0],[1,0,9],[1,10,15],[2,9,23],[1,59,98],[4,42,131,2],[1,0,9],[1,10,15],[2,9,16],[0,74,221],[1,0,7],[2,11,26],[2,50,63],[2,14,23],[2,26,33],[2,22,36],[0,28,122],[1,0,7],[2,11,29],[2,52,65],[2,14,23],[0,17,225],[2,7,20],[2,58,72],[2,58,72],[0,85,207],[2,7,21]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getCombinedClip = getSymbol("getCombinedClip");
export const getTransformedClip = getSymbol("getTransformedClip");
