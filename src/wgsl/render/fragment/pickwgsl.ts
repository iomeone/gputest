/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/mask/scissorwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("main ../../../wgsl/mask/scissor isScissored vec4<u32> location(0) fragment fragScissor fragUV vec2<f32> location(1) fragId u32 location(2) interpolate(flat) fragIndex location(3) location fragId".split(' '));
const table = {[S]:_([0]),[W]:_([0]),[O]:[{[A]:0,[N]:_(1),[S]:_([2]),[K]:[{[N]:_(2),[J]:_(2)}]}],[E]:[{[A]:55,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:{[N]:_(3),[Z]:_([4])},[Z]:_([5]),[P]:[{[N]:_(6),[T]:C,[Z]:_([4])},{[N]:_(7),[T]:_(8),[Z]:_([9])},{[N]:_(10),[T]:_(11),[Z]:_([12,13])},{[N]:_(14),[T]:_(11),[Z]:_([15,13])}]}}]};
const data = {
  name: "fragment/pick.wgsl",
  code: _(["use '",1,"':: { ",2," };\r\n\r\n@",5,"\r\nfn ",0,"(\r\n  @",4," ",6,": ",C,",\r\n  @",9," ",7,": ",8,",\r\n  @",12," @",13," ",10,": u32,\r\n  @",15," @",13," ",14,": u32,\r\n) -> @",4," ",3," {\r\n  if (",2,"(",6,")) { discard; }\r\n\r\n  if (UV_PICKING) {\r\n    let xy = vec2<u32>(clamp(",7," * 65535.0, ",8,"(0.0), ",8,"(65535.0)));\r\n    let index = xy.x | (xy.y << 16);\r\n    return ",3,"(",10,", index, 0u, 0u);\r\n  }\r\n  else {\r\n    return ",3,"(",10,", ",14,", 0u, 0u);\r\n  }\r\n}\n"]).join(''),
  hash: 0x69173b1e5ca3,
  table,
  shake: [[55,[0]]],
  tree: decompressAST([[1,0,50],[0,55,591],[3,0,9],[2,14,18],[3,9,21],[3,40,52],[3,35,47],[3,13,31],[3,35,47],[3,13,31],[3,41,53],[2,32,43]], table[S]),
};

const libs = {"../../../wgsl/mask/scissor": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
