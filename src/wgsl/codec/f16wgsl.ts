/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("toF16u fromF16u toF16u4 fromF16u4 symbols visibles symbol flags name u32 type export attr value f32 parameters func vec2<u32> vec4<f32> identifiers exports export toF16u select return fromF16u".split(' '));
const t = {[_(4)]:_([0,1,2,3]),[_(5)]:_([0,1,2,3]),[_(20)]:[{"at":22,[_(6)]:_(0),[_(7)]:1,[_(16)]:{[_(8)]:_(0),[_(10)]:_(9),[_(12)]:_([11]),[_(15)]:[{[_(8)]:_(13),[_(10)]:_(14)}]}},{"at":697,[_(6)]:_(1),[_(7)]:1,[_(16)]:{[_(8)]:_(1),[_(10)]:_(14),[_(12)]:_([11]),[_(15)]:[{[_(8)]:"h",[_(10)]:_(9)}]}},{"at":1378,[_(6)]:_(2),[_(7)]:1,[_(16)]:{[_(8)]:_(2),[_(10)]:_(17),[_(12)]:_([11]),[_(15)]:[{[_(8)]:_(13),[_(10)]:_(18)}],[_(19)]:_([0])}},{"at":1575,[_(6)]:_(3),[_(7)]:1,[_(16)]:{[_(8)]:_(3),[_(10)]:_(18),[_(12)]:_([11]),[_(15)]:[{[_(8)]:_(13),[_(10)]:_(17)}],[_(19)]:_([1])}}]};
const data = {
  "name": "codec/f16",
  "code": _(["// F32 -> F16 as U16\r\n@",11," fn ",0,"(",13,": f32) -> u32 {\r\n  let s = ",23,"(0u, 0x80000000u, ",13," < 0.0);\r\n  let f = frexp(",13,");\r\n  var e = i32(f.exp);\r\n\r\n  if (e < -14) {\r\n    let m = u32(round(abs(f.fract) * 0x400)) >> u32(-14 - e);\r\n    ",24," ",23,"(\r\n      s | m, // Sub-normal\r\n      s | (1 << 10u), // Smallest normal\r\n      m == 0x400\r\n    );\r\n  }\r\n  else if (e <= 15) {\r\n    let m = u32(round(abs(f.fract) * 0x800));\r\n    ",24," ",23,"(\r\n      // Fits\r\n      s | (u32(e + 14) << 10u) | (m & 0x3FFu),\r\n      // Rounded up to next exponent\r\n      s | (u32(e + 15) << 10u) | ((m & 0x7FFu) >> 1u),\r\n      m == 0x800\r\n    );\r\n  }\r\n  else {\r\n    ",24," s | 0x7C00; // +/- inf\r\n  }\r\n};\r\n\r\n@",11," fn ",1,"(h: u32) -> f32 {\r\n  let sem = vec3<u32>(0x8000, 0x7C00, 0x3FF) & vec3<u32>(h);\r\n  let s = sem.x << 16u;\r\n  let e = sem.y;\r\n  let m = sem.z;\r\n  let l = firstLeadingBit(m);\r\n  let f = (\r\n    ",23,"(\r\n      // Zero\r\n      0u,\r\n      ",23,"(\r\n        ",23,"(\r\n          // Subnormal\r\n          s | ((103u + l) << 23u) | ((m << (23u - l)) & 0x7FFFFFu),\r\n          // Normal\r\n          s | ((e + 0x1C000u) << 13u) | (m << 13u),\r\n          e != 0,\r\n        ),\r\n        // NaN or +-Inf\r\n        ",23,"(s | 0x7F800000u, 0x7FC00000u, m != 0u),\r\n        e == 0x7C00u\r\n      ),\r\n      (e | m) != 0u\r\n    )\r\n  );\r\n  ",24," bitcast<f32>(f);\r\n};\r\n\r\n// vec4<f16> as ",17,"\r\n@",11," fn ",0,"4(",13,": ",18,") -> ",17," {\r\n  ",24," (\r\n    ",17,"(",0,"(",13,".x), ",0,"(",13,".z)) |\r\n    (",17,"(",0,"(",13,".y), ",0,"(",13,".w)) << ",17,"(16u))\r\n  );\r\n};\r\n\r\n@",11," fn ",1,"4(",13,": ",17,") -> ",18," {\r\n  let xz = ",13,".xy & ",17,"(0xFFFFu);\r\n  let yw = ",13,".xy >> ",17,"(16u);\r\n\r\n  ",24," ",18,"(\r\n    ",1,"(xz.x),\r\n    ",1,"(yw.x),\r\n    ",1,"(xz.y),\r\n    ",1,"(yw.y),\r\n  );\r\n};"]).join(''),
  "hash": 3252057782694514,
  "table": t,
  "shake": [[22,[0,2]],[697,[1,3]],[1378,[2]],[1575,[3]]],
  "tree": decompressAST([[0,22,692],[1,0,7],[2,11,17],[0,664,1313],[1,0,7],[2,11,19],[0,670,862],[1,0,7],[2,11,18],[2,68,74],[2,17,23],[2,35,41],[2,17,23],[0,49,301],[1,0,7],[2,11,20],[2,154,162],[2,21,29],[2,21,29],[2,21,29]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const toF16u = getSymbol("toF16u");
export const fromF16u = getSymbol("fromF16u");
export const toF16u4 = getSymbol("toF16u4");
export const fromF16u4 = getSymbol("fromF16u4");
