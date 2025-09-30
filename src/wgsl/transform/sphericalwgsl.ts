/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getTransformMatrix getSphericalBend getSphericalFocus getSphericalAspectX getSphericalAspectY getSphericalScaleY getSphericalPosition symbols visibles symbol flags name mat4x4<f32> type link attr func f32 optional externals vec4<f32> export position parameters identifiers exports linkable optional return position sphericalBend sphericalFocus sphericalAspectX sphericalAspectY matrix radius cosine".split(' '));
const t = {[_(7)]:_([0,1,2,3,4,5,6]),[_(8)]:_([6]),[_(19)]:[{"at":0,[_(9)]:_(0),[_(10)]:2,[_(16)]:{[_(11)]:_(0),[_(13)]:_(12),[_(15)]:_([14])}},{"at":49,[_(9)]:_(1),[_(10)]:6,[_(16)]:{[_(11)]:_(1),[_(13)]:_(17),[_(15)]:_([18,14])}},{"at":112,[_(9)]:_(2),[_(10)]:6,[_(16)]:{[_(11)]:_(2),[_(13)]:_(17),[_(15)]:_([18,14])}},{"at":176,[_(9)]:_(3),[_(10)]:6,[_(16)]:{[_(11)]:_(3),[_(13)]:_(17),[_(15)]:_([18,14])}},{"at":242,[_(9)]:_(4),[_(10)]:6,[_(16)]:{[_(11)]:_(4),[_(13)]:_(17),[_(15)]:_([18,14])}},{"at":308,[_(9)]:_(5),[_(10)]:6,[_(16)]:{[_(11)]:_(5),[_(13)]:_(17),[_(15)]:_([18,14])}}],[_(25)]:[{"at":375,[_(9)]:_(6),[_(10)]:1,[_(16)]:{[_(11)]:_(6),[_(13)]:_(20),[_(15)]:_([21]),[_(23)]:[{[_(11)]:_(22),[_(13)]:_(20)}],[_(24)]:_([1,2,3,4,5,0])}}],[_(26)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true,[_(4)]:true,[_(5)]:true}};
const data = {
  "name": "transform/spherical",
  "code": _(["@",14," fn ",0,"() -> ",12,";\r\n\r\n@",18," @",14," fn ",1,"() -> f32 { ",28," 0.0; };\r\n@",18," @",14," fn ",2,"() -> f32 { ",28," 0.0; };\r\n@",18," @",14," fn ",3,"() -> f32 { ",28," 1.0; };\r\n@",18," @",14," fn ",4,"() -> f32 { ",28," 1.0; };\r\n@",18," @",14," fn ",5,"() -> f32 { ",28," 0.0; };\r\n\r\n@",21," fn ",6,"(",22,": ",20,") -> ",20," {\r\n  let ",30," = ",1,"();\r\n  let ",31," = ",2,"();\r\n  let ",32," = ",3,"();\r\n  let ",33," = ",4,"();\r\n  let sphericalScaleY = ",5,"();\r\n\r\n  let ",34," = ",0,"();\r\n\r\n  if (",30," > 0.0001) {\r\n    let xyz = ",22,".xyz * vec3<f32>(",30,", ",30," / ",33," * sphericalScaleY, ",32,");\r\n    let ",35," = ",31," + xyz.z;\r\n    let ",36," = cos(xyz.y) * ",35,";\r\n\r\n    ",28," ",34," * ",20,"(\r\n      sin(xyz.x) * ",36,",\r\n      sin(xyz.y) * ",35," * ",33,",\r\n      (cos(xyz.x) * ",36," - ",31,") / ",32,",\r\n      1.0\r\n    );\r\n  }\r\n  ",28," ",34," * ",20,"(",22,".xyz, 1.0);\r\n}"]).join(''),
  "hash": 4519769655518915,
  "table": t,
  "shake": [[0,[0,6]],[49,[1,6]],[112,[2,6]],[176,[3,6]],[242,[4,6]],[308,[5,6]],[375,[6]]],
  "tree": decompressAST([[1,0,44],[4,49,109,1],[1,0,9],[1,10,15],[2,9,25],[4,44,105,2],[1,0,9],[1,10,15],[2,9,26],[4,45,108,3],[1,0,9],[1,10,15],[2,9,28],[4,47,110,4],[1,0,9],[1,10,15],[2,9,28],[4,47,109,5],[1,0,9],[1,10,15],[2,9,27],[0,48,881],[1,0,7],[2,11,31],[2,80,96],[2,44,61],[2,47,66],[2,49,68],[2,48,66],[2,40,58]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getSphericalPosition = getSymbol("getSphericalPosition");
