import {parseBundle} from "../../../shader";
import {decompressAST} from "../../../shader/wgsl";
const data = {
    "name": "pick",
    "code": "@fragment\r\nfn main(\r\n  @location(0) @interpolate(flat) fragId: u32,\r\n  @location(1) @interpolate(flat) fragIndex: u32,\r\n) -> @location(0) vec4<u32> {\r\n  return vec4<u32>(fragId, fragIndex, 0u, 0u);\r\n}\r\n\r\n",
    "hash": 1025979327928500,
    "table": {"symbols":["main"],"visibles":["main"],"exports":[{"at":0,"symbol":"main","flags":1,"func":{"name":"main","type":{"name":"vec4","args":[{"name":"u32"}],"attributes":[{"name":"location","args":["0"]}]},"attributes":[{"name":"fragment"}],"parameters":[{"name":"fragId","type":{"name":"u32"},"attributes":[{"name":"location","args":["0"]},{"name":"interpolate","args":["flat"]}]},{"name":"fragIndex","type":{"name":"u32"},"attributes":[{"name":"location","args":["1"]},{"name":"interpolate","args":["flat"]}]}],"identifiers":[]}}],"declarations":[{"at":0,"symbol":"main","flags":1,"func":{"name":"main","type":{"name":"vec4","args":[{"name":"u32"}],"attributes":[{"name":"location","args":["0"]}]},"attributes":[{"name":"fragment"}],"parameters":[{"name":"fragId","type":{"name":"u32"},"attributes":[{"name":"location","args":["0"]},{"name":"interpolate","args":["flat"]}]},{"name":"fragIndex","type":{"name":"u32"},"attributes":[{"name":"location","args":["1"]},{"name":"interpolate","args":["flat"]}]}],"identifiers":[]}}]},
    "shake": [[0,["main"]]],
    "tree": decompressAST([["Shake",0,200],["Attr",0,9],["Id",1,9],["Id",14,18],["Attr",23,35],["Id",24,32],["Attr",36,54],["Id",37,48],["Id",49,53],["Id",55,61],["Attr",71,83],["Id",72,80],["Attr",84,102],["Id",85,96],["Id",97,101],["Id",103,112],["Attr",125,137],["Id",126,134],["Id",170,176],["Id",178,187]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const main = getSymbol("main");
/* __WGSL_LOADER_GENERATED */