/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/typeswgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getSurface getNormalMap getNormalMapSurface ../../../wgsl/use/types SurfaceFragment link color normal tangent position optional vec2<f32> export SurfaceFragment normal tangent position tangentNormal".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[O]:[{[A]:0,[N]:_(3),[S]:_([4]),[K]:[{[N]:_(4),[J]:_(4)}]}],[X]:[{[A]:55,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(4),[Z]:_([5]),[P]:[{[N]:_(6),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C},{[N]:_(7),[T]:C},{[N]:_(8),[T]:C},{[N]:_(9),[T]:C}]}},{[A]:231,[R]:_(1),[G]:6,[F]:{[N]:_(1),[T]:C,[Z]:_([10,5]),[P]:[{[N]:"uv",[T]:_(11)}]}}],[E]:[{[A]:337,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(4),[Z]:_([12]),[P]:[{[N]:_(6),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C},{[N]:_(7),[T]:C},{[N]:_(8),[T]:C},{[N]:_(9),[T]:C}],[I]:_([1,0])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "surface/normal-map.wgsl",
  code: _(["use '",3,"'::{ ",4," };\r\n\r\n@",5," fn ",0,"(\r\n  ",6,": ",C,",\r\n  uv: ",C,",\r\n  st: ",C,",\r\n  ",7,": ",C,",\r\n  ",8,": ",C,",\r\n  ",9,": ",C,",\r\n) -> ",4," {};\r\n\r\n@",10," @",5," fn ",1,"(uv: ",11,") -> ",C," { return ",C,"(0.0, 0.0, 1.0, 0.0); };\r\n\r\n@",12," fn ",1,"Surface(\r\n  ",6,": ",C,",\r\n  uv: ",C,",\r\n  st: ",C,",\r\n  ",7,": ",C,",\r\n  ",8,": ",C,",\r\n  ",9,": ",C,",\r\n) -> ",4," {\r\n\r\n  let ",8,"Normal = ",1,"(uv.xy) * 2.0 - 1.0;\r\n\r\n  let bi",8," = cross(",7,".xyz, ",8,".xyz) * ",8,".w;\r\n  let bumpNormal = ",7,"ize(\r\n    ",8,"Normal.x * ",8,".xyz +\r\n    ",8,"Normal.y * bi",8," +\r\n    ",8,"Normal.z * ",7,".xyz\r\n  );\r\n\r\n  return ",0,"(",6,", uv, st, ",C,"(bumpNormal, 1.0), ",8,", ",9,");\r\n}\n"]).join(''),
  hash: 0x183042de946d77,
  table,
  shake: [[55,[0,2]],[231,[1,2]],[337,[2]]],
  tree: decompressAST([[1,0,50],[1,55,226],[4,176,277,1],[1,0,9],[1,10,15],[2,9,21],[0,87,623],[1,0,7],[2,11,30],[2,153,168],[2,43,55],[2,253,263]], table[S]),
};

const libs = {"../../../wgsl/use/types": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getNormalMapSurface = getSymbol("getNormalMapSurface");
