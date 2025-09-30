/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getSize getSeed velocityTexture main symbols visibles symbol flags name vec2<u32> type link attr func f32 u32 parameters variable externals void compute globalId vec3<u32> builtin(global_invocation_id) identifiers exports linkable globalId center uvRepeat velocity".split(' '));
const t = {[_(4)]:_([0,1,2,3]),[_(5)]:_([3]),[_(18)]:[{"at":0,[_(6)]:_(0),[_(7)]:2,[_(13)]:{[_(8)]:_(0),[_(10)]:_(9),[_(12)]:_([11])}},{"at":37,[_(6)]:_(1),[_(7)]:2,[_(13)]:{[_(8)]:_(1),[_(10)]:_(14),[_(12)]:_([11]),[_(16)]:[{[_(8)]:"i",[_(10)]:_(15)}]}},{"at":76,[_(6)]:_(2),[_(7)]:2,[_(17)]:{[_(8)]:_(2),[_(10)]:"texture_storage_2d<rgba32float, write>",[_(12)]:_([11])}}],[_(25)]:[{"at":146,[_(6)]:_(3),[_(7)]:1,[_(13)]:{[_(8)]:_(3),[_(10)]:_(19),[_(12)]:_([20,"workgroup_size(8, 8)"]),[_(16)]:[{[_(8)]:_(21),[_(10)]:_(22),[_(12)]:_([23])}],[_(24)]:_([0,1,2])}}],[_(26)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  "name": "cfd-texture/initial",
  "code": _(["@",11," fn ",0,"() -> ",9," {};\r\n@",11," fn ",1,"(i: u32) -> f32 {};\r\n\r\n@",11," var ",2,": texture_storage_2d<rgba32float, write>;\r\n\r\n@",20," @workgroup_size(8, 8)\r\nfn ",3,"(\r\n  @",23," ",21,": ",22,",\r\n) {\r\n  let size = ",0,"();\r\n\r\n  if (any(",21,".xy >= size)) { return; }\r\n  let ",28," = vec2<i32>(",21,".xy);\r\n\r\n  let uv = (vec2<f32>(",28,") + 0.5) / vec2<f32>(size);\r\n\r\n  // Random shapes for initial density\r\n  let ",29," = fract(uv) - .5;\r\n  var xy1 = ",29," - vec2<f32>(0, .5);\r\n  var xy2 = ",29," - vec2<f32>(0, .3);\r\n  var xy3 = ",29," - vec2<f32>(.33, -.4);\r\n  var xy4 = ",29," - vec2<f32>(.33, .4);\r\n\r\n  let sd = ",1,"(0u);\r\n  let dx = sin(",29,".y * 6.28*6.0 + sd * 3.0);\r\n  let dy = cos(",29,".x * 6.28*6.0 - sd*sd * 2.0) + .3;\r\n  xy1 += vec2<f32>(dx, dy)*.1;\r\n  xy2 += vec2<f32>(dx, dy)*.1;\r\n\r\n  let r1 = dot(xy1, xy1);\r\n  let r2 = dot(xy2, xy2);\r\n  let r3 = dot(xy3, xy3);\r\n\r\n  let c1 = f32(r1 < .3);\r\n  let c2 = f32(r2 < .2);\r\n  let c3 = f32(r3 < .001);\r\n  let c4 = f32(abs(xy4.x) < .1 && abs(xy4.y) < .01);\r\n\r\n  let c = (1.0 - c1) * c2 + c3 + c4;\r\n\r\n  // Random swirl for initial ",30,"\r\n  let edge = min(uv, 1.0 - uv);\r\n  let ",30," = vec2<f32>(-",29,".y, ",29,".x) / (1.0 + dot(uv, uv)) * edge.x * edge.y * 30.0 + vec2<f32>(dx + .1, dy) * .35;\r\n\r\n  textureStore(",2,", ",28,", vec4<f32>(",30,", c, 0.0));\r\n}"]).join(''),
  "hash": 1216640997600282,
  "table": t,
  "shake": [[0,[0,3]],[37,[1,3]],[76,[2,3]],[146,[3]]],
  "tree": decompressAST([[1,0,34],[1,37,71],[1,39,105],[0,70,1333],[3,0,8],[3,9,30],[2,26,30],[3,9,39],[2,71,78],[2,420,427],[2,671,686]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
