/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../shader/wgsl";
import m0 from "../../../../wgsl/use/arraywgsl";
const {} = symbolDictionary;
const _ = decompressString("getSize divergenceTexture pressureTextureOut pressureTextureIn main symbols visibles ../../../../wgsl/use/array name wrapIndex2i imported imports modules symbol flags vec2<u32> type link attr func texture_2d<f32> variable externals void compute globalId vec3<u32> builtin(global_invocation_id) parameters identifiers exports linkable wrapIndex2i pressureTextureIn globalId center textureLoad".split(' '));
const t = {[_(5)]:_([0,1,2,3,4]),[_(6)]:_([4]),[_(12)]:[{"at":0,[_(8)]:_(7),[_(5)]:_([9]),[_(11)]:[{[_(8)]:_(9),[_(10)]:_(9)}]}],[_(22)]:[{"at":54,[_(13)]:_(0),[_(14)]:2,[_(19)]:{[_(8)]:_(0),[_(16)]:_(15),[_(18)]:_([17])}},{"at":93,[_(13)]:_(1),[_(14)]:2,[_(21)]:{[_(8)]:_(1),[_(16)]:_(20),[_(18)]:_([17])}},{"at":142,[_(13)]:_(2),[_(14)]:2,[_(21)]:{[_(8)]:_(2),[_(16)]:"texture_storage_2d<r32float, write>",[_(18)]:_([17])}},{"at":210,[_(13)]:_(3),[_(14)]:2,[_(21)]:{[_(8)]:_(3),[_(16)]:_(20),[_(18)]:_([17])}}],[_(30)]:[{"at":259,[_(13)]:_(4),[_(14)]:1,[_(19)]:{[_(8)]:_(4),[_(16)]:_(23),[_(18)]:_([24,"workgroup_size(8, 8)"]),[_(28)]:[{[_(8)]:_(25),[_(16)]:_(26),[_(18)]:_([27])}],[_(29)]:_([0,3,1,2])}}],[_(31)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true}};
const data = {
  "name": "cfd-texture/pressure",
  "code": _(["use '",7,"'::{ ",9," };\r\n\r\n@",17," fn ",0,"() -> ",15," {};\r\n\r\n@",17," var ",1,": ",20,";\r\n\r\n@",17," var ",2,": texture_storage_2d<r32float, write>;\r\n@",17," var ",3,": ",20,";\r\n\r\n@",24," @workgroup_size(8, 8)\r\nfn ",4,"(\r\n  @",27," ",25,": ",26,",\r\n) {\r\n  let size = ",0,"();\r\n\r\n  if (any(",25,".xy >= size)) { return; }\r\n  let ",35," = vec2<i32>(",25,".xy);\r\n\r\n  let left   = ",9,"(",35," - vec2<i32>(1, 0), size);\r\n  let right  = ",9,"(",35," + vec2<i32>(1, 0), size);\r\n  let top    = ",9,"(",35," - vec2<i32>(0, 1), size);\r\n  let bottom = ",9,"(",35," + vec2<i32>(0, 1), size);\r\n\r\n  let p1 = ",36,"(",3,", left, 0).x;\r\n  let p2 = ",36,"(",3,", right, 0).x;\r\n  let p3 = ",36,"(",3,", top, 0).x;\r\n  let p4 = ",36,"(",3,", bottom, 0).x;\r\n\r\n  let div = ",36,"(",1,", ",35,", 0).x;\r\n\r\n  let p = (div + p1 + p2 + p3 + p4) / 4.0;\r\n\r\n  textureStore(",2,", ",35,", vec4<f32>(p, 0.0, 0.0, 0.0));\r\n}"]).join(''),
  "hash": 1222933276155722,
  "table": t,
  "shake": [[54,[0,4]],[93,[1,4]],[142,[2,4]],[210,[3,4]],[259,[4]]],
  "tree": decompressAST([[1,0,49],[1,54,88],[1,39,84],[1,49,115],[1,68,113],[0,49,916],[3,0,8],[3,9,30],[2,26,30],[3,9,39],[2,71,78],[2,116,127],[2,61,72],[2,61,72],[2,61,72],[2,71,88],[2,55,72],[2,56,73],[2,54,71],[2,60,77],[2,97,115]], t[S]),
};
const libs = {"../../../../wgsl/use/array": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
