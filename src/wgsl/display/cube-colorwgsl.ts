/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/codec/octahedralwgsl";
import m1 from "./cube-gridwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getTexture displayCubeColor ../../wgsl/codec/octahedral decodeOctahedral ./cube-grid getCubeGridOverlay link export vec2<f32>".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[O]:[{[A]:0,[N]:_(2),[S]:_([3]),[K]:[{[N]:_(3),[J]:_(3)}]},{[A]:0,[N]:_(4),[S]:_([5]),[K]:[{[N]:_(5),[J]:_(5)}]}],[X]:[{[A]:103,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:C,[Z]:_([6]),[P]:[{[N]:"uv",[T]:D}]}}],[E]:[{[A]:155,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:C,[Z]:_([7]),[P]:[{[N]:"uv",[T]:_(8)}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "display/cube-color.wgsl",
  code: _(["use '",2,"'::{ ",3," };\r\nuse '",4,"'::{ ",5," }\r\n\r\n@",6," fn ",0,"(uv: ",D,") -> ",C,";\r\n\r\n@",7," fn ",1,"(uv: ",8,") -> ",C," {\r\n  var uvw: ",D," = ",3,"(uv * 2.0 - 1.0);\r\n\r\n  let t = ",0,"(uvw);\r\n\r\n  let grid = ",5,"(uvw);\r\n  let tint = grid.xyz;\r\n  let border = grid.a;\r\n\r\n  return mix(t, ",C,"(tint, 1.0), border * 0.5);\r\n}\n"]).join(''),
  hash: 0x1de163a76c37ba,
  table,
  shake: [[103,[0,1]],[155,[1]]],
  tree: decompressAST([[1,0,55],[1,58,99],[1,45,92],[0,52,345],[1,0,7],[2,11,27],[2,71,87],[2,47,57],[2,33,51]], table[S]),
};

const libs = {"../../wgsl/codec/octahedral": m0, "./cube-grid": m1};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const displayCubeColor = getSymbol("displayCubeColor");
