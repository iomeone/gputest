/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/codec/octahedralwgsl";
const {} = symbolDictionary;
const _ = decompressString("getTargetMapping getSourceMapping getScratchTexture scratchTexture atlasTexture pmremCopy symbols visibles ../../wgsl/codec/octahedral name wrapOctahedral decodeOctahedral imported imports modules symbol flags vec4<u32> type link attr func vec4<f32> vec2<f32> level f32 parameters variable externals void compute export globalId vec3<u32> builtin(global_invocation_id) identifiers exports linkable globalId mapping sample".split(' '));
const t = {[_(6)]:_([0,1,2,3,4,5]),[_(7)]:_([5]),[_(14)]:[{"at":0,[_(9)]:_(8),[_(6)]:_([10,11]),[_(13)]:[{[_(9)]:_(10),[_(12)]:_(10)},{[_(9)]:_(11),[_(12)]:_(11)}]}],[_(28)]:[{"at":76,[_(15)]:_(0),[_(16)]:2,[_(21)]:{[_(9)]:_(0),[_(18)]:_(17),[_(20)]:_([19])}},{"at":122,[_(15)]:_(1),[_(16)]:2,[_(21)]:{[_(9)]:_(1),[_(18)]:_(17),[_(20)]:_([19])}},{"at":170,[_(15)]:_(2),[_(16)]:2,[_(21)]:{[_(9)]:_(2),[_(18)]:_(22),[_(20)]:_([19]),[_(26)]:[{[_(9)]:"uv",[_(18)]:_(23)},{[_(9)]:_(24),[_(18)]:_(25)}]}},{"at":241,[_(15)]:_(3),[_(16)]:2,[_(27)]:{[_(9)]:_(3),[_(18)]:"texture_storage_2d<rgba16float, write>",[_(20)]:_([19])}},{"at":308,[_(15)]:_(4),[_(16)]:2,[_(27)]:{[_(9)]:_(4),[_(18)]:"texture_storage_2d<rgba16float, write>",[_(20)]:_([19])}}],[_(36)]:[{"at":375,[_(15)]:_(5),[_(16)]:1,[_(21)]:{[_(9)]:_(5),[_(18)]:_(29),[_(20)]:_([30,"workgroup_size(8, 8)",31]),[_(26)]:[{[_(9)]:_(32),[_(18)]:_(33),[_(20)]:_([34])}],[_(35)]:_([0,1,2,4,3])}}],[_(37)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true,[_(4)]:true}};
const data = {
  "name": "pmrem/pmrem-copy",
  "code": _(["use '",8,"'::{ ",10,", ",11," };\r\n\r\n@",19," fn ",0,"() -> ",17," {};\r\n@",19," fn ",1,"() -> ",17," {};\r\n\r\n@",19," fn ",2,"(uv: ",23,", ",24,": f32) -> ",22,";\r\n\r\n@",19," var ",3,": texture_storage_2d<rgba16float, write>;\r\n@",19," var ",4,": texture_storage_2d<rgba16float, write>;\r\n\r\n@",30," @workgroup_size(8, 8)\r\n@",31," fn ",5,"(\r\n  @",34," ",32,": ",33,",\r\n) {\r\n  let ",39," = ",0,"();\r\n  let size = ",39,".zw - ",39,".xy;\r\n\r\n  if (any(",32,".xy >= vec2<u32>(size))) { return; }\r\n\r\n  let xyi = vec2<u32>(",32,".xy);\r\n  let uv = ",23,"(xyi) / ",23,"(size - 1);\r\n  let uvo = uv;\r\n\r\n  var ",40,": ",22,";\r\n  {\r\n    let ",39," = ",1,"();\r\n    let size = ",39,".zw - ",39,".xy;\r\n\r\n    let uv2 = uvo * ",23,"(size - 1) + 0.5;\r\n    ",40," = ",2,"(uv2, 0.0);\r\n  }\r\n\r\n  textureStore(",4,", xyi + ",39,".xy, ",40,");\r\n  textureStore(",3,", xyi, ",40,");\r\n}"]).join(''),
  "hash": 928695263017055,
  "table": t,
  "shake": [[76,[0,5]],[122,[1,5]],[170,[2,5]],[241,[3,5]],[308,[4,5]],[375,[5]]],
  "tree": decompressAST([[1,0,71],[1,76,119],[1,46,89],[1,48,114],[1,71,136],[1,67,130],[0,67,739],[3,0,8],[3,9,30],[1,23,30],[2,11,20],[3,14,44],[2,74,90],[2,275,291],[2,125,142],[2,52,64],[2,57,71]], t[S]),
};
const libs = {"../../wgsl/codec/octahedral": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const pmremCopy = getSymbol("pmremCopy");
