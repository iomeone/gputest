/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getEffect getDirection getValue ramp getSlideMask u32 optional link f32 export color optional return getDirection direction select".split(' '));
const table = {[S]:_([0,1,2,3,4]),[W]:_([4]),[X]:[{[A]:0,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:_(5),[Z]:_([6,7])}},{[A]:55,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:C,[Z]:_([6,7])}},{[A]:131,[R]:_(2),[G]:6,[F]:{[N]:_(2),[T]:_(8),[Z]:_([6,7])}}],[E]:[{[A]:287,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:C,[Z]:_([9]),[P]:[{[N]:_(10),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C}],[I]:_([0,1,2,3])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  name: "present/mask.wgsl",
  code: _(["@",6," @",7," fn ",0,"() -> u32 { ",12," 0u; };\r\n@",6," @",7," fn ",1,"() -> ",C," { ",12," ",C,"(0.0); };\r\n@",6," @",7," fn ",2,"() -> f32 { ",12," 0.0; };\r\n\r\nfn ",3,"(x: f32, t: f32, s: f32) -> f32 {\r\n  ",12," clamp(x * s + mix(-s, 1.0, t), 0.0, 1.0);\r\n}\r\n\r\n@",9," fn ",4,"(",10,": ",C,", uv: ",C,", st: ",C,") -> ",C," {\r\n  let e = ",0,"();\r\n  let d = ",1,"();\r\n  let v = ",2,"();\r\n\r\n  var m = 1.0;\r\n  // Fade\r\n  if (e == 1u) {\r\n    m = 1.0 - abs(v);\r\n  }\r\n  // Wipe\r\n  else if (e == 2u) {\r\n    let ",14," = ",1,"();\r\n    let l = length(",14,");\r\n\r\n    let coord = ",15,"(st, 1.0 - st, (",14," * v) <= ",C,"(0.0));\r\n    let line = dot(coord, abs(",14,")) / (l + 1.0e-5);\r\n\r\n    m = ",3,"(line, 1.0 - abs(v), 8.0);\r\n  }\r\n  // Move\r\n  else if (e == 3u) {\r\n    m = ",15,"(0.0, 1.0, abs(v) < 1.0);\r\n  }\r\n  // Avg visibility\r\n  else {\r\n    m = ",15,"(0.0, 1.0, abs(v) < 0.5);\r\n  }\r\n\r\n  var c = ",10,";\r\n  if (HAS_ALPHA_TO_COVERAGE) {\r\n    c = ",C,"(c.xyz, c.a * m);\r\n  }\r\n  else {\r\n    c = c * m;\r\n  }\r\n\r\n  ",12," c;\r\n}\n"]).join(''),
  hash: 0xe3f9aa4276463,
  table,
  shake: [[0,[0,4]],[55,[1,4]],[131,[2,4]],[184,[3,4]],[287,[4]]],
  tree: decompressAST([[4,0,52,0],[1,0,9],[1,10,15],[2,9,18],[4,36,109,1],[1,0,9],[1,10,15],[2,9,21],[4,57,109,2],[1,0,9],[1,10,15],[2,9,17],[0,34,133],[2,7,11],[0,96,915],[1,0,7],[2,11,23],[2,87,96],[2,24,36],[2,27,35],[2,142,154],[2,194,198]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getSlideMask = getSymbol("getSlideMask");
