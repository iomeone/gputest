import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
const data = {
    "name": "masked",
    "code": "@external fn getMask(uv: vec2<f32>) -> f32;\r\n@external fn getTexture(uv: vec2<f32>) -> vec4<f32>;\r\n\r\n@export fn getMaskedFragment(color: vec4<f32>, uv: vec2<f32>) -> vec4<f32> {\r\n  var c = color;\r\n  c = c * getMask(uv);\r\n  c = c * getTexture(uv);\r\n  return c;\r\n}\r\n",
    "table": {"hash":"9d9b20s44d","symbols":["getMask","getTexture","getMaskedFragment"],"visibles":["getMaskedFragment"],"declarations":[{"at":0,"symbol":"getMask","flags":2,"func":{"name":"getMask","type":{"name":"f32"},"attributes":[{"name":"external"}],"parameters":[{"name":"uv","type":{"name":"vec2","args":[{"name":"f32"}]}}],"identifiers":[]}},{"at":45,"symbol":"getTexture","flags":2,"func":{"name":"getTexture","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"external"}],"parameters":[{"name":"uv","type":{"name":"vec2","args":[{"name":"f32"}]}}],"identifiers":[]}},{"at":101,"symbol":"getMaskedFragment","flags":1,"func":{"name":"getMaskedFragment","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"export"}],"parameters":[{"name":"color","type":{"name":"vec4","args":[{"name":"f32"}]}},{"name":"uv","type":{"name":"vec2","args":[{"name":"f32"}]}}],"identifiers":["getMask","getTexture"]}}],"externals":[{"at":0,"symbol":"getMask","flags":2,"func":{"name":"getMask","type":{"name":"f32"},"attributes":[{"name":"external"}],"parameters":[{"name":"uv","type":{"name":"vec2","args":[{"name":"f32"}]}}],"identifiers":[]}},{"at":45,"symbol":"getTexture","flags":2,"func":{"name":"getTexture","type":{"name":"vec4","args":[{"name":"f32"}]},"attributes":[{"name":"external"}],"parameters":[{"name":"uv","type":{"name":"vec2","args":[{"name":"f32"}]}}],"identifiers":[]}}]},
    "shake": [[0,["getMask","getMaskedFragment"]],[45,["getTexture","getMaskedFragment"]],[101,["getMaskedFragment"]]],
    "tree": decompressAST([["Skip",0,42],["Skip",45,96],["Shake",101,262],["Skip",101,108],["Id",112,129],["Id",130,135],["Id",148,150],["Id",185,186],["Id",189,194],["Id",199,200],["Id",203,204],["Id",207,214],["Id",215,217],["Id",223,224],["Id",227,228],["Id",231,241],["Id",242,244],["Id",257,258]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getMaskedFragment = getSymbol("getMaskedFragment");
/* __WGSL_LOADER_GENERATED */