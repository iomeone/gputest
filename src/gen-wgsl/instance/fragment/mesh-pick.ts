import {parseBundle} from "../../../shader";
import {decompressAST} from "../../../shader/wgsl";
import m0 from "../../../gen-wgsl/use/picking";
const data = {
    "name": "mesh-pick",
    "code": "use '../../../wgsl/use/picking'::{ getPickingColor }\r\n\r\n//@group(1) @binding(0) var s: sampler;\r\n//@group(1) @binding(1) var t: texture_2d<f32>;\r\n\r\nstruct FragmentOutput {\r\n  @location(0) outColor: vec4<u32>;\r\n};\r\n\r\n@stage(fragment)\r\nfn main(\r\n  @location(0) @interpolate(flat) fragIndex: u32,\r\n) -> FragmentOutput {\r\n  var outColor = getPickingColor(fragIndex);\r\n\r\n  return FragmentOutput(outColor);\r\n}\r\n",
    "table": {"hash":"5c0y3mzmha","symbols":["FragmentOutput","main"],"modules":[{"at":0,"name":"../../../wgsl/use/picking","symbols":["getPickingColor"],"imports":[{"name":"getPickingColor","imported":"getPickingColor"}]}],"declarations":[{"at":52,"symbol":"FragmentOutput","flags":0,"struct":{"name":"FragmentOutput","members":[{"name":"outColor","type":{"name":"vec4","args":[{"name":"u32"}]},"attributes":[{"name":"location","args":["0"]}]}]}},{"at":216,"symbol":"main","flags":0,"func":{"name":"main","type":{"name":"FragmentOutput"},"attributes":[{"name":"stage","args":["fragment"]}],"parameters":[{"name":"fragIndex","type":{"name":"u32"},"attributes":[{"name":"location","args":["0"]},{"name":"interpolate","args":["flat"]}]}],"identifiers":["FragmentOutput"]}}]},
    "shake": [[52,["FragmentOutput","main"]],[216,["main"]]],
    "tree": decompressAST([["Skip",0,52],["Shake",52,211],["Id",155,169],["Attr",175,187],["Id",176,184],["Id",188,196],["Shake",216,403],["Attr",216,232],["Id",217,222],["Id",223,231],["Id",237,241],["Attr",246,258],["Id",247,255],["Attr",259,277],["Id",260,271],["Id",272,276],["Id",278,287],["Id",300,314],["Id",324,332],["Id",335,350],["Id",351,360],["Id",375,389],["Id",390,398]]),
  };
const libs = {"../../../wgsl/use/picking": m0};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
/* __WGSL_LOADER_GENERATED */