/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getColor getColorMap getBasicMaterial optional link vec2<f32> export inColor mapUV mapST return".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[X]:[{[A]:0,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:C,[Z]:_([3,4])}},{[A]:86,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:C,[Z]:_([3,4]),[P]:[{[N]:"uv",[T]:_(5)}]}}],[E]:[{[A]:175,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:C,[Z]:_([6]),[P]:[{[N]:_(7),[T]:C},{[N]:_(8),[T]:C},{[N]:_(9),[T]:C}],[I]:_([0,1])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "material/basic-material.wgsl",
  code: _(["@",3," @",4," fn ",0,"() -> ",C," { ",10," ",C,"(1.0, 1.0, 1.0, 1.0); }\r\n@",3," @",4," fn ",0,"Map(uv: ",5,") -> ",C," { ",10," ",C,"(0.0); }\r\n\r\n@",6," fn ",2,"(\r\n  ",7,": ",C,",\r\n  ",8,": ",C,",\r\n  ",9,": ",C,",\r\n) -> ",C," {\r\n  var color: ",C," = ",7," * ",0,"();\r\n\r\n  if (HAS_COLOR_MAP) {\r\n    color *= ",0,"Map(",8,".xy);\r\n  }\r\n\r\n  ",10," color;\r\n}\n"]).join(''),
  hash: 0x70494b565b81b,
  table,
  shake: [[0,[0,2]],[86,[1,2]],[175,[2]]],
  tree: decompressAST([[4,0,84,0],[1,0,9],[1,10,15],[2,9,17],[4,67,152,1],[1,0,9],[1,10,15],[2,9,20],[0,70,319],[1,0,7],[2,11,27],[2,137,145],[2,52,63]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getBasicMaterial = getSymbol("getBasicMaterial");
