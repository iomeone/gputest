/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
import m0 from "../../wgsl/codec/octahedralwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("encodeNormal16 decodeNormal16 encodeNormal16Plus NormalIndex decodeNormal16Plus octaToNormal16 octaToNormal ../../wgsl/codec/octahedral encodeOctahedral decodeOctahedral vec4<u32> export normal n16 index u32 octa locals encodeOctahedral decodeOctahedral export normal return NormalIndex".split(' '));
const table = {[S]:_([0,1,2,3,4,5,6]),[W]:_([0,1,2,4,5,6]),[O]:[{[A]:0,[N]:_(7),[S]:_([8,9]),[K]:[{[N]:_(8),[J]:_(8)},{[N]:_(9),[J]:_(9)}]}],[E]:[{[A]:78,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:_(10),[Z]:_([11]),[P]:[{[N]:_(12),[T]:D}]}},{[A]:242,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:D,[Z]:_([11]),[P]:[{[N]:_(13),[T]:_(10)}]}},{[A]:388,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(10),[Z]:_([11]),[P]:[{[N]:_(12),[T]:D},{[N]:_(14),[T]:_(15)}]}},{[A]:680,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:_(3),[Z]:_([11]),[P]:[{[N]:_(13),[T]:_(10)}],[I]:_([3,3])}},{[A]:889,[R]:_(5),[G]:1,[F]:{[N]:_(5),[T]:_(10),[Z]:_([11]),[P]:[{[N]:_(16),[T]:C}]}},{[A]:1020,[R]:_(6),[G]:1,[F]:{[N]:_(6),[T]:D,[Z]:_([11]),[P]:[{[N]:_(16),[T]:C}]}}],[_(17)]:[{[A]:611,[R]:_(3),[G]:0,[U]:{[N]:_(3),[M]:[{[N]:_(12),[T]:D},{[N]:_(14),[T]:_(15)}]}}]};
const data = {
  name: "codec/normal16.wgsl",
  code: _(["use '",7,"'::{ ",8,", ",9," };\r\n\r\n@",11," fn ",0,"(",12,": ",D,") -> ",10," {\r\n  let xy = ",8,"(",12,") * .5 + .5;\r\n  ",22," ",10,"(vec2<u32>(xy * 255.0), 0, 0);\r\n}\r\n\r\n@",11," fn ",1,"(n16: ",10,") -> ",D," {\r\n  let xy = vec2<f32>(n16.xy) / 255.0;\r\n  ",22," ",9,"(xy * 2.0 - 1.0);\r\n}\r\n\r\n@",11," fn ",0,"Plus(",12,": ",D,", ",14,": u32) -> ",10," {\r\n  let xy = ",8,"(",12,") * .5 + .5;\r\n  let zw = vec2<u32>(",14," >> 8, ",14," & 0xFF);\r\n  ",22," ",10,"(vec2<u32>(xy * 255.0), zw);\r\n}\r\n\r\n",U," ",3," {\r\n  ",12,": ",D,",\r\n  ",14,": u32,\r\n};\r\n\r\n@",11," fn ",1,"Plus(n16: ",10,") -> ",3," {\r\n  let xy = vec2<f32>(n16.xy) / 255.0;\r\n  let ",14," = (n16.z << 8) | n16.w;\r\n  ",22," ",3,"(",9,"(xy * 2.0 - 1.0), ",14,");\r\n}\r\n\r\n@",11," fn ",5,"(",16,": ",C,") -> ",10," {\r\n  ",22," ",10,"(vec2<u32>((",16,".xy * .5 + .5) * 255.0), 0, 0);\r\n}\r\n\r\n@",11," fn ",6,"(",16,": ",C,") -> ",D," {\r\n  ",22," ",9,"(",16,".xy);\r\n}\n"]).join(''),
  hash: 0x77fcd984a380c,
  table,
  shake: [[78,[0]],[242,[1]],[388,[2]],[611,[3,4]],[680,[4]],[889,[5]],[1020,[6]]],
  tree: decompressAST([[1,0,73],[0,78,238],[1,0,7],[2,11,25],[2,61,77],[0,92,234],[1,0,7],[2,11,25],[2,95,111],[0,40,263],[1,0,7],[2,11,29],[2,77,93],[0,135,199],[2,11,22],[0,58,263],[1,0,7],[2,11,29],[2,38,49],[2,100,111],[2,12,28],[0,48,175],[1,0,7],[2,11,25],[0,120,215],[1,0,7],[2,11,23],[2,55,71]], table[S]),
};

const libs = {"../../wgsl/codec/octahedral": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const encodeNormal16 = getSymbol("encodeNormal16");
export const decodeNormal16 = getSymbol("decodeNormal16");
export const encodeNormal16Plus = getSymbol("encodeNormal16Plus");
export const decodeNormal16Plus = getSymbol("decodeNormal16Plus");
export const octaToNormal16 = getSymbol("octaToNormal16");
export const octaToNormal = getSymbol("octaToNormal");
