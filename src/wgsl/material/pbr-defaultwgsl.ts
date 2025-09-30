/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/fragment/pbrwgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("roughness metalness getDefaultPBRMaterial ../../wgsl/fragment/pbr PBRParams export color mapUV mapST PBRParams".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[O]:[{[A]:0,[N]:_(3),[S]:_([4]),[K]:[{[N]:_(4),[J]:_(4)}]}],[E]:[{[A]:110,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(4),[Z]:_([5]),[P]:[{[N]:_(6),[T]:C},{[N]:_(7),[T]:C},{[N]:_(8),[T]:C}],[I]:_([1,0])}}]};
const data = {
  name: "material/pbr-default.wgsl",
  code: _(["use '",3,"'::{ ",4," };\r\n\r\nconst ",0,": f32 = 0.35;\r\nconst ",1,": f32 = 0.0;\r\n\r\n@",5," fn ",2,"(\r\n  ",6,": ",C,",\r\n  ",7,": ",C,",\r\n  ",8,": ",C,",\r\n) -> ",4," {\r\n  var albedo = ",6,";\r\n  var emissive = ",C,"(0.0);\r\n  var material = ",C,"(",1,", ",0,", 0.0, 0.0);\r\n\r\n  return ",4,"(albedo, emissive, material, 1.0);\r\n}\n"]).join(''),
  hash: 0x1870f8f3978d9d,
  table,
  shake: [[45,[0,2]],[77,[1,2]],[110,[2]]],
  tree: decompressAST([[1,0,44],[0,45,77],[2,10,19],[0,22,51],[2,8,17],[0,25,316],[1,0,7],[2,11,32],[2,92,101],[2,97,106],[2,11,20],[2,34,43]], table[S]),
};

const libs = {"../../wgsl/fragment/pbr": m0};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getDefaultPBRMaterial = getSymbol("getDefaultPBRMaterial");
