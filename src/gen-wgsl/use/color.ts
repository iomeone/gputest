import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
import m0 from "../../gen-wgsl/use/gamma";
const data = {
    "name": "color",
    "code": "use \"../../wgsl/use/gamma\"::{toLinear4};\r\n\r\n@export fn toColorSpace(color: vec4<f32>) -> vec4<f32> {\r\n  var out = color;\r\n  if (COLOR_SPACE == 1) { out = toLinear4(out); }\r\n  return out;\r\n}\r\n",
    "hash": "n90dvnowe6",
    "table": {"symbols":["toColorSpace"],"visibles":["toColorSpace"],"modules":[{"at":0,"name":"../../wgsl/use/gamma","symbols":["toLinear4"],"imports":[{"name":"toLinear4","imported":"toLinear4"}]}],"declarations":[{"at":44,"symbol":"toColorSpace","flags":1,"func":{"name":"toColorSpace","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"color","type":{"name":"vec4","args":[{"name":"f32"}]}}],"identifiers":[]}}]},
    "shake": [[44,["toColorSpace"]]],
    "tree": decompressAST([["Skip",0,39],["Shake",44,189],["Skip",44,51],["Id",55,67],["Id",68,73],["Id",108,111],["Id",114,119],["Id",128,139],["Id",148,151],["Id",154,163],["Id",164,167],["Id",182,185]]),
  };
const libs = {"../../wgsl/use/gamma": m0};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const toColorSpace = getSymbol("toColorSpace");
/* __WGSL_LOADER_GENERATED */