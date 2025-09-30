/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getEffect getDirection getValue getLayout getSlideMotion symbols visibles symbol flags name u32 type optional link attr func vec4<f32> f32 externals export position parameters identifiers exports linkable optional return getDirection".split(' '));
const t = {[_(5)]:_([0,1,2,3,4]),[_(6)]:_([4]),[_(18)]:[{"at":0,[_(7)]:_(0),[_(8)]:6,[_(15)]:{[_(9)]:_(0),[_(11)]:_(10),[_(14)]:_([12,13])}},{"at":54,[_(7)]:_(1),[_(8)]:6,[_(15)]:{[_(9)]:_(1),[_(11)]:_(16),[_(14)]:_([12,13])}},{"at":130,[_(7)]:_(2),[_(8)]:6,[_(15)]:{[_(9)]:_(2),[_(11)]:_(17),[_(14)]:_([12,13])}},{"at":183,[_(7)]:_(3),[_(8)]:6,[_(15)]:{[_(9)]:_(3),[_(11)]:_(16),[_(14)]:_([12,13])}}],[_(23)]:[{"at":258,[_(7)]:_(4),[_(8)]:1,[_(15)]:{[_(9)]:_(4),[_(11)]:_(16),[_(14)]:_([19]),[_(21)]:[{[_(9)]:_(20),[_(11)]:_(16)}],[_(22)]:_([0,1,2,3])}}],[_(24)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true}};
const data = {
  "name": "present/motion",
  "code": _(["@",12," @",13," fn ",0,"() -> u32 { ",26," 0; };\r\n@",12," @",13," fn ",1,"() -> ",16," { ",26," ",16,"(0.0); };\r\n@",12," @",13," fn ",2,"() -> f32 { ",26," 0; };\r\n@",12," @",13," fn ",3,"() -> ",16," { ",26," ",16,"(0.0); };\r\n\r\n@",19," fn ",4,"(",20,": ",16,") -> ",16," {\r\n  let e = ",0,"();\r\n  let d = ",1,"();\r\n  let v = ",2,"();\r\n  let l = ",3,"();\r\n\r\n  var p = ",20,";\r\n  // Move\r\n  if (e == 3) {\r\n    let direction = ",1,"();\r\n    let delta = ",16,"(l.zw - l.xy, 1.0, 0.0) * direction;\r\n\r\n    p += delta * p.w * v;\r\n  }\r\n\r\n  ",26," p;\r\n}"]).join(''),
  "hash": 3737415091498263,
  "table": t,
  "shake": [[0,[0,4]],[54,[1,4]],[130,[2,4]],[183,[3,4]],[258,[4]]],
  "tree": decompressAST([[4,0,51,0],[1,0,9],[1,10,15],[2,9,18],[4,35,108,1],[1,0,9],[1,10,15],[2,9,21],[4,57,107,2],[1,0,9],[1,10,15],[2,9,17],[4,34,104,3],[1,0,9],[1,10,15],[2,9,18],[0,56,418],[1,0,7],[2,11,25],[2,62,71],[2,24,36],[2,27,35],[2,23,32],[2,85,97]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getSlideMotion = getSymbol("getSlideMotion");
