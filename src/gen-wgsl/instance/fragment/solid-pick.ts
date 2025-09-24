import {parseBundle} from "../../../shader";
import {decompressAST} from "../../../shader/wgsl";
import m0 from "../../../gen-wgsl/use/picking";
const data = {
    "name": "solid-pick",
    "code": "use '../../../wgsl/use/picking'::{ getPickingColor };\r\n\r\n@stage(fragment)\r\nfn main(\r\n  @location(0) @interpolate(flat) fragIndex: u32,\r\n) -> @location(0) vec4<u32> {\r\n  return getPickingColor(fragIndex);\r\n}\r\n\r\n",
    "table": {"hash":"ryex3iiwst","symbols":["main"],"modules":[{"at":0,"name":"../../../wgsl/use/picking","symbols":["getPickingColor"],"imports":[{"name":"getPickingColor","imported":"getPickingColor"}]}],"declarations":[{"at":57,"symbol":"main","flags":0,"func":{"name":"main","type":{"name":"vec4","args":[{"name":"u32"}],"attributes":[{"name":"location","args":["0"]}]},"attributes":[{"name":"stage","args":["fragment"]}],"parameters":[{"name":"fragIndex","type":{"name":"u32"},"attributes":[{"name":"location","args":["0"]},{"name":"interpolate","args":["flat"]}]}],"identifiers":[]}}]},
    "shake": [[57,["main"]]],
    "tree": decompressAST([["Skip",0,52],["Shake",57,206],["Attr",57,73],["Id",58,63],["Id",64,72],["Id",78,82],["Attr",87,99],["Id",88,96],["Attr",100,118],["Id",101,112],["Id",113,117],["Id",119,128],["Attr",141,153],["Id",142,150],["Id",176,191],["Id",192,201]]),
  };
const libs = {"../../../wgsl/use/picking": m0};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
/* __WGSL_LOADER_GENERATED */