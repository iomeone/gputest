/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("SH_DIFFUSE SH_SPECULAR getDefaultEnvironment sqr sampleDiffuse sampleSpecular array<vec3<f32>> link export uvw sigma f32 ddx ddy SH_DIFFUSE SH_SPECULAR return sample".split(' '));
const table = {[S]:_([0,1,2,3,4,5]),[W]:_([2]),[X]:[{[A]:0,[R]:_(0),[G]:2,[V]:{[N]:_(0),[T]:_(6),[Z]:_([7])}},{[A]:41,[R]:_(1),[G]:2,[V]:{[N]:_(1),[T]:_(6),[Z]:_([7])}}],[E]:[{[A]:85,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:C,[Z]:_([8]),[P]:[{[N]:_(9),[T]:D},{[N]:_(10),[T]:_(11)},{[N]:_(12),[T]:D},{[N]:_(13),[T]:D}],[I]:_([4,5])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "material/lights-default-env.wgsl",
  code: _(["@",7," var ",0,": ",6,";\r\n@",7," var ",1,": ",6,";\r\n\r\n@",8," fn ",2,"(\r\n  uvw: ",D,",\r\n  ",10,": f32,\r\n  ddx: ",D,",\r\n  ddy: ",D,",\r\n) -> ",C," {\r\n  if (",10," < 0.0) {\r\n    ",16," ",C,"(",4,"(uvw), 1.0);\r\n  }\r\n  ",16," ",C,"(",5,"(uvw, ",10,"), 1.0);\r\n}\r\n\r\nfn sqr(x: f32) -> f32 { ",16," x * x; }\r\n\r\nfn ",4,"(\r\n  ray: ",D,",\r\n) -> ",D," {\r\n\r\n  // 2nd order SH\r\n  let ",17," = max(\r\n    ",D,"(0.0),\r\n    ",0,"[0] +\r\n    ",0,"[1] * ray.y +\r\n    ",0,"[2] * ray.z +\r\n    ",0,"[3] * ray.x +\r\n    ",0,"[4] * ray.y * ray.x +\r\n    ",0,"[5] * ray.y * ray.z +\r\n    ",0,"[6] * (3.0 * sqr(ray.z) - 1.0) +\r\n    ",0,"[7] * ray.x * ray.z +\r\n    ",0,"[8] * (sqr(ray.x) - sqr(ray.y))\r\n  );\r\n\r\n  ",16," ",17,";\r\n}\r\n\r\nfn ",5,"(\r\n  ray: ",D,",\r\n  ",10,": f32,\r\n) -> ",D," {\r\n\r\n  // Simulate rough detail at ",10," size\r\n  let s = 0.2;\r\n  let f = clamp(1.0 - ",10," / 0.336, 0.0, 1.0);\r\n  let u = sin(ray / s);\r\n  let v = cos(ray / s);\r\n  let r = normalize(ray + (u.x*v.z + u.y*v.x + u.z*v.z*v.x) * s * f * f);\r\n\r\n  // 3rd order SH\r\n  let r2 = r * r;\r\n\r\n  let ",17," = max(\r\n    ",D,"(0.0),\r\n    ",1,"[ 0] +\r\n    ",1,"[ 1] * r.y +\r\n    ",1,"[ 2] * r.z +\r\n    ",1,"[ 3] * r.x +\r\n    ",1,"[ 4] * r.y * r.x +\r\n    ",1,"[ 5] * r.y * r.z +\r\n    ",1,"[ 6] * (3.0 * sqr(r.z) - 1.0) +\r\n    ",1,"[ 7] * r.x * r.z +\r\n    ",1,"[ 8] * (sqr(r.x) - sqr(r.y)) +\r\n    ",1,"[ 9] * r.y * (3 * r2.x - r2.y) +\r\n    ",1,"[10] * r.x * r.y * r.z +\r\n    ",1,"[11] * r.y * (5 * r2.z - 1) +\r\n    ",1,"[12] * r.z * (5 * r2.z - 3) +\r\n    ",1,"[13] * r.x * (5 * r2.z - 1) +\r\n    ",1,"[14] * r.z * (r2.x - r2.y) +\r\n    ",1,"[15] * r.x * (r2.x - 3 * r2.y)\r\n  );\r\n\r\n  ",16," ",17,";\r\n}\n"]).join(''),
  hash: 0x9b3b0b7eab9e5,
  table,
  shake: [[0,[0,4,2]],[41,[1,5,2]],[85,[2]],[340,[3,4,2,5]],[383,[4,2]],[847,[5,2]]],
  tree: decompressAST([[1,0,39],[1,41,81],[0,44,299],[1,0,7],[2,11,32],[2,157,170],[2,51,65],[0,36,79],[2,7,10],[0,36,500],[2,7,20],[2,120,130],[2,21,31],[2,29,39],[2,29,39],[2,29,39],[2,37,47],[2,37,47],[2,23,26],[2,25,35],[2,37,47],[2,17,20],[2,13,16],[0,40,1091],[2,7,21],[2,391,402],[2,23,34],[2,29,40],[2,29,40],[2,29,40],[2,35,46],[2,35,46],[2,25,28],[2,23,34],[2,35,46],[2,19,22],[2,11,14],[2,17,28],[2,49,60],[2,41,52],[2,46,57],[2,46,57],[2,46,57],[2,45,56]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getDefaultEnvironment = getSymbol("getDefaultEnvironment");
