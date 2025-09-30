/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSize getSeed velocityTexture main vec2<u32> link f32 u32 void compute globalId vec3<u32> builtin(global_invocation_id) globalId center uvRepeat velocity".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([3]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(4),[Z]:_([5])}},{[A]:37,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:_(6),[Z]:_([5]),[P]:[{[N]:"i",[T]:_(7)}]}},{[A]:76,[R]:_(2),[G]:2,[V]:{[N]:_(2),[T]:"texture_storage_2d<rgba32float, write>",[Z]:_([5])}}],[E]:[{[A]:146,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(8),[Z]:_([9,"workgroup_size(8, 8)"]),[P]:[{[N]:_(10),[T]:_(11),[Z]:_([12])}],[I]:_([0,1,2])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  name: "cfd-texture/initial.wgsl",
  code: _(["@",5," fn ",0,"() -> ",4," {};\r\n@",5," fn ",1,"(i: u32) -> f32 {};\r\n\r\n@",5," var ",2,": texture_storage_2d<rgba32float, write>;\r\n\r\n@",9," @workgroup_size(8, 8)\r\nfn ",3,"(\r\n  @",12," ",10,": ",11,",\r\n) {\r\n  let size = ",0,"();\r\n\r\n  if (any(",10,".xy >= size)) { return; }\r\n  let ",14," = vec2<i32>(",10,".xy);\r\n\r\n  let uv = (vec2<f32>(",14,") + 0.5) / vec2<f32>(size);\r\n\r\n  // Random shapes for initial density\r\n  let ",15," = fract(uv) - .5;\r\n  var xy1 = ",15," - vec2<f32>(0, .5);\r\n  var xy2 = ",15," - vec2<f32>(0, .3);\r\n  var xy3 = ",15," - vec2<f32>(.33, -.4);\r\n  var xy4 = ",15," - vec2<f32>(.33, .4);\r\n\r\n  let sd = ",1,"(0u);\r\n  let dx = sin(",15,".y * 6.28*6.0 + sd * 3.0);\r\n  let dy = cos(",15,".x * 6.28*6.0 - sd*sd * 2.0) + .3;\r\n  xy1 += vec2<f32>(dx, dy)*.1;\r\n  xy2 += vec2<f32>(dx, dy)*.1;\r\n\r\n  let r1 = dot(xy1, xy1);\r\n  let r2 = dot(xy2, xy2);\r\n  let r3 = dot(xy3, xy3);\r\n\r\n  let c1 = f32(r1 < .3);\r\n  let c2 = f32(r2 < .2);\r\n  let c3 = f32(r3 < .001);\r\n  let c4 = f32(abs(xy4.x) < .1 && abs(xy4.y) < .01);\r\n\r\n  let c = (1.0 - c1) * c2 + c3 + c4;\r\n\r\n  // Random swirl for initial ",16,"\r\n  let edge = min(uv, 1.0 - uv);\r\n  let ",16," = vec2<f32>(-",15,".y, ",15,".x) / (1.0 + dot(uv, uv)) * edge.x * edge.y * 30.0 + vec2<f32>(dx + .1, dy) * .35;\r\n\r\n  textureStore(",2,", ",14,", ",C,"(",16,", c, 0.0));\r\n}\n"]).join(''),
  hash: 0x93eec89e85369,
  table,
  shake: [[0,[0,3]],[37,[1,3]],[76,[2,3]],[146,[3]]],
  tree: decompressAST([[1,0,34],[1,37,71],[1,39,105],[0,70,1333],[3,0,8],[3,9,30],[2,26,30],[3,9,39],[2,71,78],[2,420,427],[2,671,686]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
