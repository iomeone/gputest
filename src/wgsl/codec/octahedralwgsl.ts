/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("signNotZero encodeOctahedral decodeOctahedral wrapOctahedral symbols visibles symbol flags name vec2<f32> type export attr vec3<f32> parameters identifiers func exports signNotZero return select vector result octahedral export".split(' '));
const t = {[_(4)]:_([0,1,2,3]),[_(5)]:_([1,2,3]),[_(17)]:[{"at":235,[_(6)]:_(1),[_(7)]:1,[_(16)]:{[_(8)]:_(1),[_(10)]:_(9),[_(12)]:_([11]),[_(14)]:[{[_(8)]:"v",[_(10)]:_(13)}],[_(15)]:_([0])}},{"at":614,[_(6)]:_(2),[_(7)]:1,[_(16)]:{[_(8)]:_(2),[_(10)]:_(13),[_(12)]:_([11]),[_(14)]:[{[_(8)]:"o",[_(10)]:_(9)}],[_(15)]:_([0])}},{"at":899,[_(6)]:_(3),[_(7)]:1,[_(16)]:{[_(8)]:_(3),[_(10)]:_(9),[_(12)]:_([11]),[_(14)]:[{[_(8)]:"o",[_(10)]:_(9)}]}}]};
const data = {
  "name": "codec/octahedral",
  "code": _(["fn ",0,"(xy: ",9,") -> ",9," {\r\n  let s = sign(xy);\r\n  ",19," ",20,"(s, ",9,"(1.0, 1.0), s == ",9,"(0.0));\r\n}\r\n\r\n/** Assumes that v is a unit ",21,". The ",22," is an ",23," ",21," on the [-1, +1] square. */\r\n@",11," fn ",1,"(v: ",13,") -> ",9," {\r\n  let l1norm = abs(v.x) + abs(v.y) + abs(v.z);\r\n  var ",22," = v.xy * (1.0 / l1norm);\r\n  if (v.z < 0.0) {\r\n    ",22," = (1.0 - abs(",22,".yx)) * ",0,"(",22,".xy);\r\n  }\r\n  ",19," ",22,";\r\n}\r\n\r\n/** Returns a unit ",21,". Argument o is an ",23," ",21," packed via ",1,",\r\n    on the [-1, +1] square */\r\n@",11," fn ",2,"(o: ",9,") -> ",13," {\r\n  var v = ",13,"(o.x, o.y, 1.0 - abs(o.x) - abs(o.y));\r\n  if (v.z < 0.0) {\r\n    v = ",13,"((1.0 - abs(v.yx)) * ",0,"(v.xy), v.z);\r\n  }\r\n  ",19," normalize(v);\r\n}\r\n\r\n/** Wrap ",23," 2D coordinate to (-1...1) */\r\n@",11," fn ",3,"(o: ",9,") -> ",9," {\r\n  var wrap = o;\r\n  wrap = ",20,"(wrap, ",9,"(-2.0 - wrap.x, -wrap.y), wrap.x < -1.0);\r\n  wrap = ",20,"(wrap, ",9,"( 2.0 - wrap.x, -wrap.y), wrap.x >  1.0);\r\n  wrap = ",20,"(wrap, ",9,"(-wrap.x, -2.0 - wrap.y), wrap.y < -1.0);\r\n  wrap = ",20,"(wrap, ",9,"(-wrap.x,  2.0 - wrap.y), wrap.y >  1.0);\r\n  ",19," wrap;\r\n}"]).join(''),
  "hash": 85669318184363,
  "table": t,
  "shake": [[0,[0,1,2]],[235,[1]],[614,[2]],[899,[3]]],
  "tree": decompressAST([[0,0,131],[2,3,14],[0,232,484],[1,0,7],[2,11,27],[2,192,203],[0,176,407],[1,0,7],[2,11,27],[2,164,175],[0,110,496],[1,0,7],[2,11,25]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const encodeOctahedral = getSymbol("encodeOctahedral");
export const decodeOctahedral = getSymbol("decodeOctahedral");
export const wrapOctahedral = getSymbol("wrapOctahedral");
