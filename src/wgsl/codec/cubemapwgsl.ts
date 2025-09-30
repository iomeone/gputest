/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("XYLayer encodeCubeMap export uvw vec2<f32> layer u32 locals XYLayer absUVW maxAUVW faceXY select".split(' '));
const table = {[S]:_([0,1]),[W]:_([1]),[E]:[{[A]:89,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(0),[Z]:_([2]),[P]:[{[N]:_(3),[T]:D}],[I]:_([0,0])}}],[_(7)]:[{[A]:0,[R]:_(0),[G]:0,[U]:{[N]:_(0),[M]:[{[N]:"xy",[T]:_(4)},{[N]:_(5),[T]:_(6)}]}}]};
const data = {
  name: "codec/cubemap.wgsl",
  code: _([U," ",0," {\r\n  xy: ",4,",\r\n  ",5,": u32,\r\n};\r\n\r\n// Map UVW -> Cube face # + XY\r\n@",2," fn ",1,"(uvw: ",D,") -> ",0," {\r\n  let ",9," = abs(uvw);\r\n  let ",10," = max(",9,".x, max(",9,".y, ",9,".z));\r\n\r\n  var face: u32;\r\n  var ",11,": ",4,";\r\n  if (",10," == ",9,".x) {\r\n    face = ",12,"(0u, 1u, uvw.x < 0.0);\r\n    ",11," = ",12,"(\r\n      ",4,"(-uvw.z, -uvw.y),\r\n      ",4,"(uvw.z, -uvw.y),\r\n      uvw.x < 0.0\r\n    );\r\n  }\r\n  else if (",10," == ",9,".y) {\r\n    face = ",12,"(2u, 3u, uvw.y < 0.0);\r\n    ",11," = ",12,"(\r\n      ",4,"(uvw.x, uvw.z),\r\n      ",4,"(uvw.x, -uvw.z),\r\n      uvw.y < 0.0\r\n    );\r\n  }\r\n  else {\r\n    face = ",12,"(4u, 5u, uvw.z < 0.0);\r\n    ",11," = ",12,"(\r\n      ",4,"(uvw.x, -uvw.y),\r\n      ",4,"(-uvw.x, -uvw.y),\r\n      uvw.z < 0.0\r\n    );\r\n  }\r\n\r\n  return ",0,"(",11," / ",10,", face);\r\n};\n"]).join(''),
  hash: 0x1de49eaf56ac3a,
  table,
  shake: [[0,[0,1]],[89,[1]]],
  tree: decompressAST([[0,0,52],[2,7,14],[0,82,871],[1,0,7],[2,11,24],[2,33,40],[2,710,717]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const encodeCubeMap = getSymbol("encodeCubeMap");
