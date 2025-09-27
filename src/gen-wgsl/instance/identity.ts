import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
const data = {
    "name": "identity",
    "code": "@export fn getIndex(i: u32) -> { return i; }",
    "hash": 4563915245433996,
    "table": {"symbols":["getIndex"],"visibles":["getIndex"],"exports":[{"at":0,"symbol":"getIndex","flags":1,"func":{"name":"getIndex","type":{"name":"void"},"attributes":[{"name":"export"}],"parameters":[{"name":"i","type":{"name":"u32"}}],"identifiers":[]}}],"declarations":[{"at":0,"symbol":"getIndex","flags":1,"func":{"name":"getIndex","type":{"name":"void"},"attributes":[{"name":"export"}],"parameters":[{"name":"i","type":{"name":"u32"}}],"identifiers":[]}}]},
    "shake": [[0,["getIndex"]]],
    "tree": decompressAST([["Shake",0,44],["Skip",0,7],["Id",11,19],["Id",20,21],["Id",40,41]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getIndex = getSymbol("getIndex");
/* __WGSL_LOADER_GENERATED */