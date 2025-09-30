/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../../shader/wgsl";
import m0 from "../../../../../wgsl/use/viewwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("VertexOutput main ../../../../../wgsl/use/view worldToClip vertex instanceIndex u32 builtin(instance_index) position location(0) normal location(1) color location(2) vec2<f32> location(3) VertexOutput position location fragIndex".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[O]:[{[A]:0,[N]:_(2),[S]:_([3]),[K]:[{[N]:_(3),[J]:_(3)}]}],[E]:[{[A]:302,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(0),[Z]:_([4]),[P]:[{[N]:_(5),[T]:_(6),[Z]:_([7])},{[N]:_(8),[T]:C,[Z]:_([9])},{[N]:_(10),[T]:C,[Z]:_([11])},{[N]:_(12),[T]:C,[Z]:_([13])},{[N]:"uv",[T]:_(14),[Z]:_([15])}],[I]:_([0,0])}}]};
const data = {
  name: "vertex/mesh-pick.wgsl",
  code: _(["use '",2,"'::{ ",3," };\r\n\r\n",U," ",0," {\r\n  @builtin(",8,") ",8,": ",C,",\r\n  @",9," fragScissor: ",C,",\r\n  @",11," fragUV: ",14,",\r\n  @",13," @interpolate(flat) fragId: u32,\r\n  @",15," @interpolate(flat) ",19,": u32,\r\n};\r\n\r\n@",4,"\r\nfn ",1,"(\r\n  @",7," ",5,": u32,\r\n  @",9," ",8,": ",C,",\r\n  @",11," ",10,": ",C,",\r\n  @",13," ",12,": ",C,",\r\n  @",15," uv: ",14,",\r\n) -> ",0," {\r\n\r\n  var outPosition: ",C," = ",3,"(",8,");\r\n  var ",19," = u32(",5,");\r\n\r\n  return ",0,"(\r\n    outPosition,\r\n    ",C,"(0.0),\r\n    ",14,"(0.0),\r\n    u32(PICKING_ID),\r\n    ",19,",\r\n  );\r\n}\n"]).join(''),
  hash: 0x1d8292b3c014c5,
  table,
  shake: [[52,[0,1]],[302,[1]]],
  tree: decompressAST([[1,0,51],[0,52,297],[2,11,23],[3,18,36],[3,43,55],[3,40,52],[3,35,47],[3,13,31],[3,35,47],[3,13,31],[0,42,494],[3,0,7],[2,12,16],[3,9,33],[3,48,60],[3,37,49],[3,35,47],[3,34,46],[2,34,46],[2,49,60],[2,74,86]], table[S]),
};

const libs = {"../../../../../wgsl/use/view": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
