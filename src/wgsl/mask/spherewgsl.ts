/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
import m0 from "../../wgsl/mask/sdfwgsl";
import m1 from "../../wgsl/use/typeswgsl";
import m2 from "../../wgsl/use/viewwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("traceSphereQuad ../../wgsl/mask/sdf getUVWScale ../../wgsl/use/types DepthNormalFragment ../../wgsl/use/view getViewVector worldToDepth worldToW export normal tangent position coord DepthNormalFragment tangent position center radius origin direction".split(' '));
const table = {[S]:_([0]),[W]:_([0]),[O]:[{[A]:0,[N]:_(1),[S]:_([2]),[K]:[{[N]:_(2),[J]:_(2)}]},{[A]:0,[N]:_(3),[S]:_([4]),[K]:[{[N]:_(4),[J]:_(4)}]},{[A]:0,[N]:_(5),[S]:_([6,7,8]),[K]:[{[N]:_(6),[J]:_(6)},{[N]:_(7),[J]:_(7)},{[N]:_(8),[J]:_(8)}]}],[E]:[{[A]:172,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:_(4),[Z]:_([9]),[P]:[{[N]:"uv",[T]:C},{[N]:"st",[T]:C},{[N]:_(10),[T]:C},{[N]:_(11),[T]:C},{[N]:_(12),[T]:C},{[N]:_(13),[T]:C}]}}]};
const data = {
  name: "mask/sphere.wgsl",
  code: _(["use '",1,"'::{ ",2," };\r\nuse '",3,"'::{ ",4," };\r\nuse '",5,"'::{ ",6,", ",7,", ",8," };\r\n\r\n@",9," fn ",0,"(\r\n  uv: ",C,",\r\n  st: ",C,",\r\n  ",10,": ",C,",\r\n  ",11,": ",C,",\r\n  ",12,": ",C,",\r\n  ",13,": ",C,",\r\n) -> ",4," {\r\n\r\n  // Sphere encoded in ",11," component\r\n  let ",17," = ",11,".xyz;\r\n  let ",18," = ",11,".w;\r\n\r\n  let ",19," = ",12,".xyz;\r\n  let view = ",6,"(",12,".xyz);\r\n  let ",20," = ",10,"ize(view);\r\n\r\n  // SDF AA range\r\n  let dr = 1.414 / ",2,"(",12,".xyz);\r\n\r\n  // Distance from ray to ",17,"\r\n  let dp = ",19," - ",17,";\r\n  let b = dot(",20,", dp);\r\n  let d = length(dp - b * ",20,");\r\n  if (d > ",18," + dr) {\r\n    return ",4,"(",10,", 0.0, 0.0);\r\n  }\r\n\r\n  // Extend ",18," for anti-aliasing (ray always hits)\r\n  let r = max(",18,", d);\r\n  let c = dot(dp, dp) - r * r;\r\n\r\n  // Solve intersection\r\n  let det = max(0.0, b * b - c);\r\n  let t = -(b - sqrt(det));\r\n\r\n  // Apply edge SDF\r\n  let sdf = ",18," - d;\r\n  let a = clamp((sdf * dr) + .5, 0.0, 1.0);\r\n\r\n  // Sphere point\r\n  let world = ",19," + ",20," * t;\r\n  let worldNormal = ",10,"ize(world - ",17,");\r\n  let outNormal = ",C,"(worldNormal, 0.0);\r\n\r\n  let alpha = select(select(0.0, 1.0, a >= 0.5), a, POINT_SMOOTH);\r\n  let depth = ",7,"(",C,"(world.xyz, 1.0));\r\n\r\n  return ",4,"(outNormal, alpha, depth);\r\n}\n"]).join(''),
  hash: 0x143af2c6149db8,
  table,
  shake: [[172,[0]]],
  tree: decompressAST([[1,0,42],[1,45,96],[1,54,122],[0,73,1393],[1,0,7],[2,11,26],[2,149,168],[2,168,181],[2,106,117],[2,200,219],[2,585,597],[2,53,72]], table[S]),
};

const libs = {"../../wgsl/mask/sdf": m0, "../../wgsl/use/types": m1, "../../wgsl/use/view": m2};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const traceSphereQuad = getSymbol("traceSphereQuad");
