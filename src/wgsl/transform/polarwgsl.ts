/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getTransformMatrix getPolarBend getPolarFocus getPolarAspect getPolarHelix getPolarPosition symbols visibles symbol flags name mat4x4<f32> type link attr func f32 optional externals vec4<f32> export position parameters identifiers exports linkable optional return position polarBend polarFocus polarAspect polarHelix matrix radius".split(' '));
const t = {[_(6)]:_([0,1,2,3,4,5]),[_(7)]:_([5]),[_(18)]:[{"at":0,[_(8)]:_(0),[_(9)]:2,[_(15)]:{[_(10)]:_(0),[_(12)]:_(11),[_(14)]:_([13])}},{"at":49,[_(8)]:_(1),[_(9)]:6,[_(15)]:{[_(10)]:_(1),[_(12)]:_(16),[_(14)]:_([17,13])}},{"at":108,[_(8)]:_(2),[_(9)]:6,[_(15)]:{[_(10)]:_(2),[_(12)]:_(16),[_(14)]:_([17,13])}},{"at":168,[_(8)]:_(3),[_(9)]:6,[_(15)]:{[_(10)]:_(3),[_(12)]:_(16),[_(14)]:_([17,13])}},{"at":229,[_(8)]:_(4),[_(9)]:6,[_(15)]:{[_(10)]:_(4),[_(12)]:_(16),[_(14)]:_([17,13])}}],[_(24)]:[{"at":291,[_(8)]:_(5),[_(9)]:1,[_(15)]:{[_(10)]:_(5),[_(12)]:_(19),[_(14)]:_([20]),[_(22)]:[{[_(10)]:_(21),[_(12)]:_(19)}],[_(23)]:_([1,2,3,4,0])}}],[_(25)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true,[_(4)]:true}};
const data = {
  "name": "transform/polar",
  "code": _(["@",13," fn ",0,"() -> ",11,";\r\n\r\n@",17," @",13," fn ",1,"() -> f32 { ",27," 0.0; };\r\n@",17," @",13," fn ",2,"() -> f32 { ",27," 0.0; };\r\n@",17," @",13," fn ",3,"() -> f32 { ",27," 1.0; };\r\n@",17," @",13," fn ",4,"() -> f32 { ",27," 0.0; };\r\n\r\n@",20," fn ",5,"(",21,": ",19,") -> ",19," {\r\n  let ",29," = ",1,"();\r\n  let ",30," = ",2,"();\r\n  let ",31," = ",3,"();\r\n  let ",32," = ",4,"();\r\n\r\n  let ",33," = ",0,"();\r\n\r\n  if (",29," > 0.0) {\r\n    if (",29," < 0.001) {\r\n      // Factor out large addition/subtraction of ",30,"\r\n      // to avoid numerical error\r\n      // sin(x) ~ x\r\n      // cos(x) ~ 1 - x * x / 2\r\n      let pb = ",21,".xy * ",29,";\r\n      let ppbbx = pb.x * pb.x;\r\n      ",27," ",33," * vec4(\r\n        ",21,".x * (1.0 - ",29," + (pb.y * ",31,")),\r\n        ",21,".y * (1.0 - .5 * ppbbx) - (.5 * ppbbx) * ",30," / ",31,",\r\n        ",21,".z + ",21,".x * ",32," * ",29,",\r\n        1.0\r\n      );\r\n    }\r\n    else {\r\n      let xy = ",21,".xy * vec2<f32>(",29,", ",31,");\r\n      let ",34," = ",30," + xy.y;\r\n      ",27," ",33," * ",19,"(\r\n        sin(xy.x) * ",34,",\r\n        (cos(xy.x) * ",34," - ",30,") / ",31,",\r\n        ",21,".z + ",21,".x * ",32," * ",29,",\r\n        1.0\r\n      );\r\n    }\r\n  }\r\n  ",27," ",33," * ",19,"(",21,".xyz, 1.0);\r\n}"]).join(''),
  "hash": 3682529776338093,
  "table": t,
  "shake": [[0,[0,5]],[49,[1,5]],[108,[2,5]],[168,[3,5]],[229,[4,5]],[291,[5]]],
  "tree": decompressAST([[1,0,44],[4,49,105,1],[1,0,9],[1,10,15],[2,9,21],[4,40,97,2],[1,0,9],[1,10,15],[2,9,22],[4,41,99,3],[1,0,9],[1,10,15],[2,9,23],[4,42,99,4],[1,0,9],[1,10,15],[2,9,22],[0,43,1225],[1,0,7],[2,11,27],[2,72,84],[2,36,49],[2,38,52],[2,38,51],[2,35,53]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getPolarPosition = getSymbol("getPolarPosition");
