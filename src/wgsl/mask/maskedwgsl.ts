/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getMask getMaskedColor getMaskedSurface f32 optional link vec2<f32> export color normal tangent position coord getMask return".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([1,2]),[X]:[{[A]:0,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:_(3),[Z]:_([4,5]),[P]:[{[N]:"uv",[T]:_(6)}]}}],[E]:[{[A]:69,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:C,[Z]:_([7]),[P]:[{[N]:_(8),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C}],[I]:_([0])}},{[A]:249,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:C,[Z]:_([7]),[P]:[{[N]:_(8),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C},{[N]:_(9),[T]:C},{[N]:_(10),[T]:C},{[N]:_(11),[T]:C},{[N]:_(12),[T]:C}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "mask/masked.wgsl",
  code: _(["@",4," @",5," fn ",0,"(uv: ",6,") -> f32 { ",14," 1.0; };\r\n\r\n@",7," fn ",0,"edColor(\r\n  ",8,": ",C,",\r\n  uv: ",C,",\r\n  st: ",C,",\r\n) -> ",C," {\r\n  let m = ",0,"(uv.xy);\r\n  ",14," ",C,"(",8,".xyz, ",8,".a * m);\r\n}\r\n\r\n@",7," fn ",0,"edSurface(\r\n  ",8,": ",C,",\r\n  uv: ",C,",\r\n  st: ",C,",\r\n  ",9,": ",C,",\r\n  ",10,": ",C,",\r\n  ",11,": ",C,",\r\n  ",12,": ",C,",\r\n) -> ",C," {\r\n  let m = ",0,"(uv.xy);\r\n  ",14," ",C,"(",8,".xyz, ",8,".a * m);\r\n}\n"]).join(''),
  hash: 0x1ab01bec8c11a0,
  table,
  shake: [[0,[0,1,2]],[69,[1]],[249,[2]]],
  tree: decompressAST([[4,0,64,0],[1,0,9],[1,10,15],[2,9,16],[0,50,226],[1,0,7],[2,11,25],[2,102,109],[0,67,335],[1,0,7],[2,11,27],[2,194,201]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getMaskedColor = getSymbol("getMaskedColor");
export const getMaskedSurface = getSymbol("getMaskedSurface");
