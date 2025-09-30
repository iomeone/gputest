/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
import m0 from "../../wgsl/codec/octahedralwgsl";
const {} = symbolDictionary;
const _ = decompressString("getTargetMapping getCubeMap scratchTexture atlasTexture textureDump pmremInit symbols visibles ../../wgsl/codec/octahedral name wrapOctahedral decodeOctahedral imported imports modules symbol flags vec4<u32> type link attr func vec4<f32> optional uvw vec3<f32> level f32 parameters variable array<vec4<f32>> qual externals void compute export globalId vec3<u32> builtin(global_invocation_id) identifiers exports linkable globalId mapping sample".split(' '));
const t = {[_(6)]:_([0,1,2,3,4,5]),[_(7)]:_([5]),[_(14)]:[{"at":0,[_(9)]:_(8),[_(6)]:_([10,11]),[_(13)]:[{[_(9)]:_(10),[_(12)]:_(10)},{[_(9)]:_(11),[_(12)]:_(11)}]}],[_(32)]:[{"at":76,[_(15)]:_(0),[_(16)]:2,[_(21)]:{[_(9)]:_(0),[_(18)]:_(17),[_(20)]:_([19])}},{"at":124,[_(15)]:_(1),[_(16)]:6,[_(21)]:{[_(9)]:_(1),[_(18)]:_(22),[_(20)]:_([23,19]),[_(28)]:[{[_(9)]:_(24),[_(18)]:_(25)},{[_(9)]:_(26),[_(18)]:_(27)}]}},{"at":226,[_(15)]:_(2),[_(16)]:2,[_(29)]:{[_(9)]:_(2),[_(18)]:"texture_storage_2d<rgba16float, write>",[_(20)]:_([19])}},{"at":293,[_(15)]:_(3),[_(16)]:2,[_(29)]:{[_(9)]:_(3),[_(18)]:"texture_storage_2d<rgba16float, write>",[_(20)]:_([19])}},{"at":360,[_(15)]:_(4),[_(16)]:2,[_(29)]:{[_(9)]:_(4),[_(18)]:_(30),[_(20)]:_([19]),[_(31)]:"<storage, read_write>"}}],[_(40)]:[{"at":486,[_(15)]:_(5),[_(16)]:1,[_(21)]:{[_(9)]:_(5),[_(18)]:_(33),[_(20)]:_([34,"workgroup_size(8, 8)",35]),[_(28)]:[{[_(9)]:_(36),[_(18)]:_(37),[_(20)]:_([38])}],[_(39)]:_([0,1,4,3,2])}}],[_(41)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true,[_(4)]:true}};
const data = {
  "name": "pmrem/pmrem-init",
  "code": _(["use '",8,"'::{ ",10,", ",11," };\r\n\r\n@",19," fn ",0,"() -> ",17," {};\r\n\r\n@",23," @",19," fn ",1,"(uvw: ",25,", ",26,": f32) -> ",22," { return ",22,"(0.0); };\r\n\r\n@",19," var ",2,": texture_storage_2d<rgba16float, write>;\r\n@",19," var ",3,": texture_storage_2d<rgba16float, write>;\r\n\r\n@",19," var<storage, read_write> ",4,": array<",22,">;\r\n\r\n//@",19," fn getScratchTexture(uv: vec2<f32>) -> ",22,";\r\n\r\n@",34," @workgroup_size(8, 8)\r\n@",35," fn ",5,"(\r\n  @",38," ",36,": ",37,",\r\n) {\r\n  let ",43," = ",0,"();\r\n  let size = ",43,".zw - ",43,".xy;\r\n\r\n  if (any(",36,".xy >= vec2<u32>(size))) { return; }\r\n\r\n  let xyi = vec2<u32>(",36,".xy);\r\n  let uv = vec2<f32>(xyi) / vec2<f32>(size - 1);\r\n  let uvo = (uv * 2.0 - 1.0);\r\n\r\n  let ray = ",11,"(uvo);\r\n  let ",44," = ",1,"(ray, 0.0);\r\n\r\n  let xyi4 = xyi / 4;\r\n  let index = xyi4.x + xyi4.y * 256;\r\n  ",4,"[index] = ",44,";\r\n\r\n  textureStore(",3,", xyi + ",43,".xy, ",44,");\r\n  textureStore(",2,", xyi, ",44,");\r\n}"]).join(''),
  "hash": 439337810203304,
  "table": t,
  "shake": [[76,[0,5]],[124,[1,5]],[226,[2,5]],[293,[3,5]],[360,[4,5]],[486,[5]]],
  "tree": decompressAST([[1,0,71],[1,76,119],[4,48,145,1],[1,0,9],[1,10,15],[2,9,19],[1,83,148],[1,67,130],[1,67,128],[0,126,772],[3,0,8],[3,9,30],[1,23,30],[2,11,20],[3,14,44],[2,74,90],[2,252,268],[2,39,49],[2,88,99],[2,47,59],[2,57,71]], t[S]),
};
const libs = {"../../wgsl/codec/octahedral": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const pmremInit = getSymbol("pmremInit");
