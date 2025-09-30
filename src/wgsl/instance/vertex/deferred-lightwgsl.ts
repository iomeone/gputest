/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/viewwgsl";
import m1 from "../../../wgsl/use/typeswgsl";
import m2 from "../../../wgsl/geometry/quadwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getLight getInstance getPosition getIndex getScale getDeferredLightVertex ../../../wgsl/use/view worldToClip ../../../wgsl/use/types LightVertex Light ../../../wgsl/geometry/quad getQuadUV link u32 optional index f32 export vertexIndex instanceIndex LightVertex optional return vertexIndex instance position".split(' '));
const table = {[S]:_([0,1,2,3,4,5]),[W]:_([5]),[O]:[{[A]:0,[N]:_(6),[S]:_([7]),[K]:[{[N]:_(7),[J]:_(7)}]},{[A]:0,[N]:_(8),[S]:_([9,10]),[K]:[{[N]:_(9),[J]:_(9)},{[N]:_(10),[J]:_(10)}]},{[A]:0,[N]:_(11),[S]:_([12]),[K]:[{[N]:_(12),[J]:_(12)}]}],[X]:[{[A]:157,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(10),[Z]:_([13]),[P]:[{[N]:"i",[T]:_(14)}]}},{[A]:196,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:_(14),[Z]:_([15,13]),[P]:[{[N]:_(16),[T]:_(14)}]}},{[A]:266,[R]:_(2),[G]:6,[F]:{[N]:_(2),[T]:C,[Z]:_([15,13]),[P]:[{[N]:"i",[T]:_(14)}]}},{[A]:347,[R]:_(3),[G]:6,[F]:{[N]:_(3),[T]:_(14),[Z]:_([15,13]),[P]:[{[N]:_(16),[T]:_(14)}]}},{[A]:414,[R]:_(4),[G]:6,[F]:{[N]:_(4),[T]:_(17),[Z]:_([15,13])}}],[E]:[{[A]:471,[R]:_(5),[G]:1,[F]:{[N]:_(5),[T]:_(9),[Z]:_([18]),[P]:[{[N]:_(19),[T]:_(14)},{[N]:_(20),[T]:_(14)}],[I]:_([1,0,2,3,4])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true,[_(4)]:true}};
const data = {
  name: "vertex/deferred-light.wgsl",
  code: _(["use '",6,"'::{ ",7," };\r\nuse '",8,"'::{ ",9,", ",10," };\r\nuse '",11,"'::{ ",12," };\r\n\r\n@",13," fn ",0,"(i: u32) -> ",10,";\r\n\r\n@",15," @",13," fn ",1,"(",16,": u32) -> u32 { ",23," ",16,"; };\r\n@",15," @",13," fn ",2,"(i: u32) -> ",C," { ",23," ",C,"(0.0); };\r\n@",15," @",13," fn ",3,"(",16,": u32) -> u32 { ",23," ",16,"; };\r\n@",15," @",13," fn ",4,"() -> f32 { ",23," 1.0; };\r\n\r\n@",18," fn ",5,"(",19,": u32, ",20,": u32) -> ",9," {\r\n  let ",25," = ",1,"(",20,");\r\n\r\n  if (IS_FULLSCREEN) {\r\n    let uv = ",12,"(",19,");\r\n    let xy = uv * 2.0 - 1.0;\r\n    let vertex = ",C,"(xy * 2.0 + 1.0, 0.5, 1.0);\r\n\r\n    ",23," ",9,"(vertex, ",25,");\r\n  } else {\r\n    let light = ",0,"(",25,");\r\n\r\n    var world: ",C,";\r\n    if (light.kind == 3) {\r\n      let sphere = ",2,"(",3,"(",19,"));\r\n      let scale = sqrt(light.intensity * 3.1415 / light.cutoff) * ",4,"();\r\n      world = ",C,"(light.",26,".xyz + sphere.xyz * scale, 1.0);\r\n    }\r\n\r\n    let ",26," = ",7,"(world);\r\n    ",23," ",9,"(",26,", ",25,");\r\n  }\r\n}\n"]).join(''),
  hash: 0x18ad386aa52f93,
  table,
  shake: [[157,[0,5]],[196,[1,5]],[266,[2,5]],[347,[3,5]],[414,[4,5]],[471,[5]]],
  tree: decompressAST([[1,0,45],[1,48,101],[1,56,104],[1,53,87],[4,39,106,1],[1,0,9],[1,10,15],[2,9,20],[4,51,129,2],[1,0,9],[1,10,15],[2,9,20],[4,62,126,3],[1,0,9],[1,10,15],[2,9,17],[4,48,100,4],[1,0,9],[1,10,15],[2,9,17],[0,38,781],[1,0,7],[2,11,33],[2,64,75],[2,32,43],[2,68,77],[2,123,134],[2,60,68],[2,97,108],[2,12,20],[2,91,99],[2,113,124],[2,32,43]], table[S]),
};

const libs = {"../../../wgsl/use/view": m0, "../../../wgsl/use/types": m1, "../../../wgsl/geometry/quad": m2};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getDeferredLightVertex = getSymbol("getDeferredLightVertex");
