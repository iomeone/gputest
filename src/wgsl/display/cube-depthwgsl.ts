/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
import m0 from "../../wgsl/codec/octahedralwgsl";
import m1 from "./cube-gridwgsl";
import m2 from "./depthwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getTexture displayCubeDepth ../../wgsl/codec/octahedral decodeOctahedral ./cube-grid getCubeGridOverlay ./depth displayDepth link export vec2<f32>".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[O]:[{[A]:0,[N]:_(2),[S]:_([3]),[K]:[{[N]:_(3),[J]:_(3)}]},{[A]:0,[N]:_(4),[S]:_([5]),[K]:[{[N]:_(5),[J]:_(5)}]},{[A]:0,[N]:_(6),[S]:_([7]),[K]:[{[N]:_(7),[J]:_(7)}]}],[X]:[{[A]:138,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:C,[Z]:_([8]),[P]:[{[N]:"uv",[T]:D}]}}],[E]:[{[A]:190,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:C,[Z]:_([9]),[P]:[{[N]:"uv",[T]:_(10)}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "display/cube-depth.wgsl",
  code: _(["use '",2,"'::{ ",3," };\r\nuse '",4,"'::{ ",5," };\r\nuse '",6,"'::{ ",7," };\r\n\r\n@",8," fn ",0,"(uv: ",D,") -> ",C,";\r\n\r\n@",9," fn ",1,"(uv: ",10,") -> ",C," {\r\n  var uvw: ",D," = ",3,"((uv * 2.0 - 1.0) * ",10,"(1.0, -1.0));\r\n\r\n  let t = ",0,"(uvw);\r\n\r\n  let grid = ",5,"(uvw);\r\n  let tint = grid.xyz;\r\n  let border = grid.a;\r\n\r\n  let depthColor = ",7,"(t.x);\r\n  return mix(depthColor, ",C,"(tint, 1.0), border * 0.5);\r\n}\n"]).join(''),
  hash: 0xc74356f6e53d4,
  table,
  shake: [[138,[0,1]],[190,[1]]],
  tree: decompressAST([[1,0,55],[1,58,99],[1,44,75],[1,36,83],[0,52,418],[1,0,7],[2,11,27],[2,71,87],[2,72,82],[2,33,51],[2,95,107]], table[S]),
};

const libs = {"../../wgsl/codec/octahedral": m0, "./cube-grid": m1, "./depth": m2};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const displayCubeDepth = getSymbol("displayCubeDepth");
