/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/geometry/normalwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("transformPosition getEpsilon getEpsilonDifferential ../../wgsl/geometry/normal getOrthoVector link position f32 optional export vector origin contravariant bool transformPosition return vector origin".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[O]:[{[A]:0,[N]:_(3),[S]:_([4]),[K]:[{[N]:_(4),[J]:_(4)}]}],[X]:[{[A]:57,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:C,[Z]:_([5]),[P]:[{[N]:_(6),[T]:C}]}},{[A]:120,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:_(7),[Z]:_([8,5])}}],[E]:[{[A]:181,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:C,[Z]:_([9]),[P]:[{[N]:_(10),[T]:C},{[N]:_(11),[T]:C},{[N]:_(12),[T]:_(13)}],[I]:_([1,0])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "transform/diff-epsilon.wgsl",
  code: _(["use '",3,"'::{ ",4," };\r\n\r\n@",5," fn ",0,"(",6,": ",C,") -> ",C,";\r\n@",8," @",5," fn ",1,"() -> f32 { ",15," 0.001; };\r\n\r\n@",9," fn ",1,"Differential(",10,": ",C,", ",11,": ",C,", ",12,": ",13,") -> ",C," {\r\n  let e = ",1,"();\r\n\r\n  if (",12,") {\r\n    let nt = ",4,"(",10,".xyz);\r\n    let nb = cross(",10,".xyz, nt);\r\n\r\n    let a = ",0,"(",11,").xyz;\r\n    let b = ",0,"(",11," + ",C,"(nt.xyz * e, 0.0)).xyz;\r\n    let c = ",0,"(",11," + ",C,"(nb.xyz * e, 0.0)).xyz;\r\n\r\n    let n = cross(b - a, c - a);\r\n    ",15," ",C,"(normalize(n), ",10,".w);\r\n  }\r\n\r\n  let a = ",0,"(",11,").xyz;\r\n  let b = ",0,"(",11," + ",C,"(",10,".xyz * e, 0.0)).xyz;\r\n\r\n  ",15," ",C,"((b - a) / e, ",10,".w);\r\n}\n"]).join(''),
  hash: 0x1c643d56de6249,
  table,
  shake: [[57,[0,2]],[120,[1,2]],[181,[2]]],
  tree: decompressAST([[1,0,52],[1,57,117],[4,63,119,1],[1,0,9],[1,10,15],[2,9,19],[0,42,727],[1,0,7],[2,11,33],[2,108,118],[2,54,68],[2,80,97],[2,44,61],[2,73,90],[2,161,178],[2,42,59]], table[S]),
};

const libs = {"../../wgsl/geometry/normal": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getEpsilonDifferential = getSymbol("getEpsilonDifferential");
