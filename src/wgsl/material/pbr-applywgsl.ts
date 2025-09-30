/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
import m0 from "../../wgsl/fragment/pbrwgsl";
import m1 from "../../wgsl/use/typeswgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("applyPBRMaterial ../../wgsl/fragment/pbr PBR ../../wgsl/use/types SurfaceFragment export surface surface".split(' '));
const table = {[S]:_([0]),[W]:_([0]),[O]:[{[A]:0,[N]:_(1),[S]:_([2]),[K]:[{[N]:_(2),[J]:_(2)}]},{[A]:0,[N]:_(3),[S]:_([4]),[K]:[{[N]:_(4),[J]:_(4)}]}],[E]:[{[A]:93,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:D,[Z]:_([5]),[P]:[{[N]:"N",[T]:D},{[N]:"L",[T]:D},{[N]:"V",[T]:D},{[N]:_(6),[T]:_(4)}]}}]};
const data = {
  name: "material/pbr-apply.wgsl",
  code: _(["use '",1,"'::{ PBR };\r\nuse '",3,"'::{ ",4," };\r\n\r\n@",5," fn ",0,"(\r\n  N: ",D,",\r\n  L: ",D,",\r\n  V: ",D,",\r\n  ",6,": ",4,",\r\n) -> ",D," {\r\n  return PBR(N, L, V, ",6,".albedo.xyz, ",6,".material.x, ",6,".material.y);\r\n}\n"]).join(''),
  hash: 0x1a621750b356db,
  table,
  shake: [[93,[0]]],
  tree: decompressAST([[1,0,38],[1,41,88],[0,52,265],[1,0,7],[2,11,27],[2,81,96],[2,45,48]], table[S]),
};

const libs = {"../../wgsl/fragment/pbr": m0, "../../wgsl/use/types": m1};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const applyPBRMaterial = getSymbol("applyPBRMaterial");
