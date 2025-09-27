import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
const data = {
    "name": "interleave",
    "code": "@optional @link fn getOffset() -> u32 { return 0u };\r\n@optional @link fn getSize() -> u32 { return 1u };\r\n\r\n@export fn getIndex(i: u32) -> u32 {\r\n  return i * getSize() + getOffset();\r\n}\r\n",
    "hash": 8410379252103567,
    "table": {"symbols":["getOffset","getSize","getIndex"],"visibles":["getIndex"],"externals":[{"at":0,"symbol":"getOffset","flags":6,"func":{"name":"getOffset","type":{"name":"u32"},"attributes":[{"name":"optional"},{"name":"link"}],"identifiers":[]}},{"at":54,"symbol":"getSize","flags":6,"func":{"name":"getSize","type":{"name":"u32"},"attributes":[{"name":"optional"},{"name":"link"}],"identifiers":[]}}],"exports":[{"at":108,"symbol":"getIndex","flags":1,"func":{"name":"getIndex","type":{"name":"u32"},"attributes":[{"name":"export"}],"parameters":[{"name":"i","type":{"name":"u32"}}],"identifiers":["getSize","getOffset"]}}],"declarations":[{"at":0,"symbol":"getOffset","flags":6,"func":{"name":"getOffset","type":{"name":"u32"},"attributes":[{"name":"optional"},{"name":"link"}],"identifiers":[]}},{"at":54,"symbol":"getSize","flags":6,"func":{"name":"getSize","type":{"name":"u32"},"attributes":[{"name":"optional"},{"name":"link"}],"identifiers":[]}},{"at":108,"symbol":"getIndex","flags":1,"func":{"name":"getIndex","type":{"name":"u32"},"attributes":[{"name":"export"}],"parameters":[{"name":"i","type":{"name":"u32"}}],"identifiers":["getSize","getOffset"]}}]},
    "shake": [[0,["getOffset","getIndex"]],[54,["getSize","getIndex"]],[108,["getIndex"]]],
    "tree": decompressAST([["Opt",0,51,"getOffset"],["Skip",0,9],["Skip",10,15],["Id",19,28],["Opt",54,103,"getSize"],["Skip",54,63],["Skip",64,69],["Id",73,80],["Shake",108,186],["Skip",108,115],["Id",119,127],["Id",128,129],["Id",155,156],["Id",159,166],["Id",171,180]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getIndex = getSymbol("getIndex");
/* __WGSL_LOADER_GENERATED */