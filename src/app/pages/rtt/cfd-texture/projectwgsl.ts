/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../shader/wgsl";
import m0 from "../../../../wgsl/use/arraywgsl";
const {} = symbolDictionary;
const _ = decompressString("getSize pressureTexture velocityTextureOut velocityTextureIn main symbols visibles ../../../../wgsl/use/array name wrapIndex2i imported imports modules symbol flags vec2<u32> type link attr func texture_2d<f32> variable externals void compute globalId vec3<u32> builtin(global_invocation_id) parameters identifiers exports linkable wrapIndex2i pressureTexture globalId center textureLoad sample".split(' '));
const t = {[_(5)]:_([0,1,2,3,4]),[_(6)]:_([4]),[_(12)]:[{"at":0,[_(8)]:_(7),[_(5)]:_([9]),[_(11)]:[{[_(8)]:_(9),[_(10)]:_(9)}]}],[_(22)]:[{"at":54,[_(13)]:_(0),[_(14)]:2,[_(19)]:{[_(8)]:_(0),[_(16)]:_(15),[_(18)]:_([17])}},{"at":93,[_(13)]:_(1),[_(14)]:2,[_(21)]:{[_(8)]:_(1),[_(16)]:_(20),[_(18)]:_([17])}},{"at":140,[_(13)]:_(2),[_(14)]:2,[_(21)]:{[_(8)]:_(2),[_(16)]:"texture_storage_2d<rgba32float, write>",[_(18)]:_([17])}},{"at":211,[_(13)]:_(3),[_(14)]:2,[_(21)]:{[_(8)]:_(3),[_(16)]:_(20),[_(18)]:_([17])}}],[_(30)]:[{"at":260,[_(13)]:_(4),[_(14)]:1,[_(19)]:{[_(8)]:_(4),[_(16)]:_(23),[_(18)]:_([24,"workgroup_size(8, 8)"]),[_(28)]:[{[_(8)]:_(25),[_(16)]:_(26),[_(18)]:_([27])}],[_(29)]:_([0,1,3,2])}}],[_(31)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true}};
const data = {
  "name": "cfd-texture/project",
  "code": _(["use '",7,"'::{ ",9," };\r\n\r\n@",17," fn ",0,"() -> ",15," {};\r\n\r\n@",17," var ",1,": ",20,";\r\n\r\n@",17," var ",2,": texture_storage_2d<rgba32float, write>;\r\n@",17," var ",3,": ",20,";\r\n\r\n@",24," @workgroup_size(8, 8)\r\nfn ",4,"(\r\n  @",27," ",25,": ",26,",\r\n) {\r\n  let size = ",0,"();\r\n\r\n  if (any(",25,".xy >= size)) { return; }\r\n  let ",35," = vec2<i32>(",25,".xy);\r\n\r\n  let left   = ",9,"(",35," - vec2<i32>(1, 0), size);\r\n  let right  = ",9,"(",35," + vec2<i32>(1, 0), size);\r\n  let top    = ",9,"(",35," - vec2<i32>(0, 1), size);\r\n  let bottom = ",9,"(",35," + vec2<i32>(0, 1), size);\r\n\r\n  let p1 = ",36,"(",1,", left, 0).x;\r\n  let p2 = ",36,"(",1,", right, 0).x;\r\n  let p3 = ",36,"(",1,", top, 0).x;\r\n  let p4 = ",36,"(",1,", bottom, 0).x;\r\n\r\n  var ",37," = ",36,"(",3,", ",35,", 0);\r\n\r\n  ",37,".x -= .5 * (p2 - p1);\r\n  ",37,".y -= .5 * (p4 - p3);\r\n  ",37,".z *= 0.99999;\r\n  ",37,".w *= 0.99999;\r\n\r\n  textureStore(",2,", ",35,", ",37,");\r\n}"]).join(''),
  "hash": 7052017578442783,
  "table": t,
  "shake": [[54,[0,4]],[93,[1,4]],[140,[2,4]],[211,[3,4]],[260,[4]]],
  "tree": decompressAST([[1,0,49],[1,54,88],[1,39,82],[1,47,116],[1,71,116],[0,49,954],[3,0,8],[3,9,30],[2,26,30],[3,9,39],[2,71,78],[2,116,127],[2,61,72],[2,61,72],[2,61,72],[2,71,86],[2,53,68],[2,54,69],[2,52,67],[2,61,78],[2,161,179]], t[S]),
};
const libs = {"../../../../wgsl/use/array": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
