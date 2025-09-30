/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/use/viewwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("ARROW_ASPECT sqr getArrowSize getArrowCorrection ../../wgsl/use/view getWorldScale getViewScale f32 export maxLength width size both i32 depth return targetSize maxSize finalSize".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([2,3]),[O]:[{[A]:0,[N]:_(4),[S]:_([5,6]),[K]:[{[N]:_(5),[J]:_(5)},{[N]:_(6),[J]:_(6)}]}],[E]:[{[A]:141,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(7),[Z]:_([8]),[P]:[{[N]:_(9),[T]:_(7)},{[N]:_(10),[T]:_(7)},{[N]:_(11),[T]:_(7)},{[N]:_(12),[T]:_(13)},{[N]:"w",[T]:_(7)},{[N]:_(14),[T]:_(7)}],[I]:_([0,1])}},{[A]:666,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(7),[Z]:_([8]),[P]:[{[N]:"w1",[T]:_(7)},{[N]:"w2",[T]:_(7)},{[N]:_(14),[T]:_(7)}]}}]};
const data = {
  name: "geometry/arrow.wgsl",
  code: _(["use '",4,"'::{ ",5,", ",6," };\r\n\r\nconst ",0,": f32 = 2.5;\r\n\r\nfn sqr(f: f32) -> f32 { ",15," f * f; };\r\n\r\n@",8," fn ",2,"(",9,": f32, ",10,": f32, ",11,": f32, ",12,": i32, w: f32, ",14,": f32) -> f32 {\r\n  if (w <= 0.0) { ",15," 0.0; }\r\n\r\n  let worldScale = ",5,"(w, ",14,") * ",6,"();\r\n\r\n  let ",16," = ",11," * ",10," * worldScale * 0.5;\r\n  var ",17," = ",9," / ",0,";\r\n  if (",12," > 0) { ",17," = ",17," * 0.5; }\r\n\r\n  let ratio = ",17," / ",16,";\r\n  var ",18," = ",16,";\r\n  if (ratio < 2.0) { ",18," = ",16," * (1.0 - sqr(1.0 - ratio * 0.5)); }\r\n\r\n  ",15," ",18,";\r\n};\r\n\r\n@",8," fn ",3,"(w1: f32, w2: f32, ",14,": f32) -> f32 {\r\n  ",15," mix(w1 / w2, 1.0, ",14,");\r\n};\n"]).join(''),
  hash: 0x187363e1edb86e,
  table,
  shake: [[59,[0,2]],[93,[1,2]],[141,[2]],[666,[3]]],
  tree: decompressAST([[1,0,58],[0,59,93],[2,10,22],[0,24,67],[2,7,10],[0,41,561],[1,0,7],[2,11,23],[2,147,160],[2,26,38],[2,100,112],[2,184,187],[0,57,164],[1,0,7],[2,11,29]], table[S]),
};

const libs = {"../../wgsl/use/view": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getArrowSize = getSymbol("getArrowSize");
export const getArrowCorrection = getSymbol("getArrowCorrection");
