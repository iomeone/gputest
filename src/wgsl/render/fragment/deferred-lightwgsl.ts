/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/viewwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getFragment main ../../../wgsl/use/view getViewResolution link vec2<f32> location(0) fragment fragCoord builtin(position) lightIndex u32 interpolate(flat)".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[O]:[{[A]:0,[N]:_(2),[S]:_([3]),[K]:[{[N]:_(3),[J]:_(3)}]}],[X]:[{[A]:57,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:C,[Z]:_([4]),[P]:[{[N]:"uv",[T]:_(5)}]}}],[E]:[{[A]:110,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:{[N]:C,[Z]:_([6])},[Z]:_([7]),[P]:[{[N]:_(8),[T]:C,[Z]:_([9])},{[N]:_(10),[T]:_(11),[Z]:_([6,12])}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "fragment/deferred-light.wgsl",
  code: _(["use '",2,"':: { ",3," };\r\n\r\n@",4," fn ",0,"(uv: ",5,") -> ",C,";\r\n\r\n@",7,"\r\nfn ",1,"(\r\n  @",9," ",8,": ",C,",\r\n  @",6," @",12," ",10,": u32,\r\n) -> @",6," ",C," {\r\n\r\n  var uv = ",5,"(",8,".xy) * ",3,"();\r\n  var outColor = ",0,"(uv, ",10,");\r\n\r\n  return ",C,"(outColor.rgb, 1.0);\r\n}\n"]).join(''),
  hash: 0x16d6f8c4ea2fb4,
  table,
  shake: [[57,[0,1]],[110,[1]]],
  tree: decompressAST([[1,0,52],[1,57,105],[0,53,352],[3,0,9],[2,14,18],[3,9,27],[3,44,56],[3,13,31],[3,42,54],[2,65,82],[2,39,50]], table[S]),
};

const libs = {"../../../wgsl/use/view": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
