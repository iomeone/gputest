/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("sourceCommand destinationCommand main symbols visibles symbol flags name array<u32> type link attr qual variable externals void compute workgroup_size(1) identifiers func exports linkable sourceCommand destinationCommand vertexCount instanceCount".split(' '));
const t = {[_(3)]:_([0,1,2]),[_(4)]:_([2]),[_(14)]:[{"at":0,[_(5)]:_(0),[_(6)]:2,[_(13)]:{[_(7)]:_(0),[_(9)]:_(8),[_(11)]:_([10]),[_(12)]:"<storage, read>"}},{"at":59,[_(5)]:_(1),[_(6)]:2,[_(13)]:{[_(7)]:_(1),[_(9)]:_(8),[_(11)]:_([10]),[_(12)]:"<storage, read_write>"}}],[_(20)]:[{"at":125,[_(5)]:_(2),[_(6)]:1,[_(19)]:{[_(7)]:_(2),[_(9)]:_(15),[_(11)]:_([16,17]),[_(18)]:_([0,1])}}],[_(21)]:{[_(0)]:true,[_(1)]:true}};
const data = {
  "name": "wireframe/wireframe-indirect",
  "code": _(["@",10," var<storage, read>       ",0,": ",8,";\r\n@",10," var<storage, read_write> ",1,": ",8,";\r\n\r\n@",16," @",17,"\r\nfn ",2,"() {\r\n  let ",24," = ",0,"[0];\r\n  let ",25," = ",0,"[1];\r\n\r\n  if (isTriangleStrip) {\r\n    let edges = (",24," - 2) * 2 + 1;\r\n    ",1,"[0] = 4;\r\n    ",1,"[1] = edges * ",25,";\r\n    ",1,"[64] = edges;\r\n  }\r\n  else {\r\n    ",1,"[0] = 18;\r\n    ",1,"[1] = ",24," * ",25,";\r\n    ",1,"[64] = ",24,";\r\n  }\r\n}"]).join(''),
  "hash": 4149607233669191,
  "table": t,
  "shake": [[0,[0,2]],[59,[1,2]],[125,[2]]],
  "tree": decompressAST([[1,0,57],[1,59,121],[0,66,536],[3,0,8],[3,9,27],[2,23,27],[2,30,43],[2,41,54],[2,95,113],[2,32,50],[2,52,70],[2,52,70],[2,33,51],[2,58,76]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
