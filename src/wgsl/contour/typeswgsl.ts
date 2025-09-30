/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("IndirectDrawMetaAtomic IndirectDrawMeta types symbols visibles symbol flags name export attr vertexCount u32 type instanceCount atomic<u32> firstVertex firstInstance dispatchCount _unused1 _unused2 generationIndex nextVertexIndex members struct exports atomic".split(' '));
const t = {[_(2)]:_([0,1]),[_(3)]:_([0,1]),[_(4)]:_([0,1]),[_(24)]:[{"at":0,[_(5)]:_(0),[_(6)]:1,[_(23)]:{[_(7)]:_(0),[_(9)]:_([8]),[_(22)]:[{[_(7)]:_(10),[_(12)]:_(11)},{[_(7)]:_(13),[_(12)]:_(14)},{[_(7)]:_(15),[_(12)]:_(11)},{[_(7)]:_(16),[_(12)]:_(11)},{[_(7)]:_(17),[_(12)]:_(14)},{[_(7)]:_(18),[_(12)]:_(11)},{[_(7)]:_(19),[_(12)]:_(11)},{[_(7)]:_(20),[_(12)]:_(11)},{[_(7)]:_(21),[_(12)]:_(14)}]}},{"at":331,[_(5)]:_(1),[_(6)]:1,[_(23)]:{[_(7)]:_(1),[_(9)]:_([8]),[_(22)]:[{[_(7)]:_(10),[_(12)]:_(11)},{[_(7)]:_(13),[_(12)]:_(11)},{[_(7)]:_(15),[_(12)]:_(11)},{[_(7)]:_(16),[_(12)]:_(11)},{[_(7)]:_(17),[_(12)]:_(11)},{[_(7)]:_(18),[_(12)]:_(11)},{[_(7)]:_(19),[_(12)]:_(11)},{[_(7)]:_(20),[_(12)]:_(11)},{[_(7)]:_(21),[_(12)]:_(11)}]}}]};
const data = {
  "name": "contour/types",
  "code": _(["@",8," ",23," ",0," {\r\n  // Build indirect draw call\r\n  ",10,": u32,\r\n  ",13,": ",14,",\r\n  ",15,": u32,\r\n  ",16,": u32,\r\n\r\n  // Vertex dispatch state\r\n  ",17,": ",14,",\r\n  ",18,": u32,\r\n  ",19,": u32,\r\n  ",20,": u32,\r\n\r\n  ",21,": ",14,",\r\n};\r\n\r\n@",8," ",23," ",1," {\r\n  // Build indirect draw call\r\n  ",10,": u32,\r\n  ",13,": u32,\r\n  ",15,": u32,\r\n  ",16,": u32,\r\n\r\n  // Vertex dispatch state\r\n  ",17,": u32,\r\n  ",18,": u32,\r\n  ",19,": u32,\r\n  ",20,": u32,\r\n\r\n  ",21,": u32,\r\n};"]).join(''),
  "hash": 1562538285429488,
  "table": t,
  "shake": [[0,[0]],[331,[1]]],
  "tree": decompressAST([[0,0,326],[1,0,7],[2,15,37],[0,316,612],[1,0,7],[2,15,31]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const IndirectDrawMetaAtomic = getSymbol("IndirectDrawMetaAtomic");
export const IndirectDrawMeta = getSymbol("IndirectDrawMeta");
