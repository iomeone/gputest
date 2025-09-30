/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/use/typeswgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("applyMaterial applyDirectionalShadow applyPointShadow applyLight ../../wgsl/use/types Light SurfaceFragment link surface f32 optional light export SurfaceFragment surface return intensity radiance normalize normal".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([3]),[O]:[{[A]:0,[N]:_(4),[S]:_([5,6]),[K]:[{[N]:_(5),[J]:_(5)},{[N]:_(6),[J]:_(6)}]}],[X]:[{[A]:59,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:D,[Z]:_([7]),[P]:[{[N]:"N",[T]:D},{[N]:"L",[T]:D},{[N]:"V",[T]:D},{[N]:_(8),[T]:_(6)}]}},{[A]:185,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:_(9),[Z]:_([10,7]),[P]:[{[N]:_(11),[T]:_(5)},{[N]:_(8),[T]:_(6)}]}},{[A]:303,[R]:_(2),[G]:6,[F]:{[N]:_(2),[T]:_(9),[Z]:_([10,7]),[P]:[{[N]:_(11),[T]:_(5)},{[N]:_(8),[T]:_(6)}]}}],[E]:[{[A]:415,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:D,[Z]:_([12]),[P]:[{[N]:"N",[T]:D},{[N]:"V",[T]:D},{[N]:_(11),[T]:_(5)},{[N]:_(8),[T]:_(6)}],[I]:_([1,2,0])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  name: "material/light.wgsl",
  code: _(["use '",4,"'::{ ",5,", ",6," };\r\n\r\n@",7," fn ",0,"(\r\n  N: ",D,",\r\n  L: ",D,",\r\n  V: ",D,",\r\n  ",8,": ",6,",\r\n) -> ",D," {}\r\n\r\n@",10," @",7," fn ",1,"(\r\n  ",11,": ",5,",\r\n  ",8,": ",6,",\r\n) -> f32 { ",15," 1.0; }\r\n\r\n@",10," @",7," fn ",2,"(\r\n  ",11,": ",5,",\r\n  ",8,": ",6,",\r\n) -> f32 { ",15," 1.0; }\r\n\r\n@",12," fn ",3,"(\r\n  N: ",D,",\r\n  V: ",D,",\r\n  ",11,": ",5,",\r\n  ",8,": ",6,",\r\n) -> ",D," {\r\n  var L: ",D,";\r\n\r\n  var ",16,": f32 = ",11,".",16," * 3.1415;\r\n  var ",17,": ",D,";\r\n\r\n  let kind = ",11,".kind;\r\n  if (kind == 0) {\r\n    // Ambient\r\n    ",15," (",8,".occlusion * ",11,".",16,") * ",8,".albedo.rgb * ",11,".color.rgb;\r\n  }\r\n  else if (kind == 1) {\r\n    // Directional\r\n    L = ",18,"(-",11,".",19,".xyz);\r\n\r\n    if (",11,".shadowMap >= 0) {\r\n      ",16," *= ",1,"(",11,", ",8,");\r\n    }\r\n\r\n    ",17," = ",11,".color.rgb * ",16,";\r\n  }\r\n  else if (kind == 2) {\r\n    // Dome\r\n    L = ",18,"(-",11,".",19,".xyz);\r\n    let f = clamp(dot(L, N), 0.0, 1.0);\r\n    let color = mix(",11,".opts.rgb, ",11,".color.rgb, f);\r\n    let bleed = ",11,".",19,".w;\r\n    if (bleed > 0.0) { L = mix(L, N, bleed); };\r\n\r\n    ",17," = color * ",16,";\r\n  }\r\n  else if (kind == 3) {\r\n    // Point\r\n    let d = ",11,".position.xyz - ",8,".position.xyz;\r\n    L = ",18,"(d);\r\n\r\n    var r = ",16," / dot(d, d) - ",11,".cutoff;\r\n    if (r > 0.0) {\r\n      if (",11,".shadowMap >= 0) {\r\n        r *= ",2,"(",11,", ",8,");\r\n      }\r\n      ",17," = ",11,".color.rgb * r;\r\n    }\r\n    else {\r\n      ",15," ",D,"(0.0);\r\n    }\r\n  }\r\n  else {\r\n    ",15," ",D,"(0.0);\r\n  }\r\n\r\n  let direct = ",17," * ",0,"(N, L, V, ",8,");\r\n  ",15," direct;\r\n}\n"]).join(''),
  hash: 0x13ad3a632faa90,
  table,
  shake: [[59,[0,3]],[185,[1,3]],[303,[2,3]],[415,[3]]],
  tree: decompressAST([[1,0,54],[1,59,181],[4,126,240,1],[1,0,9],[1,10,15],[2,9,31],[2,34,39],[2,19,34],[4,46,154,2],[1,0,9],[1,10,15],[2,9,25],[2,28,33],[2,19,34],[0,46,1473],[1,0,7],[2,11,21],[2,56,61],[2,19,34],[2,434,456],[2,639,655],[2,215,228]], table[S]),
};

const libs = {"../../wgsl/use/types": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const applyLight = getSymbol("applyLight");
