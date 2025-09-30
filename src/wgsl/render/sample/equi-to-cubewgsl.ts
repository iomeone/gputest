/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getTexture getGain TAU getEquiToCubeSample optional link vec2<f32> sigma f32 export uvw return".split(' '));
const table = {[S]:_([0,1,"PI",2,3]),[W]:_([3]),[X]:[{[A]:0,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:C,[Z]:_([4,5]),[P]:[{[N]:"uv",[T]:_(6)},{[N]:_(7),[T]:_(8)}]}},{[A]:99,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:_(8),[Z]:_([4,5])}}],[E]:[{[A]:210,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:C,[Z]:_([9]),[P]:[{[N]:_(10),[T]:D},{[N]:_(7),[T]:_(8)}],[I]:_([2,"PI",0,1])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "sample/equi-to-cube.wgsl",
  code: _(["@",4," @",5," fn ",0,"(uv: ",6,", ",7,": f32) -> ",C," { ",11," ",C,"(0.0); };\r\n@",4," @",5," fn ",1,"() -> f32 { ",11," 1.0; };\r\n\r\nconst PI = 3.1415926536;\r\nconst TAU = 6.2831853072;\r\n\r\n@",9," fn ",3,"(uvw: ",D,", ",7,": f32) -> ",C," {\r\n\r\n  let phi = atan2(uvw.z, uvw.x);\r\n  let theta = atan2(uvw.y, length(uvw.xz));\r\n\r\n  let u = fract(phi / TAU);\r\n  let v = fract(-theta / PI + .5);\r\n\r\n  ",11," ",0,"(",6,"(u, v), ",7,") * ",1,"();\r\n}\n"]).join(''),
  hash: 0x197bff0d65cb91,
  table,
  shake: [[0,[0,4]],[99,[1,4]],[151,[2,4]],[179,[3,4]],[210,[4]]],
  tree: decompressAST([[4,0,96,0],[1,0,9],[1,10,15],[2,9,19],[4,80,131,1],[1,0,9],[1,10,15],[2,9,16],[0,33,61],[2,10,12],[0,18,45],[2,8,11],[0,23,307],[1,0,7],[2,11,30],[2,169,172],[2,32,34],[2,22,32],[2,37,44]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getEquiToCubeSample = getSymbol("getEquiToCubeSample");
