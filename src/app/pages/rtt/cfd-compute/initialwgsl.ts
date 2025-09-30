/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../shader/wgsl";
import m0 from "../../../../wgsl/use/arraywgsl";
const {} = symbolDictionary;
const _ = decompressString("getSize getSeed velocityBuffer main symbols visibles ../../../../wgsl/use/array name sizeToModulus2 packIndex2 imported imports modules symbol flags vec2<u32> type link attr func f32 array<vec4<f32>> qual variable externals void compute globalId vec3<u32> builtin(global_invocation_id) parameters identifiers exports linkable globalId fragmentId uvRepeat velocity".split(' '));
const t = {[_(4)]:_([0,1,2,3]),[_(5)]:_([3]),[_(12)]:[{"at":0,[_(7)]:_(6),[_(4)]:_([8,9]),[_(11)]:[{[_(7)]:_(8),[_(10)]:_(8)},{[_(7)]:_(9),[_(10)]:_(9)}]}],[_(24)]:[{"at":69,[_(13)]:_(0),[_(14)]:2,[_(19)]:{[_(7)]:_(0),[_(16)]:_(15),[_(18)]:_([17])}},{"at":106,[_(13)]:_(1),[_(14)]:2,[_(19)]:{[_(7)]:_(1),[_(16)]:_(20),[_(18)]:_([17])}},{"at":139,[_(13)]:_(2),[_(14)]:2,[_(23)]:{[_(7)]:_(2),[_(16)]:_(21),[_(18)]:_([17]),[_(22)]:"<storage, read_write>"}}],[_(32)]:[{"at":207,[_(13)]:_(3),[_(14)]:1,[_(19)]:{[_(7)]:_(3),[_(16)]:_(25),[_(18)]:_([26,"workgroup_size(8, 8)"]),[_(30)]:[{[_(7)]:_(27),[_(16)]:_(28),[_(18)]:_([29])}],[_(31)]:_([0,1,2])}}],[_(33)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  "name": "cfd-compute/initial",
  "code": _(["use '",6,"'::{ ",8,", ",9," };\r\n\r\n@",17," fn ",0,"() -> ",15," {};\r\n@",17," fn ",1,"() -> f32 {};\r\n\r\n@",17," var<storage, read_write> ",2,": ",21,";\r\n\r\n@",26," @workgroup_size(8, 8)\r\nfn ",3,"(\r\n  @",29," ",27,": ",28,",\r\n) {\r\n  let size = ",0,"();\r\n  if (any(",27,".xy >= size)) { return; }\r\n  let ",35," = ",27,".xy;\r\n\r\n  let modulus = ",8,"(size);\r\n  let index = ",9,"(",35,", modulus);\r\n  let uv = (vec2<f32>(",35,") + 0.5) / vec2<f32>(size);\r\n\r\n  // Random shapes for initial density\r\n  let ",36," = fract(uv) - .5;\r\n  var xy1 = ",36," - vec2<f32>(0, .5);\r\n  var xy2 = ",36," - vec2<f32>(0, .3);\r\n  var xy3 = ",36," - vec2<f32>(.33, -.4);\r\n  var xy4 = ",36," - vec2<f32>(.33, .4);\r\n\r\n  let sd = ",1,"();\r\n  let dx = sin(",36,".y * 6.28*6.0 + sd * 3.0);\r\n  let dy = cos(",36,".x * 6.28*6.0 - sd*sd * 2.0) + .3;\r\n  xy1 += vec2<f32>(dx, dy)*.1;\r\n  xy2 += vec2<f32>(dx, dy)*.1;\r\n\r\n  let r1 = dot(xy1, xy1);\r\n  let r2 = dot(xy2, xy2);\r\n  let r3 = dot(xy3, xy3);\r\n\r\n  let c1 = f32(r1 < .3);\r\n  let c2 = f32(r2 < .2);\r\n  let c3 = f32(r3 < .001);\r\n  let c4 = f32(abs(xy4.x) < .1 && abs(xy4.y) < .01);\r\n\r\n  let c = (1.0 - c1) * c2 + c3 + c4;\r\n\r\n  // Random swirl for initial ",37,"\r\n  let edge = min(uv, 1.0 - uv);\r\n  let ",37," = vec2<f32>(-",36,".y, ",36,".x) / (1.0 + dot(uv, uv)) * edge.x * edge.y * 30.0 + vec2<f32>(dx + .1, dy) * .35;\r\n\r\n  ",2,"[index] = vec4<f32>(",37,", c, 1.0);\r\n}"]).join(''),
  "hash": 8716754349758385,
  "table": t,
  "shake": [[69,[0,3]],[106,[1,3]],[139,[2,3]],[207,[3]]],
  "tree": decompressAST([[1,0,64],[1,69,103],[1,37,65],[1,33,97],[0,68,1396],[3,0,8],[3,9,30],[2,26,30],[3,9,39],[2,71,78],[2,108,122],[2,37,47],[2,357,364],[2,656,670]], t[S]),
};
const libs = {"../../../../wgsl/use/array": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
