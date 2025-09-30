/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getSize getMousePosition getMouseDirection velocityTextureOut velocityTextureIn main symbols visibles symbol flags name vec2<u32> type link attr func vec2<f32> variable texture_2d<f32> externals void compute globalId vec3<u32> builtin(global_invocation_id) parameters identifiers exports linkable globalId center ripple circle sample".split(' '));
const t = {[_(6)]:_([0,1,2,3,4,5]),[_(7)]:_([5]),[_(19)]:[{"at":0,[_(8)]:_(0),[_(9)]:2,[_(15)]:{[_(10)]:_(0),[_(12)]:_(11),[_(14)]:_([13])}},{"at":39,[_(8)]:_(1),[_(9)]:2,[_(15)]:{[_(10)]:_(1),[_(12)]:_(16),[_(14)]:_([13])}},{"at":85,[_(8)]:_(2),[_(9)]:2,[_(15)]:{[_(10)]:_(2),[_(12)]:_(16),[_(14)]:_([13])}},{"at":134,[_(8)]:_(3),[_(9)]:2,[_(17)]:{[_(10)]:_(3),[_(12)]:"texture_storage_2d<rgba32float, write>",[_(14)]:_([13])}},{"at":205,[_(8)]:_(4),[_(9)]:2,[_(17)]:{[_(10)]:_(4),[_(12)]:_(18),[_(14)]:_([13])}}],[_(27)]:[{"at":254,[_(8)]:_(5),[_(9)]:1,[_(15)]:{[_(10)]:_(5),[_(12)]:_(20),[_(14)]:_([21,"workgroup_size(8, 8)"]),[_(25)]:[{[_(10)]:_(22),[_(12)]:_(23),[_(14)]:_([24])}],[_(26)]:_([0,1,2,4,3])}}],[_(28)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true,[_(4)]:true}};
const data = {
  "name": "cfd-texture/push",
  "code": _(["@",13," fn ",0,"() -> ",11," {};\r\n\r\n@",13," fn ",1,"() -> ",16," {};\r\n@",13," fn ",2,"() -> ",16," {};\r\n\r\n@",13," var ",3,": texture_storage_2d<rgba32float, write>;\r\n@",13," var ",4,": ",18,";\r\n\r\n@",21," @workgroup_size(8, 8)\r\nfn ",5,"(\r\n  @",24," ",22,": ",23,",\r\n) {\r\n  let size = ",0,"();\r\n  if (any(",22,".xy >= size)) { return; }\r\n  let fragmentId = ",22,".xy;\r\n\r\n  let ",30," = vec2<i32>(",22,".xy);\r\n  let mp = ",1,"();\r\n  let md = -",2,"();\r\n\r\n  let xy = (",16,"(fragmentId) - mp) / f32(size.y) * 16.0;\r\n  let r1 = dot(xy, xy);\r\n\r\n  let strength = max(0.0, 1.0 / (r1 + 1.0) * (1.0 - r1));\r\n  let velocity = md * strength / 32.0 / max(1.0, length(md) / 5.0);\r\n\r\n  var ",31," = sin((xy + cos(xy.yx + mp) * 4.0 - mp) * ",16,"(13.311, 17.717));\r\n  ",31," *= ",31,".yx;\r\n  ",31," *= ",31,";\r\n\r\n  let ",32," = f32(r1 < 1.0) * r1 * (1.0 - r1);\r\n  let density = (",31,".x * ",31,".y) * (",32," * ",32,") * 2.0;\r\n\r\n  var ",33," = textureLoad(",4,", ",30,", 0);\r\n  ",33," += vec4<f32>(velocity, density, 0.0);\r\n  textureStore(",3,", ",30,", ",33,");\r\n}"]).join(''),
  "hash": 1964064525889959,
  "table": t,
  "shake": [[0,[0,5]],[39,[1,5]],[85,[2,5]],[134,[3,5]],[205,[4,5]],[254,[5]]],
  "tree": decompressAST([[1,0,34],[1,39,82],[1,46,90],[1,49,118],[1,71,116],[0,49,993],[3,0,8],[3,9,30],[2,26,30],[3,9,39],[2,71,78],[2,143,159],[2,33,50],[2,519,536],[2,95,113]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
