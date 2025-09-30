/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("toF16u fromF16u toF16u4 fromF16u4 u32 export value f32 vec2<u32> export toF16u select return fromF16u".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([0,1,2,3]),[E]:[{[A]:22,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:_(4),[Z]:_([5]),[P]:[{[N]:_(6),[T]:_(7)}]}},{[A]:697,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(7),[Z]:_([5]),[P]:[{[N]:"h",[T]:_(4)}]}},{[A]:1378,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(8),[Z]:_([5]),[P]:[{[N]:_(6),[T]:C}],[I]:_([0])}},{[A]:1575,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:C,[Z]:_([5]),[P]:[{[N]:_(6),[T]:_(8)}],[I]:_([1])}}]};
const data = {
  name: "codec/f16.wgsl",
  code: _(["// F32 -> F16 as U16\r\n@",5," fn ",0,"(",6,": f32) -> u32 {\r\n  let s = ",11,"(0u, 0x80000000u, ",6," < 0.0);\r\n  let f = frexp(",6,");\r\n  var e = i32(f.exp);\r\n\r\n  if (e < -14) {\r\n    let m = u32(round(abs(f.fract) * 0x400)) >> u32(-14 - e);\r\n    ",12," ",11,"(\r\n      s | m, // Sub-normal\r\n      s | (1 << 10u), // Smallest normal\r\n      m == 0x400\r\n    );\r\n  }\r\n  else if (e <= 15) {\r\n    let m = u32(round(abs(f.fract) * 0x800));\r\n    ",12," ",11,"(\r\n      // Fits\r\n      s | (u32(e + 14) << 10u) | (m & 0x3FFu),\r\n      // Rounded up to next exponent\r\n      s | (u32(e + 15) << 10u) | ((m & 0x7FFu) >> 1u),\r\n      m == 0x800\r\n    );\r\n  }\r\n  else {\r\n    ",12," s | 0x7C00; // +/- inf\r\n  }\r\n};\r\n\r\n@",5," fn ",1,"(h: u32) -> f32 {\r\n  let sem = vec3<u32>(0x8000, 0x7C00, 0x3FF) & vec3<u32>(h);\r\n  let s = sem.x << 16u;\r\n  let e = sem.y;\r\n  let m = sem.z;\r\n  let l = firstLeadingBit(m);\r\n  let f = (\r\n    ",11,"(\r\n      // Zero\r\n      0u,\r\n      ",11,"(\r\n        ",11,"(\r\n          // Subnormal\r\n          s | ((103u + l) << 23u) | ((m << (23u - l)) & 0x7FFFFFu),\r\n          // Normal\r\n          s | ((e + 0x1C000u) << 13u) | (m << 13u),\r\n          e != 0,\r\n        ),\r\n        // NaN or +-Inf\r\n        ",11,"(s | 0x7F800000u, 0x7FC00000u, m != 0u),\r\n        e == 0x7C00u\r\n      ),\r\n      (e | m) != 0u\r\n    )\r\n  );\r\n  ",12," bitcast<f32>(f);\r\n};\r\n\r\n// vec4<f16> as ",8,"\r\n@",5," fn ",0,"4(",6,": ",C,") -> ",8," {\r\n  ",12," (\r\n    ",8,"(",0,"(",6,".x), ",0,"(",6,".z)) |\r\n    (",8,"(",0,"(",6,".y), ",0,"(",6,".w)) << ",8,"(16u))\r\n  );\r\n};\r\n\r\n@",5," fn ",1,"4(",6,": ",8,") -> ",C," {\r\n  let xz = ",6,".xy & ",8,"(0xFFFFu);\r\n  let yw = ",6,".xy >> ",8,"(16u);\r\n\r\n  ",12," ",C,"(\r\n    ",1,"(xz.x),\r\n    ",1,"(yw.x),\r\n    ",1,"(xz.y),\r\n    ",1,"(yw.y),\r\n  );\r\n};\n"]).join(''),
  hash: 0x182f6909624d03,
  table,
  shake: [[22,[0,2]],[697,[1,3]],[1378,[2]],[1575,[3]]],
  tree: decompressAST([[0,22,692],[1,0,7],[2,11,17],[0,664,1313],[1,0,7],[2,11,19],[0,670,862],[1,0,7],[2,11,18],[2,68,74],[2,17,23],[2,35,41],[2,17,23],[0,49,301],[1,0,7],[2,11,20],[2,154,162],[2,21,29],[2,21,29],[2,21,29]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const toF16u = getSymbol("toF16u");
export const fromF16u = getSymbol("fromF16u");
export const toF16u4 = getSymbol("toF16u4");
export const fromF16u4 = getSymbol("fromF16u4");
