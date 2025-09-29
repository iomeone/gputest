import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getLineDetail","getLineSegment"],"visibles":["getLineSegment"],"externals":[{"at":79,"symbol":"getLineDetail","flags":6,"func":{"name":"getLineDetail","type":"i32","attr":["optional","link"]}}],"exports":[{"at":146,"symbol":"getLineSegment","flags":1,"func":{"name":"getLineSegment","type":"i32","attr":["export"],"parameters":[{"name":"index","type":"u32"}],"identifiers":["getLineDetail"]}}],"linkable":{"getLineDetail":true}}; const data = {
  "name": "segment",
  "code": "// segments\r\n//\r\n// o--o--o  o--o--o--o  o--o\r\n// 1  3  2  1  3  3  2  1  2\r\n\r\n@optional @link fn getLineDetail() -> i32 { return LINE_DETAIL; }\r\n@export fn getLineSegment(index: u32) -> i32 {\r\n  let n = u32(getLineDetail() + 1);\r\n  let i = index % n;\r\n  if (i == 0u) { return 1; }\r\n  if (i == n - 1u) { return 2; }\r\n  return 3;\r\n};\r\n",
  "hash": 2079632408189005,
  "table": t,
  "shake": [[79,[0,1]],[146,[1]]],
  "tree": decompressAST([[4,79,144,0],[1,0,9],[1,10,15],[2,9,22],[2,32,43],[0,16,201],[1,0,7],[2,11,25],[2,15,20],[2,28,29],[2,8,21],[2,29,30],[2,4,9],[2,8,9],[2,10,11],[2,30,31],[2,5,6]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getLineSegment = getSymbol("getLineSegment");
/* __WGSL_LOADER_GENERATED */