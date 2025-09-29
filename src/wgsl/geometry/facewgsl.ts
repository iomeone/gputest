import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getFaceDetail","getFaceSegment"],"visibles":["getFaceSegment"],"externals":[{"at":149,"symbol":"getFaceDetail","flags":6,"func":{"name":"getFaceDetail","type":"i32","attr":["optional","link"]}}],"exports":[{"at":216,"symbol":"getFaceSegment","flags":1,"func":{"name":"getFaceSegment","type":"i32","attr":["export"],"parameters":[{"name":"index","type":"u32"}],"identifiers":["getFaceDetail"]}}],"linkable":{"getFaceDetail":true}}; const data = {
  "name": "face",
  "code": "// segments\r\n//\r\n// .-----.\r\n// |     |\r\n// .--.--.\r\n//\r\n// 1 2 3 0 0\r\n//\r\n// triangles:\r\n// [0 1 2]\r\n// [0 2 3]\r\n// [0 3 4]\r\n\r\n// detail 1 = 1 tri\r\n@optional @link fn getFaceDetail() -> i32 { return FACE_DETAIL; }\r\n@export fn getFaceSegment(index: u32) -> i32 {\r\n  let n = u32(getFaceDetail() + 2);\r\n  let i = index % n;\r\n  if (i + 2u >= n) { return 0; }\r\n  return i + 1;\r\n};\r\n",
  "hash": 4844888905966072,
  "table": t,
  "shake": [[149,[0,1]],[216,[1]]],
  "tree": decompressAST([[4,149,214,0],[1,0,9],[1,10,15],[2,9,22],[2,32,43],[0,16,175],[1,0,7],[2,11,25],[2,15,20],[2,28,29],[2,8,21],[2,29,30],[2,4,9],[2,8,9],[2,10,11],[2,10,11],[2,27,28]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getFaceSegment = getSymbol("getFaceSegment");
/* __WGSL_LOADER_GENERATED */