/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("COLORS pmremGridOverlay export vec2<f32> size1 scale f32 outline".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[E]:[{[A]:145,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:C,[Z]:_([2]),[P]:[{[N]:"xy",[T]:_(3)},{[N]:_(4),[T]:_(3)},{[N]:_(5),[T]:_(6)}],[I]:_([0])}}]};
const data = {
  name: "pmrem/pmrem-debug.wgsl",
  code: _(["const ",0," = array(\r\n  ",D,"(0.8, 0.2, 0.2),\r\n  ",D,"(0.8, 0.6, 0.0),\r\n  ",D,"(0.0, 0.7, 0.1),\r\n  ",D,"(0.2, 0.4, 1.0),\r\n);\r\n\r\n@",2," fn ",1,"(xy: ",3,", ",4,": ",3,", ",5,": f32) -> ",C," {\r\n  let fxy = floor(xy - .5) + .5;\r\n  let fxys = fxy * 2.0 - ",4,";\r\n  let axy = abs(fxys);\r\n  let diag = abs(",4,".x - axy.x - axy.y);\r\n  let uvd = xy - fxy;\r\n  let ",7," = min(uvd, 1.0 - uvd);\r\n  let d = min(",7,".x, ",7,".y);\r\n  let sdf = -(d / ",5,") / ",4,".x;\r\n  let alpha = clamp(sdf + .5, 0.0, 1.0);\r\n\r\n  let s = select(vec2<u32>(0u), vec2<u32>(1u), fxys > ",3,"(0.0));\r\n  let rgb = ",0,"[s.x + (s.y << 1u)];\r\n\r\n  return ",C,"(rgb * alpha, alpha);\r\n};\n"]).join(''),
  hash: 0xe03cc93fe424,
  table,
  shake: [[0,[0,1]],[145,[1]]],
  tree: decompressAST([[0,0,141],[2,6,12],[0,139,699],[1,0,7],[2,11,27],[2,477,483]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const pmremGridOverlay = getSymbol("pmremGridOverlay");
