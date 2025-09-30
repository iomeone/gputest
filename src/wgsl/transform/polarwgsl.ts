/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getTransformMatrix getPolarBend getPolarFocus getPolarAspect getPolarHelix getPolarPosition mat4x4<f32> link f32 optional export position optional return position polarBend polarFocus polarAspect polarHelix matrix radius".split(' '));
const table = {[S]:_([0,1,2,3,4,5]),[W]:_([5]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(6),[Z]:_([7])}},{[A]:49,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:_(8),[Z]:_([9,7])}},{[A]:108,[R]:_(2),[G]:6,[F]:{[N]:_(2),[T]:_(8),[Z]:_([9,7])}},{[A]:168,[R]:_(3),[G]:6,[F]:{[N]:_(3),[T]:_(8),[Z]:_([9,7])}},{[A]:229,[R]:_(4),[G]:6,[F]:{[N]:_(4),[T]:_(8),[Z]:_([9,7])}}],[E]:[{[A]:291,[R]:_(5),[G]:1,[F]:{[N]:_(5),[T]:C,[Z]:_([10]),[P]:[{[N]:_(11),[T]:C}],[I]:_([1,2,3,4,0])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true,[_(4)]:true}};
const data = {
  name: "transform/polar.wgsl",
  code: _(["@",7," fn ",0,"() -> ",6,";\r\n\r\n@",9," @",7," fn ",1,"() -> f32 { ",13," 0.0; };\r\n@",9," @",7," fn ",2,"() -> f32 { ",13," 0.0; };\r\n@",9," @",7," fn ",3,"() -> f32 { ",13," 1.0; };\r\n@",9," @",7," fn ",4,"() -> f32 { ",13," 0.0; };\r\n\r\n@",10," fn ",5,"(",11,": ",C,") -> ",C," {\r\n  let ",15," = ",1,"();\r\n  let ",16," = ",2,"();\r\n  let ",17," = ",3,"();\r\n  let ",18," = ",4,"();\r\n\r\n  let ",19," = ",0,"();\r\n\r\n  if (",15," > 0.0) {\r\n    if (",15," < 0.001) {\r\n      // Factor out large addition/subtraction of ",16,"\r\n      // to avoid numerical error\r\n      // sin(x) ~ x\r\n      // cos(x) ~ 1 - x * x / 2\r\n      let pb = ",11,".xy * ",15,";\r\n      let ppbbx = pb.x * pb.x;\r\n      ",13," ",19," * vec4(\r\n        ",11,".x * (1.0 - ",15," + (pb.y * ",17,")),\r\n        ",11,".y * (1.0 - .5 * ppbbx) - (.5 * ppbbx) * ",16," / ",17,",\r\n        ",11,".z + ",11,".x * ",18," * ",15,",\r\n        1.0\r\n      );\r\n    }\r\n    else {\r\n      let xy = ",11,".xy * vec2<f32>(",15,", ",17,");\r\n      let ",20," = ",16," + xy.y;\r\n      ",13," ",19," * ",C,"(\r\n        sin(xy.x) * ",20,",\r\n        (cos(xy.x) * ",20," - ",16,") / ",17,",\r\n        ",11,".z + ",11,".x * ",18," * ",15,",\r\n        1.0\r\n      );\r\n    }\r\n  }\r\n  ",13," ",19," * ",C,"(",11,".xyz, 1.0);\r\n}\n"]).join(''),
  hash: 0x6aae7edb292ae,
  table,
  shake: [[0,[0,5]],[49,[1,5]],[108,[2,5]],[168,[3,5]],[229,[4,5]],[291,[5]]],
  tree: decompressAST([[1,0,44],[4,49,105,1],[1,0,9],[1,10,15],[2,9,21],[4,40,97,2],[1,0,9],[1,10,15],[2,9,22],[4,41,99,3],[1,0,9],[1,10,15],[2,9,23],[4,42,99,4],[1,0,9],[1,10,15],[2,9,22],[0,43,1225],[1,0,7],[2,11,27],[2,72,84],[2,36,49],[2,38,52],[2,38,51],[2,35,53]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getPolarPosition = getSymbol("getPolarPosition");
