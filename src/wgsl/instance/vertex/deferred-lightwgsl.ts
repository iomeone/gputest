/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/viewwgsl";
import m1 from "../../../wgsl/use/typeswgsl";
import m2 from "../../../wgsl/geometry/quadwgsl";
const {} = symbolDictionary;
const _ = decompressString("getLight getInstance getPosition getIndex getScale getDeferredLightVertex symbols visibles ../../../wgsl/use/view name worldToClip imported imports ../../../wgsl/use/types LightVertex Light ../../../wgsl/geometry/quad getQuadUV modules symbol flags type link attr u32 parameters func optional index vec4<f32> f32 externals export vertexIndex instanceIndex identifiers exports linkable LightVertex optional return vertexIndex instance position".split(' '));
const t = {[_(6)]:_([0,1,2,3,4,5]),[_(7)]:_([5]),[_(18)]:[{"at":0,[_(9)]:_(8),[_(6)]:_([10]),[_(12)]:[{[_(9)]:_(10),[_(11)]:_(10)}]},{"at":0,[_(9)]:_(13),[_(6)]:_([14,15]),[_(12)]:[{[_(9)]:_(14),[_(11)]:_(14)},{[_(9)]:_(15),[_(11)]:_(15)}]},{"at":0,[_(9)]:_(16),[_(6)]:_([17]),[_(12)]:[{[_(9)]:_(17),[_(11)]:_(17)}]}],[_(31)]:[{"at":157,[_(19)]:_(0),[_(20)]:2,[_(26)]:{[_(9)]:_(0),[_(21)]:_(15),[_(23)]:_([22]),[_(25)]:[{[_(9)]:"i",[_(21)]:_(24)}]}},{"at":196,[_(19)]:_(1),[_(20)]:6,[_(26)]:{[_(9)]:_(1),[_(21)]:_(24),[_(23)]:_([27,22]),[_(25)]:[{[_(9)]:_(28),[_(21)]:_(24)}]}},{"at":266,[_(19)]:_(2),[_(20)]:6,[_(26)]:{[_(9)]:_(2),[_(21)]:_(29),[_(23)]:_([27,22]),[_(25)]:[{[_(9)]:"i",[_(21)]:_(24)}]}},{"at":347,[_(19)]:_(3),[_(20)]:6,[_(26)]:{[_(9)]:_(3),[_(21)]:_(24),[_(23)]:_([27,22]),[_(25)]:[{[_(9)]:_(28),[_(21)]:_(24)}]}},{"at":414,[_(19)]:_(4),[_(20)]:6,[_(26)]:{[_(9)]:_(4),[_(21)]:_(30),[_(23)]:_([27,22])}}],[_(36)]:[{"at":471,[_(19)]:_(5),[_(20)]:1,[_(26)]:{[_(9)]:_(5),[_(21)]:_(14),[_(23)]:_([32]),[_(25)]:[{[_(9)]:_(33),[_(21)]:_(24)},{[_(9)]:_(34),[_(21)]:_(24)}],[_(35)]:_([1,0,2,3,4])}}],[_(37)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true,[_(4)]:true}};
const data = {
  "name": "vertex/deferred-light",
  "code": _(["use '",8,"'::{ ",10," };\r\nuse '",13,"'::{ ",14,", ",15," };\r\nuse '",16,"'::{ ",17," };\r\n\r\n@",22," fn ",0,"(i: u32) -> ",15,";\r\n\r\n@",27," @",22," fn ",1,"(",28,": u32) -> u32 { ",40," ",28,"; };\r\n@",27," @",22," fn ",2,"(i: u32) -> ",29," { ",40," ",29,"(0.0); };\r\n@",27," @",22," fn ",3,"(",28,": u32) -> u32 { ",40," ",28,"; };\r\n@",27," @",22," fn ",4,"() -> f32 { ",40," 1.0; };\r\n\r\n@",32," fn ",5,"(",33,": u32, ",34,": u32) -> ",14," {\r\n  let ",42," = ",1,"(",34,");\r\n\r\n  if (IS_FULLSCREEN) {\r\n    let uv = ",17,"(",33,");\r\n    let xy = uv * 2.0 - 1.0;\r\n    let vertex = ",29,"(xy * 2.0 + 1.0, 0.5, 1.0);\r\n\r\n    ",40," ",14,"(vertex, ",42,");\r\n  } else {\r\n    let light = ",0,"(",42,");\r\n\r\n    var world: ",29,";\r\n    if (light.kind == 3) {\r\n      let sphere = ",2,"(",3,"(",33,"));\r\n      let scale = sqrt(light.intensity * 3.1415 / light.cutoff) * ",4,"();\r\n      world = ",29,"(light.",43,".xyz + sphere.xyz * scale, 1.0);\r\n    }\r\n\r\n    let ",43," = ",10,"(world);\r\n    ",40," ",14,"(",43,", ",42,");\r\n  }\r\n}"]).join(''),
  "hash": 7268828922459310,
  "table": t,
  "shake": [[157,[0,5]],[196,[1,5]],[266,[2,5]],[347,[3,5]],[414,[4,5]],[471,[5]]],
  "tree": decompressAST([[1,0,45],[1,48,101],[1,56,104],[1,53,87],[4,39,106,1],[1,0,9],[1,10,15],[2,9,20],[4,51,129,2],[1,0,9],[1,10,15],[2,9,20],[4,62,126,3],[1,0,9],[1,10,15],[2,9,17],[4,48,100,4],[1,0,9],[1,10,15],[2,9,17],[0,38,781],[1,0,7],[2,11,33],[2,64,75],[2,32,43],[2,68,77],[2,123,134],[2,60,68],[2,97,108],[2,12,20],[2,91,99],[2,113,124],[2,32,43]], t[S]),
};
const libs = {"../../../wgsl/use/view": m0, "../../../wgsl/use/types": m1, "../../../wgsl/geometry/quad": m2};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getDeferredLightVertex = getSymbol("getDeferredLightVertex");
