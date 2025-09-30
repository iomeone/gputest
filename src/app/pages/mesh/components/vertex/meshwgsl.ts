/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../../shader/wgsl";
import m0 from "../../../../../wgsl/use/viewwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("toColorSpace VertexOutput main ../../../../../wgsl/use/view worldToClip optional link vertex instanceIndex u32 builtin(instance_index) position location(0) normal location(1) color location(2) vec2<f32> location(3) VertexOutput position location".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[O]:[{[A]:0,[N]:_(3),[S]:_([4]),[K]:[{[N]:_(4),[J]:_(4)}]}],[X]:[{[A]:56,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:C,[Z]:_([5,6]),[P]:[{[N]:"c",[T]:C}]}}],[E]:[{[A]:357,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(1),[Z]:_([7]),[P]:[{[N]:_(8),[T]:_(9),[Z]:_([10])},{[N]:_(11),[T]:C,[Z]:_([12])},{[N]:_(13),[T]:C,[Z]:_([14])},{[N]:_(15),[T]:C,[Z]:_([16])},{[N]:"uv",[T]:_(17),[Z]:_([18])}],[I]:_([1,1,0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "vertex/mesh.wgsl",
  code: _(["use '",3,"'::{ ",4," };\r\n\r\n@",5," @",6," fn ",0,"(c: ",C,") -> ",C," { return c; }\r\n\r\n",U," ",1," {\r\n  @builtin(",11,") ",11,": ",C,",\r\n  @",12," fragColor: ",C,",\r\n  @",14," fragUV: ",17,",\r\n  @",16," fragNormal: ",D,",\r\n  @",18," fragPosition: ",D,",\r\n};\r\n\r\n@",7,"\r\nfn ",2,"(\r\n  @",10," ",8,": u32,\r\n  @",12," ",11,": ",C,",\r\n  @",14," ",13,": ",C,",\r\n  @",16," ",15,": ",C,",\r\n  @",18," uv: ",17,",\r\n) -> ",1," {\r\n\r\n  var outPosition: ",C," = ",4,"(",11,");\r\n\r\n  return ",1,"(\r\n    outPosition,\r\n    ",0,"(",15,"),\r\n    uv,\r\n    ",13,".xyz,\r\n    ",11,".xyz,\r\n  );\r\n}\n"]).join(''),
  hash: 0x1666ff32c4e7b2,
  table,
  shake: [[56,[0,2]],[128,[1,2]],[357,[2]]],
  tree: decompressAST([[1,0,51],[4,56,128,0],[1,0,9],[1,10,15],[2,9,21],[0,53,277],[2,11,23],[3,18,36],[3,43,55],[3,38,50],[3,35,47],[3,39,51],[0,45,449],[3,0,7],[2,12,16],[3,9,33],[3,48,60],[3,37,49],[3,35,47],[3,34,46],[2,34,46],[2,49,60],[2,35,47],[2,37,49]], table[S]),
};

const libs = {"../../../../../wgsl/use/view": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
