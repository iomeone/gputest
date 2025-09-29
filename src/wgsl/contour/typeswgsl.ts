import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["IndirectDrawMetaAtomic","IndirectDrawMeta"],"visibles":["IndirectDrawMetaAtomic","IndirectDrawMeta"],"exports":[{"at":0,"symbol":"IndirectDrawMetaAtomic","flags":1,"struct":{"name":"IndirectDrawMetaAtomic","attr":["export"],"members":[{"name":"vertexCount","type":"u32"},{"name":"instanceCount","type":"atomic<u32>"},{"name":"firstVertex","type":"u32"},{"name":"firstInstance","type":"u32"},{"name":"dispatchCount","type":"atomic<u32>"},{"name":"_unused1","type":"u32"},{"name":"_unused2","type":"u32"},{"name":"generationIndex","type":"u32"},{"name":"nextVertexIndex","type":"atomic<u32>"}]}},{"at":331,"symbol":"IndirectDrawMeta","flags":1,"struct":{"name":"IndirectDrawMeta","attr":["export"],"members":[{"name":"vertexCount","type":"u32"},{"name":"instanceCount","type":"u32"},{"name":"firstVertex","type":"u32"},{"name":"firstInstance","type":"u32"},{"name":"dispatchCount","type":"u32"},{"name":"_unused1","type":"u32"},{"name":"_unused2","type":"u32"},{"name":"generationIndex","type":"u32"},{"name":"nextVertexIndex","type":"u32"}]}}]}; const data = {
  "name": "types",
  "code": "@export struct IndirectDrawMetaAtomic {\r\n  // Build indirect draw call\r\n  vertexCount: u32,\r\n  instanceCount: atomic<u32>,\r\n  firstVertex: u32,\r\n  firstInstance: u32,\r\n\r\n  // Vertex dispatch state\r\n  dispatchCount: atomic<u32>,\r\n  _unused1: u32,\r\n  _unused2: u32,\r\n  generationIndex: u32,\r\n\r\n  nextVertexIndex: atomic<u32>,\r\n};\r\n\r\n@export struct IndirectDrawMeta {\r\n  // Build indirect draw call\r\n  vertexCount: u32,\r\n  instanceCount: u32,\r\n  firstVertex: u32,\r\n  firstInstance: u32,\r\n\r\n  // Vertex dispatch state\r\n  dispatchCount: u32,\r\n  _unused1: u32,\r\n  _unused2: u32,\r\n  generationIndex: u32,\r\n\r\n  nextVertexIndex: u32,\r\n};\r\n",
  "hash": 6877653613342016,
  "table": t,
  "shake": [[0,[0]],[331,[1]]],
  "tree": decompressAST([[0,0,326],[1,0,7],[2,15,37],[2,59,70],[2,21,34],[2,31,42],[2,21,34],[2,53,66],[2,31,39],[2,18,26],[2,18,33],[2,27,42],[0,37,333],[1,0,7],[2,15,31],[2,53,64],[2,21,34],[2,23,34],[2,21,34],[2,53,66],[2,23,31],[2,18,26],[2,18,33],[2,27,42]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const IndirectDrawMetaAtomic = getSymbol("IndirectDrawMetaAtomic");
export const IndirectDrawMeta = getSymbol("IndirectDrawMeta");
/* __WGSL_LOADER_GENERATED */