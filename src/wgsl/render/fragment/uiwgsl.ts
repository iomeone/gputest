/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getFragment main link fragUV vec2<f32> fragTextureUV fragTextureST fragSDFUV fragSDFConfig fragRepeat i32 fragMode fragShape fragRadius fragBorder fragStroke fragFill location(0) fragment location(1) location(2) fragClipUV location(3) location(4) location(5) interpolate(flat) location(6) location(7) location(8) location(9) location(10) location(11) location(12) fragUV fragTextureUV fragTextureST fragSDFUV fragSDFConfig fragRepeat fragMode fragShape fragRadius fragBorder fragStroke fragFill location interpolate".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:C,[Z]:_([2]),[P]:[{[N]:_(3),[T]:_(4)},{[N]:_(5),[T]:_(4)},{[N]:_(6),[T]:_(4)},{[N]:_(7),[T]:_(4)},{[N]:_(8),[T]:C},{[N]:_(9),[T]:_(10)},{[N]:_(11),[T]:_(10)},{[N]:_(12),[T]:C},{[N]:_(13),[T]:C},{[N]:_(14),[T]:C},{[N]:_(15),[T]:C},{[N]:_(16),[T]:C}]}}],[E]:[{[A]:344,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:{[N]:C,[Z]:_([17])},[Z]:_([18]),[P]:[{[N]:_(3),[T]:_(4),[Z]:_([17])},{[N]:_(5),[T]:_(4),[Z]:_([19])},{[N]:_(6),[T]:_(4),[Z]:_([20])},{[N]:_(21),[T]:C,[Z]:_([22])},{[N]:_(7),[T]:_(4),[Z]:_([23])},{[N]:_(8),[T]:C,[Z]:_([24,25])},{[N]:_(9),[T]:_(10),[Z]:_([26,25])},{[N]:_(11),[T]:_(10),[Z]:_([27,25])},{[N]:_(12),[T]:C,[Z]:_([28,25])},{[N]:_(13),[T]:C,[Z]:_([29,25])},{[N]:_(14),[T]:C,[Z]:_([30,25])},{[N]:_(15),[T]:C,[Z]:_([31,25])},{[N]:_(16),[T]:C,[Z]:_([32,25])}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "fragment/ui.wgsl",
  code: _(["@",2," fn ",0,"(\r\n  ",3,": ",4,",\r\n  ",5,": ",4,",\r\n  ",6,": ",4,",\r\n  ",7,": ",4,",\r\n  ",8,": ",C,",\r\n  ",9,": i32,\r\n  ",11,": i32,\r\n  ",12,": ",C,",\r\n  ",13,": ",C,",\r\n  ",14,": ",C,",\r\n  ",15,": ",C,",\r\n  ",16,": ",C,",\r\n) -> ",C," {};\r\n\r\n@",18,"\r\nfn ",1,"(\r\n  @",17,"                     ",3,": ",4,",\r\n  @",19,"                     ",5,": ",4,",\r\n  @",20,"                     ",6,": ",4,",\r\n  @",22,"                     ",21,": ",C,",\r\n  @",23,"                     ",7,": ",4,",\r\n  @",24,"  @",25," ",8,": ",C,",\r\n  @",26,"  @",25," ",9,": i32,\r\n  @",27,"  @",25," ",11,": i32,\r\n  @",28,"  @",25," ",12,": ",C,",\r\n  @",29,"  @",25," ",13,": ",C,",\r\n  @",30," @",25," ",14,": ",C,",\r\n  @",31," @",25," ",15,": ",C,",\r\n  @",32," @",25," ",16,": ",C,",\r\n) -> @",17," ",C," {\r\n\r\n  return ",0,"(\r\n    ",3,",\r\n    ",5,",\r\n    ",6,",\r\n    ",21,",\r\n    ",7,",\r\n    ",8,",\r\n    ",9,",\r\n    ",11,",\r\n    ",12,",\r\n    ",13,",\r\n    ",14,",\r\n    ",15,",\r\n    ",16,",\r\n  );\r\n}\n"]).join(''),
  hash: 0x142adf27a60dc8,
  table,
  shake: [[0,[0,1]],[344,[1]]],
  tree: decompressAST([[1,0,339],[0,344,1402],[3,0,9],[2,14,18],[3,9,21],[3,55,67],[3,62,74],[3,62,74],[3,59,71],[3,58,70],[3,14,32],[3,48,60],[3,14,32],[3,39,51],[3,14,32],[3,37,49],[3,14,32],[3,44,56],[3,14,32],[3,45,58],[3,14,32],[3,45,58],[3,14,32],[3,45,58],[3,14,32],[3,46,58],[2,37,48]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
