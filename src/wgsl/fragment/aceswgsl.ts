/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("ACES_INPUT ACES_OUTPUT RRTAndODTFit tonemapACES export color".split(' '));
const table = {[S]:_([0,1,2,3]),[W]:_([3]),[E]:[{[A]:556,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:C,[Z]:_([4]),[P]:[{[N]:_(5),[T]:C}],[I]:_([0,2,1])}}]};
const data = {
  name: "fragment/aces.wgsl",
  code: _(["// ACES fit by Stephen Hill (@self_shadow)\r\n\r\n// sRGB => XYZ => D65_2_D60 => AP1 => RRT_SAT\r\nconst ",0," = mat3x3(\r\n\t0.59719, 0.07600, 0.02840,\r\n\t0.35458, 0.90834, 0.13383,\r\n\t0.04823, 0.01566, 0.83777\r\n);\r\n\r\n// ODT_SAT => XYZ => D60_2_D65 => sRGB\r\nconst ",1," = mat3x3(\r\n   1.60475, -0.10208, -0.00327,\r\n  -0.53108,  1.10813, -0.07276,\r\n  -0.07367, -0.00605,  1.07602,\r\n);\r\n\r\nfn ",2,"(v: ",D,") -> ",D," {\r\n  let a = v * (v + 0.0245786) - 0.000090537;\r\n  let b = v * (0.983729 * v + 0.4329510) + 0.238081;\r\n  return a / b;\r\n};\r\n\r\n@",4," fn ",3,"(",5,": ",C,") -> ",C," {\r\n  var rgb = ",5,".rgb;\r\n\r\n  rgb = ",0," * rgb;\r\n  rgb = ",2,"(rgb);\r\n  rgb = ",1," * rgb;\r\n  rgb = saturate(rgb);\r\n\r\n  return ",C,"(rgb, ",5,".a);\r\n};\n"]).join(''),
  hash: 0x186417c8d05b6d,
  table,
  shake: [[0,[0,3]],[209,[1,3]],[383,[2,3]],[556,[3]]],
  tree: decompressAST([[0,0,209],[2,99,109],[0,110,284],[2,50,61],[0,124,292],[2,7,19],[0,166,394],[1,0,7],[2,11,22],[2,80,90],[2,27,39],[2,28,39]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const tonemapACES = getSymbol("tonemapACES");
