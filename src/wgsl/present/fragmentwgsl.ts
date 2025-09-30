/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/fragment/sdf-2dwgsl";
import m1 from "../../wgsl/use/colorwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getTexture getMask getScreenFragment ../../wgsl/fragment/sdf-2d SDF getUVScale getBoxSDF getBorderBoxSDF getRoundedBorderBoxSDF ../../wgsl/use/color premultiply optional link vec2<f32> color export fill return texture".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[O]:[{[A]:0,[N]:_(3),[S]:_([4,5,6,7,8]),[K]:[{[N]:_(4),[J]:_(4)},{[N]:_(5),[J]:_(5)},{[N]:_(6),[J]:_(6)},{[N]:_(7),[J]:_(7)},{[N]:_(8),[J]:_(8)}]},{[A]:0,[N]:_(9),[S]:_([10]),[K]:[{[N]:_(10),[J]:_(10)}]}],[X]:[{[A]:156,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:C,[Z]:_([11,12]),[P]:[{[N]:"uv",[T]:_(13)}]}},{[A]:258,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:C,[Z]:_([11,12]),[P]:[{[N]:_(14),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C}]}}],[E]:[{[A]:367,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:C,[Z]:_([15]),[P]:[{[N]:_(16),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C}],[I]:_([0,1])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "present/fragment.wgsl",
  code: _(["use '",3,"'::{ SDF, ",5,", ",6,", ",7,", ",8," };\r\nuse '",9,"'::{ ",10," };\r\n\r\n@",11," @",12," fn ",0,"(uv: ",13,") -> ",C," { ",17," ",C,"(0.0, 0.0, 0.0, 0.0); };\r\n@",11," @",12," fn ",1,"(",14,": ",C,", uv: ",C,", st: ",C,") -> ",C," { ",17," ",14,"; }\r\n\r\n@",15," fn ",2,"(\r\n  ",16,": ",C,",\r\n  uv: ",C,",\r\n  st: ",C,",\r\n) -> ",C," {\r\n  var ",18," = ",0,"(uv.xy);\r\n\r\n  var ",14," = ",C,"(\r\n    ",10,"(",16,").rgb * (1.0 - ",18,".a) + ",18,".rgb,\r\n    mix(",16,".a, 1.0, ",18,".a),\r\n  );\r\n\r\n  if (HAS_MASK) {\r\n    ",14," = ",1,"(",14,", uv, st);\r\n  }\r\n\r\n  ",17," ",14,";\r\n}\n"]).join(''),
  hash: 0x1c1e501328c467,
  table,
  shake: [[156,[0,2]],[258,[1,2]],[367,[2]]],
  tree: decompressAST([[1,0,105],[1,108,151],[4,48,147,0],[1,0,9],[1,10,15],[2,9,19],[4,83,188,1],[1,0,9],[1,10,15],[2,9,16],[0,90,444],[1,0,7],[2,11,28],[2,110,120],[2,52,63],[2,131,138]], table[S]),
};

const libs = {"../../wgsl/fragment/sdf-2d": m0, "../../wgsl/use/color": m1};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getScreenFragment = getSymbol("getScreenFragment");
