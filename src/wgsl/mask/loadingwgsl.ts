/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/mask/sdfwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getAngle getLoadingSpinnerMask ../../wgsl/mask/sdf getUVScale scaleSDF f32 optional link export vec2<f32>".split(' '));
const table = {[S]:_(["PI",0,1]),[W]:_([1]),[O]:[{[A]:0,[N]:_(2),[S]:_([3,4]),[K]:[{[N]:_(3),[J]:_(3)},{[N]:_(4),[J]:_(4)}]}],[X]:[{[A]:84,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:_(5),[Z]:_([6,7])}}],[E]:[{[A]:140,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(5),[Z]:_([8]),[P]:[{[N]:"uv",[T]:_(9)}],[I]:_(["PI",0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "mask/loading.wgsl",
  code: _(["use '",2,"'::{ ",3,", ",4," };\r\n\r\nconst PI = 3.1415926536;\r\n\r\n@",6," @",7," fn ",0,"() -> f32 { return 0.0; }\r\n\r\n@",8," fn ",1,"(uv: ",9,") -> f32 {\r\n  let scale = ",3,"(uv);\r\n\r\n  let xy = uv * 2.0 - 1.0;\r\n  let r = length(xy);\r\n  let th = -atan2(xy.y, xy.x);\r\n\r\n  let sdf = min(1.0 - r, r - 0.8);\r\n  let a = ",4,"(sdf, scale);\r\n  let f = fract((th / PI / 2.0) - ",0,"());\r\n  let alpha = max(0.0, f * 1.5 - .5);\r\n\r\n  return a * alpha;\r\n};\n"]).join(''),
  hash: 0x1831a92927ea26,
  table,
  shake: [[52,[0,2]],[84,[1,2]],[140,[2]]],
  tree: decompressAST([[1,0,51],[0,52,80],[2,10,12],[4,22,74,1],[1,0,9],[1,10,15],[2,9,17],[0,37,393],[1,0,7],[2,11,32],[2,61,71],[2,150,158],[2,45,47],[2,12,20]], table[S]),
};

const libs = {"../../wgsl/mask/sdf": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getLoadingSpinnerMask = getSymbol("getLoadingSpinnerMask");
