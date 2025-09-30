/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/use/viewwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("ARROW_ASPECT sqr getArrowSize ../../wgsl/use/view getWorldScale f32 export maxLength width size both i32 depth return targetSize maxSize finalSize".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[O]:[{[A]:0,[N]:_(3),[S]:_([4]),[K]:[{[N]:_(4),[J]:_(4)}]}],[E]:[{[A]:127,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(5),[Z]:_([6]),[P]:[{[N]:_(7),[T]:_(5)},{[N]:_(8),[T]:_(5)},{[N]:_(9),[T]:_(5)},{[N]:_(10),[T]:_(11)},{[N]:"w",[T]:_(5)},{[N]:_(12),[T]:_(5)}],[I]:_([0,1])}}]};
const data = {
  name: "geometry/arrow.wgsl",
  code: _(["use '",3,"'::{ ",4," };\r\n\r\nconst ",0,": f32 = 2.5;\r\n\r\nfn sqr(f: f32) -> f32 { ",13," f * f; };\r\n\r\n@",6," fn ",2,"(",7,": f32, ",8,": f32, ",9,": f32, ",10,": i32, w: f32, ",12,": f32) -> f32 {\r\n  if (w <= 0.0) { ",13," 0.0; }\r\n\r\n  let worldScale = ",4,"(w, ",12,");\r\n\r\n  let ",14," = ",9," * ",8," * worldScale * 0.5;\r\n  var ",15," = ",7," / ",0,";\r\n  if (",10," > 0) { ",15," = ",15," * 0.5; }\r\n\r\n  let ratio = ",15," / ",14,";\r\n  var ",16," = ",14,";\r\n  if (ratio < 2.0) { ",16," = ",14," * (1.0 - sqr(1.0 - ratio * 0.5)); }\r\n\r\n  ",13," ",16,";\r\n};\n"]).join(''),
  hash: 0x18b2a28ba1f1f7,
  table,
  shake: [[45,[0,2]],[79,[1,2]],[127,[2]]],
  tree: decompressAST([[1,0,44],[0,45,79],[2,10,22],[0,24,67],[2,7,10],[0,41,544],[1,0,7],[2,11,23],[2,147,160],[2,109,121],[2,184,187]], table[S]),
};

const libs = {"../../wgsl/use/view": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getArrowSize = getSymbol("getArrowSize");
