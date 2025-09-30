/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../shader/wgsl";
import m0 from "../../../../wgsl/use/arraywgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSize getSeed velocityBuffer main ../../../../wgsl/use/array sizeToModulus2 packIndex2 vec2<u32> link f32 array<vec4<f32>> void compute globalId vec3<u32> builtin(global_invocation_id) globalId fragmentId uvRepeat velocity".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([3]),[O]:[{[A]:0,[N]:_(4),[S]:_([5,6]),[K]:[{[N]:_(5),[J]:_(5)},{[N]:_(6),[J]:_(6)}]}],[X]:[{[A]:69,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(7),[Z]:_([8])}},{[A]:106,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:_(9),[Z]:_([8])}},{[A]:139,[R]:_(2),[G]:2,[V]:{[N]:_(2),[T]:_(10),[Z]:_([8]),[Q]:"<storage, read_write>"}}],[E]:[{[A]:207,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(11),[Z]:_([12,"workgroup_size(8, 8)"]),[P]:[{[N]:_(13),[T]:_(14),[Z]:_([15])}],[I]:_([0,1,2])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  name: "cfd-compute/initial.wgsl",
  code: _(["use '",4,"'::{ ",5,", ",6," };\r\n\r\n@",8," fn ",0,"() -> ",7," {};\r\n@",8," fn ",1,"() -> f32 {};\r\n\r\n@",8," var<storage, read_write> ",2,": ",10,";\r\n\r\n@",12," @workgroup_size(8, 8)\r\nfn ",3,"(\r\n  @",15," ",13,": ",14,",\r\n) {\r\n  let size = ",0,"();\r\n  if (any(",13,".xy >= size)) { return; }\r\n  let ",17," = ",13,".xy;\r\n\r\n  let modulus = ",5,"(size);\r\n  let index = ",6,"(",17,", modulus);\r\n  let uv = (vec2<f32>(",17,") + 0.5) / vec2<f32>(size);\r\n\r\n  // Random shapes for initial density\r\n  let ",18," = fract(uv) - .5;\r\n  var xy1 = ",18," - vec2<f32>(0, .5);\r\n  var xy2 = ",18," - vec2<f32>(0, .3);\r\n  var xy3 = ",18," - vec2<f32>(.33, -.4);\r\n  var xy4 = ",18," - vec2<f32>(.33, .4);\r\n\r\n  let sd = ",1,"();\r\n  let dx = sin(",18,".y * 6.28*6.0 + sd * 3.0);\r\n  let dy = cos(",18,".x * 6.28*6.0 - sd*sd * 2.0) + .3;\r\n  xy1 += vec2<f32>(dx, dy)*.1;\r\n  xy2 += vec2<f32>(dx, dy)*.1;\r\n\r\n  let r1 = dot(xy1, xy1);\r\n  let r2 = dot(xy2, xy2);\r\n  let r3 = dot(xy3, xy3);\r\n\r\n  let c1 = f32(r1 < .3);\r\n  let c2 = f32(r2 < .2);\r\n  let c3 = f32(r3 < .001);\r\n  let c4 = f32(abs(xy4.x) < .1 && abs(xy4.y) < .01);\r\n\r\n  let c = (1.0 - c1) * c2 + c3 + c4;\r\n\r\n  // Random swirl for initial ",19,"\r\n  let edge = min(uv, 1.0 - uv);\r\n  let ",19," = vec2<f32>(-",18,".y, ",18,".x) / (1.0 + dot(uv, uv)) * edge.x * edge.y * 30.0 + vec2<f32>(dx + .1, dy) * .35;\r\n\r\n  ",2,"[index] = ",C,"(",19,", c, 1.0);\r\n}\n"]).join(''),
  hash: 0x2fac777960800,
  table,
  shake: [[69,[0,3]],[106,[1,3]],[139,[2,3]],[207,[3]]],
  tree: decompressAST([[1,0,64],[1,69,103],[1,37,65],[1,33,97],[0,68,1396],[3,0,8],[3,9,30],[2,26,30],[3,9,39],[2,71,78],[2,108,122],[2,37,47],[2,357,364],[2,656,670]], table[S]),
};

const libs = {"../../../../wgsl/use/array": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
