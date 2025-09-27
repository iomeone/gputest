import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
const data = {
    "name": "segment",
    "code": "// segments\r\n//\r\n// o--o--o  o--o--o--o  o--o\r\n// 1  3  2  1  3  3  2  1  2\r\n\r\n@optional @link fn getLineDetail() -> i32 { return LINE_DETAIL; }\r\n@export fn getLineSegment(index: u32) -> i32 {\r\n  let n = u32(getLineDetail() + 1);\r\n  let i = index % n;\r\n  if (i == 0u) { return 1; }\r\n  if (i == n - 1u) { return 2; }\r\n  return 3;\r\n};\r\n",
    "hash": 2079632408189005,
    "table": {"symbols":["getLineDetail","getLineSegment"],"visibles":["getLineSegment"],"externals":[{"at":79,"symbol":"getLineDetail","flags":6,"func":{"name":"getLineDetail","type":{"name":"i32"},"attributes":[{"name":"optional"},{"name":"link"}],"identifiers":[]}}],"exports":[{"at":146,"symbol":"getLineSegment","flags":1,"func":{"name":"getLineSegment","type":{"name":"i32"},"attributes":[{"name":"export"}],"parameters":[{"name":"index","type":{"name":"u32"}}],"identifiers":["getLineDetail"]}}],"declarations":[{"at":79,"symbol":"getLineDetail","flags":6,"func":{"name":"getLineDetail","type":{"name":"i32"},"attributes":[{"name":"optional"},{"name":"link"}],"identifiers":[]}},{"at":146,"symbol":"getLineSegment","flags":1,"func":{"name":"getLineSegment","type":{"name":"i32"},"attributes":[{"name":"export"}],"parameters":[{"name":"index","type":{"name":"u32"}}],"identifiers":["getLineDetail"]}}]},
    "shake": [[79,["getLineDetail","getLineSegment"]],[146,["getLineSegment"]]],
    "tree": decompressAST([["Opt",79,144,"getLineDetail"],["Skip",79,88],["Skip",89,94],["Id",98,111],["Id",130,141],["Shake",146,331],["Skip",146,153],["Id",157,171],["Id",172,177],["Id",200,201],["Id",208,221],["Id",237,238],["Id",241,246],["Id",249,250],["Id",259,260],["Id",289,290],["Id",294,295]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getLineSegment = getSymbol("getLineSegment");
/* __WGSL_LOADER_GENERATED */