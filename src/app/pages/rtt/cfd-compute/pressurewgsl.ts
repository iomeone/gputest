/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../shader/wgsl";
import m0 from "../../../../wgsl/use/arraywgsl";
const {} = symbolDictionary;
const _ = decompressString("getSize divergenceBuffer pressureBufferOut pressureBufferIn main symbols visibles ../../../../wgsl/use/array name sizeToModulus2 packIndex2 wrapIndex2 imported imports modules symbol flags vec2<u32> type link attr func array<f32> <storage> qual variable externals void compute globalId vec3<u32> builtin(global_invocation_id) parameters identifiers exports linkable packIndex2 wrapIndex2 storage pressureBufferIn globalId fragmentId modulus center".split(' '));
const t = {[_(5)]:_([0,1,2,3,4]),[_(6)]:_([4]),[_(14)]:[{"at":0,[_(8)]:_(7),[_(5)]:_([9,10,11]),[_(13)]:[{[_(8)]:_(9),[_(12)]:_(9)},{[_(8)]:_(10),[_(12)]:_(10)},{[_(8)]:_(11),[_(12)]:_(11)}]}],[_(26)]:[{"at":81,[_(15)]:_(0),[_(16)]:2,[_(21)]:{[_(8)]:_(0),[_(18)]:_(17),[_(20)]:_([19])}},{"at":120,[_(15)]:_(1),[_(16)]:2,[_(25)]:{[_(8)]:_(1),[_(18)]:_(22),[_(20)]:_([19]),[_(24)]:_(23)}},{"at":172,[_(15)]:_(2),[_(16)]:2,[_(25)]:{[_(8)]:_(2),[_(18)]:_(22),[_(20)]:_([19]),[_(24)]:"<storage, read_write>"}},{"at":235,[_(15)]:_(3),[_(16)]:2,[_(25)]:{[_(8)]:_(3),[_(18)]:_(22),[_(20)]:_([19]),[_(24)]:_(23)}}],[_(34)]:[{"at":287,[_(15)]:_(4),[_(16)]:1,[_(21)]:{[_(8)]:_(4),[_(18)]:_(27),[_(20)]:_([28,"workgroup_size(8, 8)"]),[_(32)]:[{[_(8)]:_(29),[_(18)]:_(30),[_(20)]:_([31])}],[_(33)]:_([0,3,1,2])}}],[_(35)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true}};
const data = {
  "name": "cfd-compute/pressure",
  "code": _(["use '",7,"'::{ ",9,", ",10,", ",11," };\r\n\r\n@",19," fn ",0,"() -> ",17," {};\r\n\r\n@",19," var",23," ",1,": ",22,";\r\n\r\n@",19," var<",38,", read_write> ",2,": ",22,";\r\n@",19," var",23," ",3,": ",22,";\r\n\r\n@",28," @workgroup_size(8, 8)\r\nfn ",4,"(\r\n  @",31," ",29,": ",30,",\r\n) {\r\n  let size = ",0,"();\r\n  if (any(",29,".xy >= size)) { return; }\r\n  let ",41," = ",29,".xy;\r\n\r\n  let ",42," = ",9,"(size);\r\n  let ",43," = ",10,"(",41,", ",42,");\r\n\r\n  let left   = ",10,"(",11,"(vec2<i32>(",41,") - vec2<i32>(1, 0), size), ",42,");\r\n  let right  = ",10,"(",11,"(vec2<i32>(",41,") + vec2<i32>(1, 0), size), ",42,");\r\n  let top    = ",10,"(",11,"(vec2<i32>(",41,") - vec2<i32>(0, 1), size), ",42,");\r\n  let bottom = ",10,"(",11,"(vec2<i32>(",41,") + vec2<i32>(0, 1), size), ",42,");\r\n\r\n  let p1 = ",3,"[left];\r\n  let p2 = ",3,"[right];\r\n  let p3 = ",3,"[top];\r\n  let p4 = ",3,"[bottom];\r\n\r\n  let div = ",1,"[",43,"];\r\n\r\n  let p = (div + p1 + p2 + p3 + p4) / 4.0;\r\n\r\n  ",2,"[",43,"] = p;\r\n}"]).join(''),
  "hash": 3940127496441886,
  "table": t,
  "shake": [[81,[0,4]],[120,[1,4]],[172,[2,4]],[235,[3,4]],[287,[4]]],
  "tree": decompressAST([[1,0,76],[1,81,115],[1,39,87],[1,52,113],[1,63,111],[0,52,1005],[3,0,8],[3,9,30],[2,26,30],[3,9,39],[2,71,78],[2,108,122],[2,38,48],[2,51,61],[2,11,21],[2,85,95],[2,11,21],[2,85,95],[2,11,21],[2,85,95],[2,11,21],[2,83,99],[2,36,52],[2,37,53],[2,35,51],[2,41,57],[2,77,94]], t[S]),
};
const libs = {"../../../../wgsl/use/array": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
