/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getEffect getDirection getValue getLayout getSlideMotion u32 optional link f32 export position optional return getDirection".split(' '));
const table = {[S]:_([0,1,2,3,4]),[W]:_([4]),[X]:[{[A]:0,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:_(5),[Z]:_([6,7])}},{[A]:54,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:C,[Z]:_([6,7])}},{[A]:130,[R]:_(2),[G]:6,[F]:{[N]:_(2),[T]:_(8),[Z]:_([6,7])}},{[A]:183,[R]:_(3),[G]:6,[F]:{[N]:_(3),[T]:C,[Z]:_([6,7])}}],[E]:[{[A]:258,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:C,[Z]:_([9]),[P]:[{[N]:_(10),[T]:C}],[I]:_([0,1,2,3])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true}};
const data = {
  name: "present/motion.wgsl",
  code: _(["@",6," @",7," fn ",0,"() -> u32 { ",12," 0; };\r\n@",6," @",7," fn ",1,"() -> ",C," { ",12," ",C,"(0.0); };\r\n@",6," @",7," fn ",2,"() -> f32 { ",12," 0; };\r\n@",6," @",7," fn ",3,"() -> ",C," { ",12," ",C,"(0.0); };\r\n\r\n@",9," fn ",4,"(",10,": ",C,") -> ",C," {\r\n  let e = ",0,"();\r\n  let d = ",1,"();\r\n  let v = ",2,"();\r\n  let l = ",3,"();\r\n\r\n  var p = ",10,";\r\n  // Move\r\n  if (e == 3) {\r\n    let direction = ",1,"();\r\n    let delta = ",C,"(l.zw - l.xy, 1.0, 0.0) * direction;\r\n\r\n    p += delta * p.w * v;\r\n  }\r\n\r\n  ",12," p;\r\n}\n"]).join(''),
  hash: 0x8d54d4f6b9259,
  table,
  shake: [[0,[0,4]],[54,[1,4]],[130,[2,4]],[183,[3,4]],[258,[4]]],
  tree: decompressAST([[4,0,51,0],[1,0,9],[1,10,15],[2,9,18],[4,35,108,1],[1,0,9],[1,10,15],[2,9,21],[4,57,107,2],[1,0,9],[1,10,15],[2,9,17],[4,34,104,3],[1,0,9],[1,10,15],[2,9,18],[0,56,418],[1,0,7],[2,11,25],[2,62,71],[2,24,36],[2,27,35],[2,23,32],[2,85,97]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getSlideMotion = getSymbol("getSlideMotion");
