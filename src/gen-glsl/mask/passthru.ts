import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/glsl";
const data = {
    "name": "passthru",
    "code": "#pragma export\r\nvec4 getPassThruFragment(vec4 color, vec2 uv) {\r\n  return color;\r\n}",
    "table": {"hash":"wqr66uu792","symbols":["getPassThruFragment"],"visibles":["getPassThruFragment"],"functions":[{"at":16,"symbols":["getPassThruFragment"],"identifiers":[],"flags":1,"prototype":{"name":"getPassThruFragment","type":{"name":"vec4","qualifiers":[]},"parameters":["vec4","color"]}}]},
    "shake": [[16,["getPassThruFragment"]]],
    "tree": decompressAST([["Skip",0,15],["Shake",16,83],["Id",21,40],["Id",46,51],["Id",58,60],["Id",74,79]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getPassThruFragment = getSymbol("getPassThruFragment");
/* __GLSL_LOADER_GENERATED */