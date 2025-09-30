/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getTransformMatrix getSphericalBend getSphericalFocus getSphericalAspectX getSphericalAspectY getSphericalScaleY getSphericalPosition mat4x4<f32> link f32 optional export position optional return position sphericalBend sphericalFocus sphericalAspectX sphericalAspectY matrix radius cosine".split(' '));
const table = {[S]:_([0,1,2,3,4,5,6]),[W]:_([6]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(7),[Z]:_([8])}},{[A]:49,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:_(9),[Z]:_([10,8])}},{[A]:112,[R]:_(2),[G]:6,[F]:{[N]:_(2),[T]:_(9),[Z]:_([10,8])}},{[A]:176,[R]:_(3),[G]:6,[F]:{[N]:_(3),[T]:_(9),[Z]:_([10,8])}},{[A]:242,[R]:_(4),[G]:6,[F]:{[N]:_(4),[T]:_(9),[Z]:_([10,8])}},{[A]:308,[R]:_(5),[G]:6,[F]:{[N]:_(5),[T]:_(9),[Z]:_([10,8])}}],[E]:[{[A]:375,[R]:_(6),[G]:1,[F]:{[N]:_(6),[T]:C,[Z]:_([11]),[P]:[{[N]:_(12),[T]:C}],[I]:_([1,2,3,4,5,0])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true,[_(4)]:true,[_(5)]:true}};
const data = {
  name: "transform/spherical.wgsl",
  code: _(["@",8," fn ",0,"() -> ",7,";\r\n\r\n@",10," @",8," fn ",1,"() -> f32 { ",14," 0.0; };\r\n@",10," @",8," fn ",2,"() -> f32 { ",14," 0.0; };\r\n@",10," @",8," fn ",3,"() -> f32 { ",14," 1.0; };\r\n@",10," @",8," fn ",4,"() -> f32 { ",14," 1.0; };\r\n@",10," @",8," fn ",5,"() -> f32 { ",14," 0.0; };\r\n\r\n@",11," fn ",6,"(",12,": ",C,") -> ",C," {\r\n  let ",16," = ",1,"();\r\n  let ",17," = ",2,"();\r\n  let ",18," = ",3,"();\r\n  let ",19," = ",4,"();\r\n  let sphericalScaleY = ",5,"();\r\n\r\n  let ",20," = ",0,"();\r\n\r\n  if (",16," > 0.0001) {\r\n    let xyz = ",12,".xyz * ",D,"(",16,", ",16," / ",19," * sphericalScaleY, ",18,");\r\n    let ",21," = ",17," + xyz.z;\r\n    let ",22," = cos(xyz.y) * ",21,";\r\n\r\n    ",14," ",20," * ",C,"(\r\n      sin(xyz.x) * ",22,",\r\n      sin(xyz.y) * ",21," * ",19,",\r\n      (cos(xyz.x) * ",22," - ",17,") / ",18,",\r\n      1.0\r\n    );\r\n  }\r\n  ",14," ",20," * ",C,"(",12,".xyz, 1.0);\r\n}\n"]).join(''),
  hash: 0x432710aa15184,
  table,
  shake: [[0,[0,6]],[49,[1,6]],[112,[2,6]],[176,[3,6]],[242,[4,6]],[308,[5,6]],[375,[6]]],
  tree: decompressAST([[1,0,44],[4,49,109,1],[1,0,9],[1,10,15],[2,9,25],[4,44,105,2],[1,0,9],[1,10,15],[2,9,26],[4,45,108,3],[1,0,9],[1,10,15],[2,9,28],[4,47,110,4],[1,0,9],[1,10,15],[2,9,28],[4,47,109,5],[1,0,9],[1,10,15],[2,9,27],[0,48,881],[1,0,7],[2,11,31],[2,80,96],[2,44,61],[2,47,66],[2,49,68],[2,48,66],[2,40,58]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getSphericalPosition = getSymbol("getSphericalPosition");
