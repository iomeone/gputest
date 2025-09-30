/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getTexture getGain TAU getEquiToCubeSample symbols visibles symbol flags name vec4<f32> type optional link attr vec2<f32> sigma f32 parameters func externals export uvw vec3<f32> identifiers exports linkable return".split(' '));
const t = {[_(4)]:_([0,1,"PI",2,3]),[_(5)]:_([3]),[_(19)]:[{"at":0,[_(6)]:_(0),[_(7)]:6,[_(18)]:{[_(8)]:_(0),[_(10)]:_(9),[_(13)]:_([11,12]),[_(17)]:[{[_(8)]:"uv",[_(10)]:_(14)},{[_(8)]:_(15),[_(10)]:_(16)}]}},{"at":99,[_(6)]:_(1),[_(7)]:6,[_(18)]:{[_(8)]:_(1),[_(10)]:_(16),[_(13)]:_([11,12])}}],[_(24)]:[{"at":210,[_(6)]:_(3),[_(7)]:1,[_(18)]:{[_(8)]:_(3),[_(10)]:_(9),[_(13)]:_([20]),[_(17)]:[{[_(8)]:_(21),[_(10)]:_(22)},{[_(8)]:_(15),[_(10)]:_(16)}],[_(23)]:_([2,"PI",0,1])}}],[_(25)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "sample/equi-to-cube",
  "code": _(["@",11," @",12," fn ",0,"(uv: ",14,", ",15,": f32) -> ",9," { ",26," ",9,"(0.0); };\r\n@",11," @",12," fn ",1,"() -> f32 { ",26," 1.0; };\r\n\r\nconst PI = 3.1415926536;\r\nconst TAU = 6.2831853072;\r\n\r\n@",20," fn ",3,"(uvw: ",22,", ",15,": f32) -> ",9," {\r\n\r\n  let phi = atan2(uvw.z, uvw.x);\r\n  let theta = atan2(uvw.y, length(uvw.xz));\r\n\r\n  let u = fract(phi / TAU);\r\n  let v = fract(-theta / PI + .5);\r\n\r\n  ",26," ",0,"(",14,"(u, v), ",15,") * ",1,"();\r\n}"]).join(''),
  "hash": 8291168168191602,
  "table": t,
  "shake": [[0,[0,4]],[99,[1,4]],[151,[2,4]],[179,[3,4]],[210,[4]]],
  "tree": decompressAST([[4,0,96,0],[1,0,9],[1,10,15],[2,9,19],[4,80,131,1],[1,0,9],[1,10,15],[2,9,16],[0,33,61],[2,10,12],[0,18,45],[2,8,11],[0,23,307],[1,0,7],[2,11,30],[2,169,172],[2,32,34],[2,22,32],[2,37,44]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getEquiToCubeSample = getSymbol("getEquiToCubeSample");
