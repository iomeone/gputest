/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("signNotZero encodeOctahedral decodeOctahedral wrapOctahedral vec2<f32> export signNotZero return select vector result octahedral export".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([1,2,3]),[E]:[{[A]:235,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(4),[Z]:_([5]),[P]:[{[N]:"v",[T]:D}],[I]:_([0])}},{[A]:614,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:D,[Z]:_([5]),[P]:[{[N]:"o",[T]:_(4)}],[I]:_([0])}},{[A]:899,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(4),[Z]:_([5]),[P]:[{[N]:"o",[T]:_(4)}]}}]};
const data = {
  name: "codec/octahedral.wgsl",
  code: _(["fn ",0,"(xy: ",4,") -> ",4," {\r\n  let s = sign(xy);\r\n  ",7," ",8,"(s, ",4,"(1.0, 1.0), s == ",4,"(0.0));\r\n}\r\n\r\n/** Assumes that v is a unit ",9,". The ",10," is an ",11," ",9," on the [-1, +1] square. */\r\n@",5," fn ",1,"(v: ",D,") -> ",4," {\r\n  let l1norm = abs(v.x) + abs(v.y) + abs(v.z);\r\n  var ",10," = v.xy * (1.0 / l1norm);\r\n  if (v.z < 0.0) {\r\n    ",10," = (1.0 - abs(",10,".yx)) * ",0,"(",10,".xy);\r\n  }\r\n  ",7," ",10,";\r\n}\r\n\r\n/** Returns a unit ",9,". Argument o is an ",11," ",9," packed via ",1,",\r\n    on the [-1, +1] square */\r\n@",5," fn ",2,"(o: ",4,") -> ",D," {\r\n  var v = ",D,"(o.x, o.y, 1.0 - abs(o.x) - abs(o.y));\r\n  if (v.z < 0.0) {\r\n    v = ",D,"((1.0 - abs(v.yx)) * ",0,"(v.xy), v.z);\r\n  }\r\n  ",7," normalize(v);\r\n}\r\n\r\n/** Wrap ",11," 2D coordinate to (-1...1) */\r\n@",5," fn ",3,"(o: ",4,") -> ",4," {\r\n  var wrap = o;\r\n  wrap = ",8,"(wrap, ",4,"(-2.0 - wrap.x, -wrap.y), wrap.x < -1.0);\r\n  wrap = ",8,"(wrap, ",4,"( 2.0 - wrap.x, -wrap.y), wrap.x >  1.0);\r\n  wrap = ",8,"(wrap, ",4,"(-wrap.x, -2.0 - wrap.y), wrap.y < -1.0);\r\n  wrap = ",8,"(wrap, ",4,"(-wrap.x,  2.0 - wrap.y), wrap.y >  1.0);\r\n  ",7," wrap;\r\n}\n"]).join(''),
  hash: 0x11f5bfad92c9ba,
  table,
  shake: [[0,[0,1,2]],[235,[1]],[614,[2]],[899,[3]]],
  tree: decompressAST([[0,0,131],[2,3,14],[0,232,484],[1,0,7],[2,11,27],[2,192,203],[0,176,407],[1,0,7],[2,11,27],[2,164,175],[0,110,496],[1,0,7],[2,11,25]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const encodeOctahedral = getSymbol("encodeOctahedral");
export const decodeOctahedral = getSymbol("decodeOctahedral");
export const wrapOctahedral = getSymbol("wrapOctahedral");
