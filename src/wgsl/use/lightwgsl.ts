/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/use/typeswgsl";
const {} = symbolDictionary;
const _ = decompressString("LightUniforms lightUniforms getLightCount getLight symbols visibles ../../wgsl/use/types name Light imported imports modules symbol flags u32 type export attr identifiers func index parameters exports group(PASS) binding(0) <storage> qual variable bindings lightUniforms".split(' '));
const t = {[_(4)]:_([0,1,2,3]),[_(5)]:_([2,3]),[_(11)]:[{"at":0,[_(7)]:_(6),[_(4)]:_([8]),[_(10)]:[{[_(7)]:_(8),[_(9)]:_(8)}]}],[_(22)]:[{"at":183,[_(12)]:_(2),[_(13)]:1,[_(19)]:{[_(7)]:_(2),[_(15)]:_(14),[_(17)]:_([16]),[_(18)]:_([1])}},{"at":250,[_(12)]:_(3),[_(13)]:1,[_(19)]:{[_(7)]:_(3),[_(15)]:_(8),[_(17)]:_([16]),[_(21)]:[{[_(7)]:_(20),[_(15)]:_(14)}],[_(18)]:_([1])}}],[_(28)]:[{"at":112,[_(12)]:_(1),[_(13)]:32,[_(27)]:{[_(7)]:_(1),[_(15)]:_(0),[_(17)]:_([23,24]),[_(18)]:_([0]),[_(26)]:_(25)}}]};
const data = {
  "name": "use/light",
  "code": _(["use '",6,"'::{ ",8," };\r\n\r\nstruct ",0," {\r\n  count: u32,\r\n  lights: array<",8,">,\r\n};\r\n\r\n@",23," @",24," var",25," ",1,": ",0,";\r\n\r\n@",16," fn ",2,"() -> u32 { return ",1,".count; }\r\n@",16," fn ",3,"(",20,": u32) -> ",8," { return ",1,".lights[",20,"]; }"]).join(''),
  "hash": 6718737257360622,
  "table": t,
  "shake": [[38,[0,1,2,3]],[112,[1,2,3]],[183,[2]],[250,[3]]],
  "tree": decompressAST([[1,0,37],[0,38,107],[2,11,24],[2,48,53],[0,15,82],[3,0,12],[3,13,24],[2,25,38],[2,15,28],[0,18,83],[1,0,7],[2,11,24],[2,32,45],[0,24,104],[1,0,7],[2,11,19],[2,24,29],[2,15,28]], t[S]),
};
const libs = {"../../wgsl/use/types": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getLightCount = getSymbol("getLightCount");
export const getLight = getSymbol("getLight");
