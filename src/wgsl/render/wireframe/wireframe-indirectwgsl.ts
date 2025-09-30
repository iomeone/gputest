/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("sourceCommand destinationCommand main array<u32> link void compute workgroup_size(1) sourceCommand destinationCommand vertexCount instanceCount".split(' '));
const table = {[S]:_([0,1,2]),[W]:_([2]),[X]:[{[A]:0,[R]:_(0),[G]:2,[V]:{[N]:_(0),[T]:_(3),[Z]:_([4]),[Q]:"<storage, read>"}},{[A]:59,[R]:_(1),[G]:2,[V]:{[N]:_(1),[T]:_(3),[Z]:_([4]),[Q]:"<storage, read_write>"}}],[E]:[{[A]:125,[R]:_(2),[G]:1,[F]:{[N]:_(2),[T]:_(5),[Z]:_([6,7]),[I]:_([0,1])}}],[L]:{[_(0)]:true,[_(1)]:true}};
const data = {
  name: "wireframe/wireframe-indirect.wgsl",
  code: _(["@",4," var<storage, read>       ",0,": ",3,";\r\n@",4," var<storage, read_write> ",1,": ",3,";\r\n\r\n@",6," @",7,"\r\nfn ",2,"() {\r\n  let ",10," = ",0,"[0];\r\n  let ",11," = ",0,"[1];\r\n\r\n  if (isTriangleStrip) {\r\n    let edges = (",10," - 2) * 2 + 1;\r\n    ",1,"[0] = 4;\r\n    ",1,"[1] = edges * ",11,";\r\n    ",1,"[64] = edges;\r\n  }\r\n  else {\r\n    ",1,"[0] = 18;\r\n    ",1,"[1] = ",10," * ",11,";\r\n    ",1,"[64] = ",10,";\r\n  }\r\n}\n"]).join(''),
  hash: 0x1b71b55b0783d0,
  table,
  shake: [[0,[0,2]],[59,[1,2]],[125,[2]]],
  tree: decompressAST([[1,0,57],[1,59,121],[0,66,536],[3,0,8],[3,9,27],[2,23,27],[2,30,43],[2,41,54],[2,95,113],[2,32,50],[2,52,70],[2,52,70],[2,33,51],[2,58,76]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const main = getSymbol("main");
