/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getEffect getDirection getValue ramp getSlideMask symbols visibles symbol flags name u32 type optional link attr func vec4<f32> f32 externals export color parameters identifiers exports linkable optional return getDirection direction select".split(' '));
const t = {[_(5)]:_([0,1,2,3,4]),[_(6)]:_([4]),[_(18)]:[{"at":0,[_(7)]:_(0),[_(8)]:6,[_(15)]:{[_(9)]:_(0),[_(11)]:_(10),[_(14)]:_([12,13])}},{"at":55,[_(7)]:_(1),[_(8)]:6,[_(15)]:{[_(9)]:_(1),[_(11)]:_(16),[_(14)]:_([12,13])}},{"at":131,[_(7)]:_(2),[_(8)]:6,[_(15)]:{[_(9)]:_(2),[_(11)]:_(17),[_(14)]:_([12,13])}}],[_(23)]:[{"at":287,[_(7)]:_(4),[_(8)]:1,[_(15)]:{[_(9)]:_(4),[_(11)]:_(16),[_(14)]:_([19]),[_(21)]:[{[_(9)]:_(20),[_(11)]:_(16)},{[_(9)]:"uv",[_(11)]:_(16)},{[_(9)]:"st",[_(11)]:_(16)}],[_(22)]:_([0,1,2,3])}}],[_(24)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  "name": "present/mask",
  "code": _(["@",12," @",13," fn ",0,"() -> u32 { ",26," 0u; };\r\n@",12," @",13," fn ",1,"() -> ",16," { ",26," ",16,"(0.0); };\r\n@",12," @",13," fn ",2,"() -> f32 { ",26," 0.0; };\r\n\r\nfn ",3,"(x: f32, t: f32, s: f32) -> f32 {\r\n  ",26," clamp(x * s + mix(-s, 1.0, t), 0.0, 1.0);\r\n}\r\n\r\n@",19," fn ",4,"(",20,": ",16,", uv: ",16,", st: ",16,") -> ",16," {\r\n  let e = ",0,"();\r\n  let d = ",1,"();\r\n  let v = ",2,"();\r\n\r\n  var m = 1.0;\r\n  // Fade\r\n  if (e == 1u) {\r\n    m = 1.0 - abs(v);\r\n  }\r\n  // Wipe\r\n  else if (e == 2u) {\r\n    let ",28," = ",1,"();\r\n    let l = length(",28,");\r\n\r\n    let coord = ",29,"(st, 1.0 - st, (",28," * v) <= ",16,"(0.0));\r\n    let line = dot(coord, abs(",28,")) / (l + 1.0e-5);\r\n\r\n    m = ",3,"(line, 1.0 - abs(v), 8.0);\r\n  }\r\n  // Move\r\n  else if (e == 3u) {\r\n    m = ",29,"(0.0, 1.0, abs(v) < 1.0);\r\n  }\r\n  // Avg visibility\r\n  else {\r\n    m = ",29,"(0.0, 1.0, abs(v) < 0.5);\r\n  }\r\n\r\n  var c = ",20,";\r\n  if (HAS_ALPHA_TO_COVERAGE) {\r\n    c = ",16,"(c.xyz, c.a * m);\r\n  }\r\n  else {\r\n    c = c * m;\r\n  }\r\n\r\n  ",26," c;\r\n}"]).join(''),
  "hash": 3902652935311111,
  "table": t,
  "shake": [[0,[0,4]],[55,[1,4]],[131,[2,4]],[184,[3,4]],[287,[4]]],
  "tree": decompressAST([[4,0,52,0],[1,0,9],[1,10,15],[2,9,18],[4,36,109,1],[1,0,9],[1,10,15],[2,9,21],[4,57,109,2],[1,0,9],[1,10,15],[2,9,17],[0,34,133],[2,7,11],[0,96,915],[1,0,7],[2,11,23],[2,87,96],[2,24,36],[2,27,35],[2,142,154],[2,194,198]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getSlideMask = getSymbol("getSlideMask");
