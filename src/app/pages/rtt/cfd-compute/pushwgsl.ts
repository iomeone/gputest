/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../shader/wgsl";
import m0 from "../../../../wgsl/use/arraywgsl";
const {} = symbolDictionary;
const _ = decompressString("getSize getMousePosition getMouseDirection velocityBuffer main symbols visibles ../../../../wgsl/use/array name sizeToModulus2 packIndex2 imported imports modules symbol flags vec2<u32> type link attr func vec2<f32> array<vec4<f32>> qual variable externals void compute globalId vec3<u32> builtin(global_invocation_id) parameters identifiers exports linkable globalId fragmentId ripple circle".split(' '));
const t = {[_(5)]:_([0,1,2,3,4]),[_(6)]:_([4]),[_(13)]:[{"at":0,[_(8)]:_(7),[_(5)]:_([9,10]),[_(12)]:[{[_(8)]:_(9),[_(11)]:_(9)},{[_(8)]:_(10),[_(11)]:_(10)}]}],[_(25)]:[{"at":69,[_(14)]:_(0),[_(15)]:2,[_(20)]:{[_(8)]:_(0),[_(17)]:_(16),[_(19)]:_([18])}},{"at":108,[_(14)]:_(1),[_(15)]:2,[_(20)]:{[_(8)]:_(1),[_(17)]:_(21),[_(19)]:_([18])}},{"at":154,[_(14)]:_(2),[_(15)]:2,[_(20)]:{[_(8)]:_(2),[_(17)]:_(21),[_(19)]:_([18])}},{"at":203,[_(14)]:_(3),[_(15)]:2,[_(24)]:{[_(8)]:_(3),[_(17)]:_(22),[_(19)]:_([18]),[_(23)]:"<storage, read_write>"}}],[_(33)]:[{"at":271,[_(14)]:_(4),[_(15)]:1,[_(20)]:{[_(8)]:_(4),[_(17)]:_(26),[_(19)]:_([27,"workgroup_size(8, 8)"]),[_(31)]:[{[_(8)]:_(28),[_(17)]:_(29),[_(19)]:_([30])}],[_(32)]:_([0,1,2,3])}}],[_(34)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true}};
const data = {
  "name": "cfd-compute/push",
  "code": _(["use '",7,"'::{ ",9,", ",10," };\r\n\r\n@",18," fn ",0,"() -> ",16," {};\r\n\r\n@",18," fn ",1,"() -> ",21," {};\r\n@",18," fn ",2,"() -> ",21," {};\r\n\r\n@",18," var<storage, read_write> ",3,": ",22,";\r\n\r\n@",27," @workgroup_size(8, 8)\r\nfn ",4,"(\r\n  @",30," ",28,": ",29,",\r\n) {\r\n  let size = ",0,"();\r\n  if (any(",28,".xy >= size)) { return; }\r\n  let ",36," = ",28,".xy;\r\n\r\n  let modulus = ",9,"(size);\r\n  let index = ",10,"(",36,", modulus);\r\n\r\n  var mp = ",1,"();\r\n  var md = -",2,"();\r\n\r\n  let xy = (",21,"(",36,") - mp) / f32(size.y) * 16.0;\r\n  let r1 = dot(xy, xy);\r\n\r\n  let strength = max(0.0, 1.0 / (r1 + 1.0) * (1.0 - r1));\r\n  let velocity = md * strength / 32.0 / max(1.0, length(md) / 5.0);\r\n\r\n  var ",37," = sin((xy + cos(xy.yx + mp) * 4.0 - mp) * ",21,"(13.311, 17.717));\r\n  ",37," *= ",37,".yx;\r\n  ",37," *= ",37,";\r\n\r\n  let ",38," = f32(r1 < 1.0) * r1 * (1.0 - r1);\r\n  let density = (",37,".x * ",37,".y) * (",38," * ",38,") * 2.0;\r\n\r\n  ",3,"[index] += vec4<f32>(velocity, density, 0.0);\r\n}"]).join(''),
  "hash": 7329703803445347,
  "table": t,
  "shake": [[69,[0,4]],[108,[1,4]],[154,[2,4]],[203,[3,4]],[271,[4]]],
  "tree": decompressAST([[1,0,64],[1,69,103],[1,39,82],[1,46,90],[1,49,113],[0,68,964],[3,0,8],[3,9,30],[2,26,30],[3,9,39],[2,71,78],[2,108,122],[2,37,47],[2,47,63],[2,33,50],[2,494,508]], t[S]),
};
const libs = {"../../../../wgsl/use/array": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
