/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("COLORS pmremGridOverlay symbols visibles symbol flags name vec4<f32> type export attr vec2<f32> size1 scale f32 parameters identifiers func exports outline".split(' '));
const t = {[_(2)]:_([0,1]),[_(3)]:_([1]),[_(18)]:[{"at":145,[_(4)]:_(1),[_(5)]:1,[_(17)]:{[_(6)]:_(1),[_(8)]:_(7),[_(10)]:_([9]),[_(15)]:[{[_(6)]:"xy",[_(8)]:_(11)},{[_(6)]:_(12),[_(8)]:_(11)},{[_(6)]:_(13),[_(8)]:_(14)}],[_(16)]:_([0])}}]};
const data = {
  "name": "pmrem/pmrem-debug",
  "code": _(["const ",0," = array(\r\n  vec3<f32>(0.8, 0.2, 0.2),\r\n  vec3<f32>(0.8, 0.6, 0.0),\r\n  vec3<f32>(0.0, 0.7, 0.1),\r\n  vec3<f32>(0.2, 0.4, 1.0),\r\n);\r\n\r\n@",9," fn ",1,"(xy: ",11,", ",12,": ",11,", ",13,": f32) -> ",7," {\r\n  let fxy = floor(xy - .5) + .5;\r\n  let fxys = fxy * 2.0 - ",12,";\r\n  let axy = abs(fxys);\r\n  let diag = abs(",12,".x - axy.x - axy.y);\r\n  let uvd = xy - fxy;\r\n  let ",19," = min(uvd, 1.0 - uvd);\r\n  let d = min(",19,".x, ",19,".y);\r\n  let sdf = -(d / ",13,") / ",12,".x;\r\n  let alpha = clamp(sdf + .5, 0.0, 1.0);\r\n\r\n  let s = select(vec2<u32>(0u), vec2<u32>(1u), fxys > ",11,"(0.0));\r\n  let rgb = ",0,"[s.x + (s.y << 1u)];\r\n\r\n  return ",7,"(rgb * alpha, alpha);\r\n};"]).join(''),
  "hash": 3592150672842298,
  "table": t,
  "shake": [[0,[0,1]],[145,[1]]],
  "tree": decompressAST([[0,0,141],[2,6,12],[0,139,699],[1,0,7],[2,11,27],[2,477,483]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const pmremGridOverlay = getSymbol("pmremGridOverlay");
