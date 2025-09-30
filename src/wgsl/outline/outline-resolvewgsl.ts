/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/codec/normal16wgsl";
import m1 from "../../wgsl/use/viewwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("loadEdge getSize getInner getOuter getColor LIMIT getOutlineResolve ../../wgsl/codec/normal16 decodeNormal16 ../../wgsl/use/view worldToView clipToView viewToClip viewToWorld clipXYToUV clipUVToXY to3D getViewPixelRatio vec2<f32> link vec2<u32> f32 export targetUV loadEdge sampleXY".split(' '));
const table = {[S]:_([0,1,2,3,4,5,6]),[W]:_([6]),[O]:[{[A]:0,[N]:_(7),[S]:_([8]),[K]:[{[N]:_(8),[J]:_(8)}]},{[A]:0,[N]:_(9),[S]:_([10,11,12,13,14,15,16,17]),[K]:[{[N]:_(10),[J]:_(10)},{[N]:_(11),[J]:_(11)},{[N]:_(12),[J]:_(12)},{[N]:_(13),[J]:_(13)},{[N]:_(14),[J]:_(14)},{[N]:_(15),[J]:_(15)},{[N]:_(16),[J]:_(16)},{[N]:_(17),[J]:_(17)}]}],[X]:[{[A]:187,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(18),[Z]:_([19]),[P]:[{[N]:"xy",[T]:_(20)}]}},{[A]:237,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:_(18),[Z]:_([19])}},{[A]:273,[R]:_(2),[G]:2,[F]:{[N]:_(2),[T]:_(21),[Z]:_([19])}},{[A]:302,[R]:_(3),[G]:2,[F]:{[N]:_(3),[T]:_(21),[Z]:_([19])}},{[A]:331,[R]:_(4),[G]:2,[F]:{[N]:_(4),[T]:C,[Z]:_([19])}}],[E]:[{[A]:388,[R]:_(6),[G]:1,[F]:{[N]:_(6),[T]:C,[Z]:_([22]),[P]:[{[N]:_(23),[T]:_(18)}],[I]:_([1,2,3,4,5,0])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true,[_(4)]:true}};
const data = {
  name: "outline/outline-resolve.wgsl",
  code: _(["use '",7,"'::{ ",8," };\r\nuse '",9,"'::{ ",10,", ",11,", ",12,", ",13,", ",14,", ",15,", ",16,", ",17," };\r\n\r\n@",19," fn ",0,"(xy: ",20,") -> ",18,";\r\n\r\n@",19," fn ",1,"() -> ",18,";\r\n\r\n@",19," fn ",2,"() -> f32;\r\n@",19," fn ",3,"() -> f32;\r\n@",19," fn ",4,"() -> ",C,";\r\n\r\nconst ",5," = 5;\r\n\r\n@",22," fn ",6,"(",23,": ",18,") -> ",C," {\r\n\r\n  // Convert to full size UV (overscan is already trimmed off)\r\n  let ",25," = vec2<i32>(",23," * ",1,"());\r\n\r\n  let inner = ",2,"();\r\n  let outer = ",3,"();\r\n  let color = ",4,"();\r\n\r\n  let di = 1 / f32(inner);\r\n  let db = 1 / f32(outer);\r\n\r\n  let n = min(",5,", i32(max(inner, outer)));\r\n\r\n  let ec = ",0,"(",20,"(",25,"));\r\n  let edge = ",D,"(ec.xy, 0.0);\r\n  //return ",C,"(edge, 1.0);\r\n\r\n  var accum = max(ec.r, ec.g);\r\n  \r\n  for (var i = 1; i < n; i++) {\r\n    let el = ",0,"(",20,"(",25," + vec2<i32>(-i, 0)));\r\n    let er = ",0,"(",20,"(",25," + vec2<i32>( i, 0)));\r\n    let et = ",0,"(",20,"(",25," + vec2<i32>(0, -i)));\r\n    let eb = ",0,"(",20,"(",25," + vec2<i32>(0,  i)));\r\n\r\n    let e = max(max(el, er), max(et, eb));\r\n\r\n    let f = f32(i);\r\n    let ir = clamp(inner - f, 0.0, 1.0) * e.r;\r\n    let or = clamp(outer - f, 0.0, 1.0) * e.g;\r\n    accum += max(ir, or);\r\n  }\r\n\r\n  let a = clamp(accum, 0.0, 1.0) * color.a;\r\n  return ",C,"(color.rgb * a, a);\r\n};\n"]).join(''),
  hash: 0x562e28f08d2c2,
  table,
  shake: [[187,[0,6]],[237,[1,6]],[273,[2,6]],[302,[3,6]],[331,[4,6]],[364,[5,6]],[388,[6]]],
  tree: decompressAST([[1,0,51],[1,54,182],[1,133,178],[1,50,81],[1,36,62],[1,29,55],[1,29,61],[0,33,53],[2,10,15],[0,14,1114],[1,0,7],[2,11,28],[2,159,166],[2,29,37],[2,27,35],[2,27,35],[2,87,92],[2,46,54],[2,187,195],[2,64,72],[2,64,72],[2,64,72]], table[S]),
};

const libs = {"../../wgsl/codec/normal16": m0, "../../wgsl/use/view": m1};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getOutlineResolve = getSymbol("getOutlineResolve");
