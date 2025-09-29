import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getLineDetail","getAnchorStart","getAnchorEnd","getLineTrim"],"visibles":["getLineTrim"],"externals":[{"at":92,"symbol":"getLineDetail","flags":6,"func":{"name":"getLineDetail","type":"i32","attr":["optional","link"]}},{"at":159,"symbol":"getAnchorStart","flags":6,"func":{"name":"getAnchorStart","type":"i32","attr":["optional","link"]}},{"at":228,"symbol":"getAnchorEnd","flags":6,"func":{"name":"getAnchorEnd","type":"i32","attr":["optional","link"]}}],"exports":[{"at":295,"symbol":"getLineTrim","flags":1,"func":{"name":"getLineTrim","type":"vec4<u32>","attr":["export"],"parameters":[{"name":"index","type":"u32"}],"identifiers":["getAnchorStart","getAnchorEnd","getLineDetail"]}}],"linkable":{"getLineDetail":true,"getAnchorStart":true,"getAnchorEnd":true}}; const data = {
  "name": "trim",
  "code": "// trim\r\n//\r\n// o--o--o  o--o--o--o\r\n// \r\n// 0  0  0  3  3  3  3\r\n// 2  2  2  6  6  6  6\r\n\r\n@optional @link fn getLineDetail() -> i32 { return LINE_DETAIL; }\r\n@optional @link fn getAnchorStart() -> i32 { return ANCHOR_START; }\r\n@optional @link fn getAnchorEnd() -> i32 { return ANCHOR_END; }\r\n\r\n@export fn getLineTrim(index: u32) -> vec4<u32> {\r\n  let s = getAnchorStart();\r\n  let e = getAnchorEnd();\r\n\r\n  let n = u32(getLineDetail() + 1);\r\n\r\n  let i = index / n;\r\n  let d = index % n;\r\n  \r\n  let start = i * n;\r\n  let end = start + n - 1u;\r\n\r\n  var bits = 0u;\r\n  if (s != 0) { bits += 1u; }\r\n  if (e != 0) { bits += 2u; }\r\n\r\n  return vec4<u32>(start, end, bits, 0u);\r\n};\r\n",
  "hash": 7929011045745920,
  "table": t,
  "shake": [[92,[0,3]],[159,[1,3]],[228,[2,3]],[295,[3]]],
  "tree": decompressAST([[4,92,157,0],[1,0,9],[1,10,15],[2,9,22],[2,32,43],[4,16,83,1],[1,0,9],[1,10,15],[2,9,23],[2,33,45],[4,17,80,2],[1,0,9],[1,10,15],[2,9,21],[2,31,41],[0,17,392],[1,0,7],[2,11,22],[2,12,17],[2,34,35],[2,4,18],[2,25,26],[2,4,16],[2,25,26],[2,8,21],[2,31,32],[2,4,9],[2,8,9],[2,10,11],[2,4,9],[2,8,9],[2,14,19],[2,8,9],[2,4,5],[2,10,13],[2,6,11],[2,8,9],[2,17,21],[2,18,19],[2,10,14],[2,21,22],[2,10,14],[2,36,41],[2,7,10],[2,5,9]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getLineTrim = getSymbol("getLineTrim");
/* __WGSL_LOADER_GENERATED */