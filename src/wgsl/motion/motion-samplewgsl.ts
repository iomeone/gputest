/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/use/viewwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getDepth getReprojectionMatrix getMotionSample ../../wgsl/use/view clipUVToXY to3D f32 link vec2<f32> mat4x4<f32> export motionDebug clipDepth deltaUVZ".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[O]:[{[A]:0,[N]:_(3),[S]:_([4,5]),[K]:[{[N]:_(4),[J]:_(4)},{[N]:_(5),[J]:_(5)}]}],[X]:[{[A]:52,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(6),[Z]:_([7]),[P]:[{[N]:"uv",[T]:_(8)}]}},{[A]:96,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:_(9),[Z]:_([7])}}],[E]:[{[A]:217,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:C,[Z]:_([10]),[P]:[{[N]:"uv",[T]:_(8)}],[I]:_([0,1])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "motion/motion-sample.wgsl",
  code: _(["use '",3,"'::{ ",4,", ",5," };\r\n\r\n@",7," fn ",0,"(uv: ",8,") -> f32;\r\n\r\n@",7," fn ",1,"() -> ",9,";\r\n\r\n//@",7," var<storage, read_write> ",11,": array<atomic<u32>>;\r\n\r\n@",10," fn ",2,"(uv: ",8,") -> ",C," {\r\n  let ",12," = ",0,"(uv);\r\n  let clipXY = ",4,"(uv);\r\n  let clip = ",C,"(clipXY, ",12,", 1.0);\r\n\r\n  let reprojected = ",5,"(",1,"() * clip);\r\n\r\n  let delta = clip.xyz - reprojected.xyz;\r\n  let ",13," = ",D,"(delta) * ",D,"(0.5, -0.5, 1.0);\r\n\r\n  /*\r\n  {\r\n    let v = u32(",12," * 0xffffffff);\r\n    let d = u32((",13,".z + .5) * 0xffffffff);\r\n\r\n    atomicMin(&",11,"[0], v);\r\n    atomicMax(&",11,"[1], v);\r\n\r\n    atomicMin(&",11,"[2], d);\r\n    atomicMax(&",11,"[3], d);\r\n  }\r\n  */\r\n\r\n  return ",C,"(",13,", ",12,");\r\n};\n"]).join(''),
  hash: 0xd54659717417f,
  table,
  shake: [[52,[0,2]],[96,[1,2]],[217,[2]]],
  tree: decompressAST([[1,0,47],[1,52,91],[1,44,91],[0,121,772],[1,0,7],[2,11,26],[2,65,73],[2,30,40],[2,88,92],[2,5,26]], table[S]),
};

const libs = {"../../wgsl/use/view": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getMotionSample = getSymbol("getMotionSample");
