/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("signNotZero encodeOctahedral decodeOctahedral wrapOctahedral encodeHemiOctahedral decodeHemiOctahedral vec2<f32> export signNotZero return select vector result octahedral square export l1norm".split(' '));
const table = {[S]:_([0,1,2,3,4,5]),[W]:_([1,2,3,4,5]),[E]:[{[A]:235,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(6),[Z]:_([7]),[P]:[{[N]:"v",[T]:D}],[I]:_([0])}},{[A]:606,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:D,[Z]:_([7]),[P]:[{[N]:"o",[T]:_(6)}],[I]:_([0])}},{[A]:919,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(6),[Z]:_([7]),[P]:[{[N]:"o",[T]:_(6)}]}},{[A]:1301,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:_(6),[Z]:_([7]),[P]:[{[N]:"v",[T]:D}]}},{[A]:1678,[R]:_(5),[G]:1,[F]:{[N]:_(5),[T]:D,[Z]:_([7]),[P]:[{[N]:"o",[T]:_(6)}]}}]};
const data = {
  name: "codec/octahedral.wgsl",
  code: _(["fn ",0,"(xy: ",6,") -> ",6," {\r\n  let s = sign(xy);\r\n  ",9," ",10,"(s, ",6,"(1.0, 1.0), s == ",6,"(0.0));\r\n}\r\n\r\n/** Assumes that v is a unit ",11,". The ",12," is an ",13," ",11," on the [-1, +1] ",14,". */\r\n@",7," fn ",1,"(v: ",D,") -> ",6," {\r\n  let ",16," = abs(v.x) + abs(v.y) + abs(v.z);\r\n  var ",12," = v.xy / ",16,";\r\n  if (v.z < 0.0) {\r\n    ",12," = (1.0 - abs(",12,".yx)) * ",0,"(",12,".xy);\r\n  }\r\n  ",9," ",12,";\r\n}\r\n\r\n/** Returns a unit ",11,". Argument o is an ",13," ",11," packed via ",1,",\r\n    on the [-1, +1] ",14," */\r\n@",7," fn ",2,"(o: ",6,") -> ",D," {\r\n  var v = ",D,"(o.x, o.y, 1.0 - abs(o.x) - abs(o.y));\r\n  if (v.z < 0.0) {\r\n    v = ",D,"((1.0 - abs(v.yx)) * ",0,"(v.xy), v.z);\r\n  }\r\n  ",9," normalize(v);\r\n}\r\n\r\n/** Wrap ",13," 2D coordinate (-3...3) to (-1...1) (i.e. 1 fold only) */\r\n@",7," fn ",3,"(o: ",6,") -> ",6," {\r\n  var wrap = o;\r\n  wrap = ",10,"(wrap, ",6,"(2.0 * sign(wrap.x) - wrap.x, -wrap.y), abs(wrap.x) > 1.0);\r\n  wrap = ",10,"(wrap, ",6,"(-wrap.x, 2.0 * sign(wrap.y) - wrap.y), abs(wrap.y) > 1.0);\r\n  ",9," wrap;\r\n}\r\n\r\n/** Assumes that v is a unit ",11,". The ",12," is a hemi-",13," ",11," on the [-1, +1] ",14,". */\r\n@",7," fn ",4,"(v: ",D,") -> ",6," {\r\n  let ",16," = abs(v.x) + abs(v.y) + abs(v.z);\r\n  let r = v.xy / ",16,";\r\n\r\n  let xx = ( r.x + r.y);\r\n  let yy = (-r.x + r.y);\r\n\r\n  ",9," ",6,"(xx, yy);\r\n}\r\n\r\n/** Returns a unit ",11," in the positive Z space. Argument o is an ",13," ",11," packed via ",4,",\r\n    on the [-1, +1] ",14," */\r\n@",7," fn ",5,"(o: ",6,") -> ",D," {\r\n  let xx = (o.x - o.y) * 0.5;\r\n  let yy = (o.x + o.y) * 0.5;\r\n\r\n  var v = ",D,"(xx, yy, 1.0 - abs(xx) - abs(yy));\r\n  ",9," normalize(v);\r\n}\n"]).join(''),
  hash: 0xa4bdae2297ea1,
  table,
  shake: [[0,[0,1,2]],[235,[1]],[606,[2]],[919,[3]],[1301,[4]],[1678,[5]]],
  tree: decompressAST([[0,0,131],[2,3,14],[0,232,476],[1,0,7],[2,11,27],[2,184,195],[0,176,407],[1,0,7],[2,11,27],[2,164,175],[0,138,412],[1,0,7],[2,11,25],[0,371,593],[1,0,7],[2,11,31],[0,366,572],[1,0,7],[2,11,31]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const encodeOctahedral = getSymbol("encodeOctahedral");
export const decodeOctahedral = getSymbol("decodeOctahedral");
export const wrapOctahedral = getSymbol("wrapOctahedral");
export const encodeHemiOctahedral = getSymbol("encodeHemiOctahedral");
export const decodeHemiOctahedral = getSymbol("decodeHemiOctahedral");
