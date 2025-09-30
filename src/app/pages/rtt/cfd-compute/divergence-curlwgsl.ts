/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../../shader/wgsl";
import m0 from "../../../../wgsl/use/arraywgsl";
const {} = symbolDictionary;
const _ = decompressString("getSize velocityBuffer divergenceBuffer curlBuffer main symbols visibles ../../../../wgsl/use/array name sizeToModulus2 packIndex2 wrapIndex2 imported imports modules symbol flags vec2<u32> type link attr func array<vec4<f32>> <storage> qual variable array<f32> externals void compute globalId vec3<u32> builtin(global_invocation_id) parameters identifiers exports linkable packIndex2 wrapIndex2 storage velocityBuffer globalId fragmentId modulus center".split(' '));
const t = {[_(5)]:_([0,1,2,3,4]),[_(6)]:_([4]),[_(14)]:[{"at":0,[_(8)]:_(7),[_(5)]:_([9,10,11]),[_(13)]:[{[_(8)]:_(9),[_(12)]:_(9)},{[_(8)]:_(10),[_(12)]:_(10)},{[_(8)]:_(11),[_(12)]:_(11)}]}],[_(27)]:[{"at":81,[_(15)]:_(0),[_(16)]:2,[_(21)]:{[_(8)]:_(0),[_(18)]:_(17),[_(20)]:_([19])}},{"at":120,[_(15)]:_(1),[_(16)]:2,[_(25)]:{[_(8)]:_(1),[_(18)]:_(22),[_(20)]:_([19]),[_(24)]:_(23)}},{"at":176,[_(15)]:_(2),[_(16)]:2,[_(25)]:{[_(8)]:_(2),[_(18)]:_(26),[_(20)]:_([19]),[_(24)]:"<storage, read_write>"}},{"at":238,[_(15)]:_(3),[_(16)]:2,[_(25)]:{[_(8)]:_(3),[_(18)]:_(26),[_(20)]:_([19]),[_(24)]:"<storage, read_write>"}}],[_(35)]:[{"at":296,[_(15)]:_(4),[_(16)]:1,[_(21)]:{[_(8)]:_(4),[_(18)]:_(28),[_(20)]:_([29,"workgroup_size(8, 8)"]),[_(33)]:[{[_(8)]:_(30),[_(18)]:_(31),[_(20)]:_([32])}],[_(34)]:_([0,1,2,3])}}],[_(36)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true}};
const data = {
  "name": "cfd-compute/divergence-curl",
  "code": _(["use '",7,"'::{ ",9,", ",10,", ",11," };\r\n\r\n@",19," fn ",0,"() -> ",17," {};\r\n\r\n@",19," var",23," ",1,": ",22,";\r\n\r\n@",19," var<",39,", read_write> ",2,": ",26,";\r\n@",19," var<",39,", read_write> ",3,": ",26,";\r\n\r\n@",29," @workgroup_size(8, 8)\r\nfn ",4,"(\r\n  @",32," ",30,": ",31,",\r\n) {\r\n  let size = ",0,"();\r\n  if (any(",30,".xy >= size)) { return; }\r\n  let ",42," = ",30,".xy;\r\n\r\n  let ",43," = ",9,"(size);\r\n  let ",44," = ",10,"(",42,", ",43,");\r\n\r\n  let left   = ",10,"(",11,"(vec2<i32>(",42,") + vec2<i32>(-1, 0), size), ",43,");\r\n  let right  = ",10,"(",11,"(vec2<i32>(",42,") + vec2<i32>( 1, 0), size), ",43,");\r\n  let top    = ",10,"(",11,"(vec2<i32>(",42,") + vec2<i32>(0, -1), size), ",43,");\r\n  let bottom = ",10,"(",11,"(vec2<i32>(",42,") + vec2<i32>(0,  1), size), ",43,");\r\n\r\n  let vl = ",1,"[left];\r\n  let vr = ",1,"[right];\r\n  let vt = ",1,"[top];\r\n  let vb = ",1,"[bottom];\r\n\r\n  let ux1 = vl.x;\r\n  let ux2 = vr.x;\r\n  let vy1 = vt.y;\r\n  let vy2 = vb.y;\r\n  let div = -((ux2 - ux1) + (vy2 - vy1)) * .5;\r\n\r\n  let uy1 = vl.y;\r\n  let uy2 = vr.y;\r\n  let vx1 = vt.x;\r\n  let vx2 = vb.x;\r\n  let curl = -((uy2 - uy1) - (vx2 - vx1)) * .5;\r\n\r\n  ",2,"[",44,"] = div;\r\n  ",3,"[",44,"] = curl;\r\n}"]).join(''),
  "hash": 8834552678595123,
  "table": t,
  "shake": [[81,[0,4]],[120,[1,4]],[176,[2,4]],[238,[3,4]],[296,[4]]],
  "tree": decompressAST([[1,0,76],[1,81,115],[1,39,91],[1,56,116],[1,62,116],[0,58,1204],[3,0,8],[3,9,30],[2,26,30],[3,9,39],[2,71,78],[2,108,122],[2,38,48],[2,51,61],[2,11,21],[2,86,96],[2,11,21],[2,86,96],[2,11,21],[2,86,96],[2,11,21],[2,84,98],[2,34,48],[2,35,49],[2,33,47],[2,282,298],[2,35,45]], t[S]),
};
const libs = {"../../../../wgsl/use/array": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
