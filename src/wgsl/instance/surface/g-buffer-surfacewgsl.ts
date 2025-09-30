/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
import m0 from "../../../wgsl/use/viewwgsl";
import m1 from "../../../wgsl/use/typeswgsl";
import m2 from "../../../wgsl/codec/octahedralwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getAlbedo getNormals getMaterial getEmissive getDepth getGBufferSurface ../../../wgsl/use/view getViewPosition clipToWorld to3D ../../../wgsl/use/types SurfaceFragment ../../../wgsl/codec/octahedral decodeOctahedral link vec2<f32> f32 export coord SurfaceFragment decodeOctahedral albedo normals".split(' '));
const table = {[S]:_([0,1,2,3,4,5]),[W]:_([5]),[O]:[{[A]:0,[N]:_(6),[S]:_([7,8,9]),[K]:[{[N]:_(7),[J]:_(7)},{[N]:_(8),[J]:_(8)},{[N]:_(9),[J]:_(9)}]},{[A]:0,[N]:_(10),[S]:_([11]),[K]:[{[N]:_(11),[J]:_(11)}]},{[A]:0,[N]:_(12),[S]:_([13]),[K]:[{[N]:_(13),[J]:_(13)}]}],[X]:[{[A]:187,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:C,[Z]:_([14]),[P]:[{[N]:"uv",[T]:_(15)}]}},{[A]:236,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:C,[Z]:_([14]),[P]:[{[N]:"uv",[T]:_(15)}]}},{[A]:286,[R]:_(2),[G]:2,[F]:{[N]:_(2),[T]:C,[Z]:_([14]),[P]:[{[N]:"uv",[T]:_(15)}]}},{[A]:337,[R]:_(3),[G]:2,[F]:{[N]:_(3),[T]:C,[Z]:_([14]),[P]:[{[N]:"uv",[T]:_(15)}]}},{[A]:388,[R]:_(4),[G]:2,[F]:{[N]:_(4),[T]:_(16),[Z]:_([14]),[P]:[{[N]:"uv",[T]:_(15)}]}}],[E]:[{[A]:432,[R]:_(5),[G]:1,[F]:{[N]:_(5),[T]:_(11),[Z]:_([17]),[P]:[{[N]:"uv",[T]:_(15)},{[N]:_(18),[T]:C}],[I]:_([0,1,2,4])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true,[_(4)]:true}};
const data = {
  name: "surface/g-buffer-surface.wgsl",
  code: _(["use '",6,"'::{ ",7,", ",8,", ",9," };\r\nuse '",10,"'::{ ",11," };\r\nuse '",12,"'::{ ",13," };\r\n\r\n@",14," fn ",0,"(uv: ",15,") -> ",C,";\r\n@",14," fn ",1,"(uv: ",15,") -> ",C,";\r\n@",14," fn ",2,"(uv: ",15,") -> ",C,";\r\n@",14," fn ",3,"(uv: ",15,") -> ",C,";\r\n@",14," fn ",4,"(uv: ",15,") -> f32;\r\n\r\n@",17," fn ",5,"(\r\n  uv: ",15,",\r\n  ",18,": ",C,",\r\n) -> ",11," {\r\n  let ",21," = ",0,"(uv);\r\n  let ",22," = ",1,"(uv);\r\n  let material = ",2,"(uv);\r\n  let depth = ",4,"(uv);\r\n\r\n  let position = ",9,"(",8,"(",C,"((uv * 2.0 - 1.0) * ",15,"(1.0, -1.0), depth, 1.0)));\r\n  let normal = ",13,"(",22,".xy);\r\n  let bent = ",13,"(",22,".zw);\r\n\r\n  return ",11,"(\r\n    ",C,"(position, 1.0),\r\n    ",C,"(normal, 0.0),\r\n    ",C,"(bent, ",21,".w),\r\n    ",C,"(",21,".xyz, 1.0),\r\n    ",C,"(0.0),\r\n    material,\r\n    0.0,\r\n  );\r\n}\n"]).join(''),
  hash: 0x1def3a3b3a3b89,
  table,
  shake: [[187,[0,5]],[236,[1,5]],[286,[2,5]],[337,[3]],[388,[4,5]],[432,[5]]],
  tree: decompressAST([[1,0,68],[1,71,121],[1,53,111],[1,63,109],[1,49,96],[1,50,98],[1,51,99],[1,51,90],[0,44,666],[1,0,7],[2,11,28],[2,64,79],[2,34,43],[2,32,42],[2,34,45],[2,32,40],[2,34,38],[2,5,16],[2,94,110],[2,44,60],[2,42,57]], table[S]),
};

const libs = {"../../../wgsl/use/view": m0, "../../../wgsl/use/types": m1, "../../../wgsl/codec/octahedral": m2};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getGBufferSurface = getSymbol("getGBufferSurface");
