/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../wgsl/use/typeswgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getMaterial getMaterialSurface ../../../wgsl/use/types SurfaceFragment infer(T) link color mapUV mapST export normal tangent position SurfaceFragment params".split(' '));
const table = {[S]:_(["T",0,1]),[W]:_([1]),[O]:[{[A]:0,[N]:_(2),[S]:_([3]),[K]:[{[N]:_(3),[J]:_(3)}]}],[X]:[{[A]:75,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:{[N]:"T",[Z]:_([4])},[Z]:_([5]),[P]:[{[N]:_(6),[T]:C},{[N]:_(7),[T]:C},{[N]:_(8),[T]:C}],[I]:_(["T"]),[H]:[{[N]:"T",[A]:-1}]}}],[E]:[{[A]:184,[R]:_(1),[G]:1,[F]:{[N]:_(1),[T]:_(3),[Z]:_([9]),[P]:[{[N]:_(6),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C},{[N]:_(10),[T]:C},{[N]:_(11),[T]:C},{[N]:_(12),[T]:C}],[I]:_([0])}}],[L]:{[_(0)]:true}};
const data = {
  name: "surface/material.wgsl",
  code: _(["use '",2,"'::{ ",3," };\r\n\r\n@infer ",T," T = T;\r\n@",5," fn ",0,"(\r\n  ",6,": ",C,",\r\n  ",7,": ",C,",\r\n  ",8,": ",C,",\r\n) -> @",4," T {}\r\n\r\n@",9," fn ",0,"Surface(\r\n  ",6,": ",C,",\r\n  uv: ",C,",\r\n  st: ",C,",\r\n  ",10,": ",C,",\r\n  ",11,": ",C,",\r\n  ",12,": ",C,",\r\n) -> ",3," {\r\n\r\n  let ",14," = ",0,"(",6,", uv, st);\r\n\r\n  return ",3,"(\r\n    ",12,",\r\n    ",10,",\r\n    ",14,".albedo,\r\n    ",14,".emissive,\r\n    ",14,".material,\r\n    ",14,".occlusion,\r\n    0.0,\r\n  );\r\n}\n"]).join(''),
  hash: 0x19552c4150ae82,
  table,
  shake: [[55,[0,1,2]],[75,[1,2]],[184,[2]]],
  tree: decompressAST([[1,0,50],[1,55,73],[1,20,125],[0,109,498],[1,0,7],[2,11,29],[2,152,167],[2,36,47],[2,40,55]], table[S]),
};

const libs = {"../../../wgsl/use/types": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getMaterialSurface = getSymbol("getMaterialSurface");
