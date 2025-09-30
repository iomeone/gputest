/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
import m0 from "../../../wgsl/codec/octahedralwgsl";
import m1 from "../../../wgsl/codec/cubemapwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getTexture toLayer getQuadsToHemiSample ../../../wgsl/codec/octahedral decodeOctahedral decodeHemiOctahedral wrapOctahedral ../../../wgsl/codec/cubemap encodeCubeMap link vec2<f32> layer u32 export select".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[O]:[{[A]:0,[N]:_(3),[S]:_([4,5,6]),[K]:[{[N]:_(4),[J]:_(4)},{[N]:_(5),[J]:_(5)},{[N]:_(6),[J]:_(6)}]},{[A]:0,[N]:_(7),[S]:_([8]),[K]:[{[N]:_(8),[J]:_(8)}]}],[X]:[{[A]:156,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:C,[Z]:_([9]),[P]:[{[N]:"uv",[T]:_(10)},{[N]:_(11),[T]:_(12)}]}}],[E]:[{[A]:372,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:C,[Z]:_([13]),[P]:[{[N]:"uv",[T]:_(10)}],[I]:_([1,0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "sample/quads-to-hemi.wgsl",
  code: _(["use '",3,"'::{ ",4,", ",5,", ",6," };\r\nuse '",7,"'::{ ",8," };\r\n\r\n@",9," fn ",0,"(uv: ",10,", ",11,": u32) -> ",C,";\r\n\r\n// +Y is the only full face, -Y is unused, others are half and split between top and bottom half\r\nconst ",1,": array<u32, 6> = array(1,1,0,3,2,2);\r\n\r\n@",13," fn ",2,"(uv: ",10,") -> ",C," {\r\n  let hemi = uv.xy * 2.0 - 1.0;\r\n\r\n  // Remap octohedral Z to cubemap Y\r\n  let uvw = ",5,"(hemi);\r\n  let xyl = ",8,"(uvw.yzx);\r\n\r\n  let hl = ",1,"[xyl.",11,"];\r\n  let hs = ",14,"((xyl.",11," & 1u) + 1u, 0u, xyl.",11," == 2u);\r\n\r\n  // Map +X/-X and +Z/-Z half-faces\r\n  let cu = xyl.xy.x * .5 + .5;\r\n  let cv = xyl.xy.y * .5 + .5;\r\n  let hv = ",14,"(\r\n    cv,\r\n    ",14,"(cv, cv + .5, hs > 1u),\r\n    hs > 0u\r\n  );\r\n  let huv = ",10,"(cu, hv);\r\n\r\n  let sample = ",0,"(huv, hl);\r\n  return ",14,"(",C,"(1.0), sample, uvw.z >= 0.0);\r\n};\n"]).join(''),
  hash: 0x3747382eb8b44,
  table,
  shake: [[156,[0,2]],[216,[1,2]],[372,[2]]],
  tree: decompressAST([[1,0,96],[1,99,151],[1,57,116],[0,60,212],[2,108,115],[0,48,674],[1,0,7],[2,11,31],[2,137,157],[2,41,54],[2,38,45],[2,320,330]], table[S]),
};

const libs = {"../../../wgsl/codec/octahedral": m0, "../../../wgsl/codec/cubemap": m1};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getQuadsToHemiSample = getSymbol("getQuadsToHemiSample");
