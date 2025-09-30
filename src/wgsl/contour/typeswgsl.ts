/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("IndirectDrawMetaAtomic IndirectDrawMeta export vertexCount u32 instanceCount atomic<u32> firstVertex firstInstance dispatchCount _unused1 _unused2 generationIndex nextVertexIndex atomic".split(' '));
const table = {[Y]:_([0,1]),[S]:_([0,1]),[W]:_([0,1]),[E]:[{[A]:0,[R]:_(0),[G]:1,[U]:{[N]:_(0),[Z]:_([2]),[M]:[{[N]:_(3),[T]:_(4)},{[N]:_(5),[T]:_(6)},{[N]:_(7),[T]:_(4)},{[N]:_(8),[T]:_(4)},{[N]:_(9),[T]:_(6)},{[N]:_(10),[T]:_(4)},{[N]:_(11),[T]:_(4)},{[N]:_(12),[T]:_(4)},{[N]:_(13),[T]:_(6)}]}},{[A]:331,[R]:_(1),[G]:1,[U]:{[N]:_(1),[Z]:_([2]),[M]:[{[N]:_(3),[T]:_(4)},{[N]:_(5),[T]:_(4)},{[N]:_(7),[T]:_(4)},{[N]:_(8),[T]:_(4)},{[N]:_(9),[T]:_(4)},{[N]:_(10),[T]:_(4)},{[N]:_(11),[T]:_(4)},{[N]:_(12),[T]:_(4)},{[N]:_(13),[T]:_(4)}]}}]};
const data = {
  name: "contour/types.wgsl",
  code: _(["@",2," ",U," ",0," {\r\n  // Build indirect draw call\r\n  ",3,": u32,\r\n  ",5,": ",6,",\r\n  ",7,": u32,\r\n  ",8,": u32,\r\n\r\n  // Vertex dispatch state\r\n  ",9,": ",6,",\r\n  ",10,": u32,\r\n  ",11,": u32,\r\n  ",12,": u32,\r\n\r\n  ",13,": ",6,",\r\n};\r\n\r\n@",2," ",U," ",1," {\r\n  // Build indirect draw call\r\n  ",3,": u32,\r\n  ",5,": u32,\r\n  ",7,": u32,\r\n  ",8,": u32,\r\n\r\n  // Vertex dispatch state\r\n  ",9,": u32,\r\n  ",10,": u32,\r\n  ",11,": u32,\r\n  ",12,": u32,\r\n\r\n  ",13,": u32,\r\n};\n"]).join(''),
  hash: 0x582962b55923c,
  table,
  shake: [[0,[0]],[331,[1]]],
  tree: decompressAST([[0,0,326],[1,0,7],[2,15,37],[0,316,612],[1,0,7],[2,15,31]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const IndirectDrawMetaAtomic = getSymbol("IndirectDrawMetaAtomic");
export const IndirectDrawMeta = getSymbol("IndirectDrawMeta");
