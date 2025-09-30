/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../shader/wgsl";
import m0 from "../../../../wgsl/use/arraywgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSize getMousePosition getMouseDirection velocityBuffer main ../../../../wgsl/use/array sizeToModulus2 packIndex2 vec2<u32> link vec2<f32> array<vec4<f32>> void compute globalId vec3<u32> builtin(global_invocation_id) globalId fragmentId ripple circle".split(' '));
const table = {[S]:_([0,1,2,3,4]),[W]:_([4]),[O]:[{[A]:0,[N]:_(5),[S]:_([6,7]),[K]:[{[N]:_(6),[J]:_(6)},{[N]:_(7),[J]:_(7)}]}],[X]:[{[A]:69,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(8),[Z]:_([9])}},{[A]:108,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:_(10),[Z]:_([9])}},{[A]:154,[R]:_(2),[G]:2,[F]:{[N]:_(2),[T]:_(10),[Z]:_([9])}},{[A]:203,[R]:_(3),[G]:2,[V]:{[N]:_(3),[T]:_(11),[Z]:_([9]),[Q]:"<storage, read_write>"}}],[E]:[{[A]:271,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:_(12),[Z]:_([13,"workgroup_size(8, 8)"]),[P]:[{[N]:_(14),[T]:_(15),[Z]:_([16])}],[I]:_([0,1,2,3])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true}};
const data = {
  name: "cfd-compute/push.wgsl",
  code: _(["use '",5,"'::{ ",6,", ",7," };\r\n\r\n@",9," fn ",0,"() -> ",8," {};\r\n\r\n@",9," fn ",1,"() -> ",10," {};\r\n@",9," fn ",2,"() -> ",10," {};\r\n\r\n@",9," var<storage, read_write> ",3,": ",11,";\r\n\r\n@",13," @workgroup_size(8, 8)\r\nfn ",4,"(\r\n  @",16," ",14,": ",15,",\r\n) {\r\n  let size = ",0,"();\r\n  if (any(",14,".xy >= size)) { return; }\r\n  let ",18," = ",14,".xy;\r\n\r\n  let modulus = ",6,"(size);\r\n  let index = ",7,"(",18,", modulus);\r\n\r\n  var mp = ",1,"();\r\n  var md = -",2,"();\r\n\r\n  let xy = (",10,"(",18,") - mp) / f32(size.y) * 16.0;\r\n  let r1 = dot(xy, xy);\r\n\r\n  let strength = max(0.0, 1.0 / (r1 + 1.0) * (1.0 - r1));\r\n  let velocity = md * strength / 32.0 / max(1.0, length(md) / 5.0);\r\n\r\n  var ",19," = sin((xy + cos(xy.yx + mp) * 4.0 - mp) * ",10,"(13.311, 17.717));\r\n  ",19," *= ",19,".yx;\r\n  ",19," *= ",19,";\r\n\r\n  let ",20," = f32(r1 < 1.0) * r1 * (1.0 - r1);\r\n  let density = (",19,".x * ",19,".y) * (",20," * ",20,") * 2.0;\r\n\r\n  ",3,"[index] += ",C,"(velocity, density, 0.0);\r\n}\n"]).join(''),
  hash: 0x1d4b84a0e838ac,
  table,
  shake: [[69,[0,4]],[108,[1,4]],[154,[2,4]],[203,[3,4]],[271,[4]]],
  tree: decompressAST([[1,0,64],[1,69,103],[1,39,82],[1,46,90],[1,49,113],[0,68,964],[3,0,8],[3,9,30],[2,26,30],[3,9,39],[2,71,78],[2,108,122],[2,37,47],[2,47,63],[2,33,50],[2,494,508]], table[S]),
};

const libs = {"../../../../wgsl/use/array": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
