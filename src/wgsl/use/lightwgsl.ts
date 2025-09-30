/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/use/typeswgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("LightUniforms lightUniforms getLightCount getLight ../../wgsl/use/types Light u32 export index group(PASS) binding(0) <storage> lightUniforms".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([2,3]),[O]:[{[A]:0,[N]:_(4),[S]:_([5]),[K]:[{[N]:_(5),[J]:_(5)}]}],[E]:[{[A]:183,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(6),[Z]:_([7]),[I]:_([1])}},{[A]:250,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(5),[Z]:_([7]),[P]:[{[N]:_(8),[T]:_(6)}],[I]:_([1])}}],[B]:[{[A]:112,[R]:_(1),[G]:32,[V]:{[N]:_(1),[T]:_(0),[Z]:_([9,10]),[I]:_([0]),[Q]:_(11)}}]};
const data = {
  name: "use/light.wgsl",
  code: _(["use '",4,"'::{ ",5," };\r\n\r\n",U," ",0," {\r\n  count: u32,\r\n  lights: array<",5,">,\r\n};\r\n\r\n@",9," @",10," var",11," ",1,": ",0,";\r\n\r\n@",7," fn ",2,"() -> u32 { return ",1,".count; }\r\n@",7," fn ",3,"(",8,": u32) -> ",5," { return ",1,".lights[",8,"]; }\n"]).join(''),
  hash: 0x1bbc02c17667cf,
  table,
  shake: [[38,[0,1,2,3]],[112,[1,2,3]],[183,[2]],[250,[3]]],
  tree: decompressAST([[1,0,37],[0,38,107],[2,11,24],[2,48,53],[0,15,82],[3,0,12],[3,13,24],[2,25,38],[2,15,28],[0,18,83],[1,0,7],[2,11,24],[2,32,45],[0,24,104],[1,0,7],[2,11,19],[2,24,29],[2,15,28]], table[S]),
};

const libs = {"../../wgsl/use/types": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getLightCount = getSymbol("getLightCount");
export const getLight = getSymbol("getLight");
