/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getTexture getLODBias getLODBiasedTexture symbols visibles symbol flags name vec4<f32> type link attr vec2<f32> bias f32 parameters func optional externals export identifiers exports linkable".split(' '));
const t = {[_(3)]:_([0,1,2]),[_(4)]:_([2]),[_(18)]:[{"at":0,[_(5)]:_(0),[_(6)]:2,[_(16)]:{[_(7)]:_(0),[_(9)]:_(8),[_(11)]:_([10]),[_(15)]:[{[_(7)]:"uv",[_(9)]:_(12)},{[_(7)]:_(13),[_(9)]:_(14)}]}},{"at":65,[_(5)]:_(1),[_(6)]:6,[_(16)]:{[_(7)]:_(1),[_(9)]:_(14),[_(11)]:_([17,10])}}],[_(21)]:[{"at":123,[_(5)]:_(2),[_(6)]:1,[_(16)]:{[_(7)]:_(2),[_(9)]:_(8),[_(11)]:_([19]),[_(15)]:[{[_(7)]:"uv",[_(9)]:_(12)}],[_(20)]:_([0,1])}}],[_(22)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "fragment/lod-bias",
  "code": _(["@",10," fn ",0,"(uv: ",12,", ",13,": f32) -> ",8," {}\r\n\r\n@",17," @",10," fn ",1,"() -> f32 { return 0.0; }\r\n\r\n@",19," fn ",1,"edTexture(uv: ",12,") -> ",8," {\r\n  return ",0,"(uv, ",1,"());\r\n};"]).join(''),
  "hash": 3188237124656174,
  "table": t,
  "shake": [[0,[0,2]],[65,[1,2]],[123,[2]]],
  "tree": decompressAST([[1,0,61],[4,65,119,1],[1,0,9],[1,10,15],[2,9,19],[0,39,142],[1,0,7],[2,11,30],[2,60,70],[2,15,25]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getLODBiasedTexture = getSymbol("getLODBiasedTexture");
