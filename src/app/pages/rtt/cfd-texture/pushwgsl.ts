/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSize getMousePosition getMouseDirection velocityTextureOut velocityTextureIn main vec2<u32> link vec2<f32> texture_2d<f32> void compute globalId vec3<u32> builtin(global_invocation_id) globalId center ripple circle sample".split(' '));
const table = {[S]:_([0,1,2,3,4,5]),[W]:_([5]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(6),[Z]:_([7])}},{[A]:39,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:_(8),[Z]:_([7])}},{[A]:85,[R]:_(2),[G]:2,[F]:{[N]:_(2),[T]:_(8),[Z]:_([7])}},{[A]:134,[R]:_(3),[G]:2,[V]:{[N]:_(3),[T]:"texture_storage_2d<rgba32float, write>",[Z]:_([7])}},{[A]:205,[R]:_(4),[G]:2,[V]:{[N]:_(4),[T]:_(9),[Z]:_([7])}}],[E]:[{[A]:254,[R]:_(5),[G]:1,[F]:{[N]:_(5),[T]:_(10),[Z]:_([11,"workgroup_size(8, 8)"]),[P]:[{[N]:_(12),[T]:_(13),[Z]:_([14])}],[I]:_([0,1,2,4,3])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true,[_(4)]:true}};
const data = {
  name: "cfd-texture/push.wgsl",
  code: _(["@",7," fn ",0,"() -> ",6," {};\r\n\r\n@",7," fn ",1,"() -> ",8," {};\r\n@",7," fn ",2,"() -> ",8," {};\r\n\r\n@",7," var ",3,": texture_storage_2d<rgba32float, write>;\r\n@",7," var ",4,": ",9,";\r\n\r\n@",11," @workgroup_size(8, 8)\r\nfn ",5,"(\r\n  @",14," ",12,": ",13,",\r\n) {\r\n  let size = ",0,"();\r\n  if (any(",12,".xy >= size)) { return; }\r\n  let fragmentId = ",12,".xy;\r\n\r\n  let ",16," = vec2<i32>(",12,".xy);\r\n  let mp = ",1,"();\r\n  let md = -",2,"();\r\n\r\n  let xy = (",8,"(fragmentId) - mp) / f32(size.y) * 16.0;\r\n  let r1 = dot(xy, xy);\r\n\r\n  let strength = max(0.0, 1.0 / (r1 + 1.0) * (1.0 - r1));\r\n  let velocity = md * strength / 32.0 / max(1.0, length(md) / 5.0);\r\n\r\n  var ",17," = sin((xy + cos(xy.yx + mp) * 4.0 - mp) * ",8,"(13.311, 17.717));\r\n  ",17," *= ",17,".yx;\r\n  ",17," *= ",17,";\r\n\r\n  let ",18," = f32(r1 < 1.0) * r1 * (1.0 - r1);\r\n  let density = (",17,".x * ",17,".y) * (",18," * ",18,") * 2.0;\r\n\r\n  var ",19," = textureLoad(",4,", ",16,", 0);\r\n  ",19," += ",C,"(velocity, density, 0.0);\r\n  textureStore(",3,", ",16,", ",19,");\r\n}\n"]).join(''),
  hash: 0xc4ea2cc411958,
  table,
  shake: [[0,[0,5]],[39,[1,5]],[85,[2,5]],[134,[3,5]],[205,[4,5]],[254,[5]]],
  tree: decompressAST([[1,0,34],[1,39,82],[1,46,90],[1,49,118],[1,71,116],[0,49,993],[3,0,8],[3,9,30],[2,26,30],[3,9,39],[2,71,78],[2,143,159],[2,33,50],[2,519,536],[2,95,113]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
