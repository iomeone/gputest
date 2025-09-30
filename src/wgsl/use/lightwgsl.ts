/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/use/typeswgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("LightUniforms lightUniforms getLightCount getLight ../../wgsl/use/types Light export count u32 lights array<Light> index group(PASS) binding(1) <storage> export lightUniforms".split(' '));
const table = {[Y]:_([0]),[S]:_([0,1,2,3]),[W]:_([0,2,3]),[O]:[{[A]:0,[N]:_(4),[S]:_([5]),[K]:[{[N]:_(5),[J]:_(5)}]}],[E]:[{[A]:42,[R]:_(0),[G]:1,[U]:{[N]:_(0),[Z]:_([6]),[M]:[{[N]:_(7),[T]:_(8)},{[N]:_(9),[T]:_(10)}]}},{[A]:191,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(8),[Z]:_([6]),[I]:_([1])}},{[A]:258,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:_(5),[Z]:_([6]),[P]:[{[N]:_(11),[T]:_(8)}],[I]:_([1])}}],[B]:[{[A]:120,[R]:_(1),[G]:32,[V]:{[N]:_(1),[T]:_(0),[Z]:_([12,13]),[I]:_([0]),[Q]:_(14)}}]};
const data = {
  name: "use/light.wgsl",
  code: _(["use '",4,"'::{ ",5," };\r\n\r\n@",6," ",U," ",0," {\r\n  ",7,": u32,\r\n  ",9,": array<",5,">,\r\n};\r\n\r\n@",12," @",13," var",14," ",1,": ",0,";\r\n\r\n@",6," fn ",2,"() -> u32 { return ",1,".",7,"; }\r\n@",6," fn ",3,"(",11,": u32) -> ",5," { return ",1,".",9,"[",11,"]; }\n"]).join(''),
  hash: 0x1aea1a043c2fa2,
  table,
  shake: [[42,[0,1,2,3]],[120,[1,2,3]],[191,[2]],[258,[3]]],
  tree: decompressAST([[1,0,37],[0,42,115],[1,0,7],[2,15,28],[2,48,53],[0,15,82],[3,0,12],[3,13,24],[2,25,38],[2,15,28],[0,18,83],[1,0,7],[2,11,24],[2,32,45],[0,24,104],[1,0,7],[2,11,19],[2,24,29],[2,15,28]], table[S]),
};

const libs = {"../../wgsl/use/types": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const LightUniforms = getSymbol("LightUniforms");
export const getLightCount = getSymbol("getLightCount");
export const getLight = getSymbol("getLight");
