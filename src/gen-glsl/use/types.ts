import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/glsl";
const data = {
    "name": "types",
    "code": "#pragma export\r\nstruct SolidVertex {\r\n  vec4 position;\r\n  vec4 color;\r\n  vec2 uv;\r\n};\r\n\r\n#pragma export\r\nstruct MeshVertex {\r\n  vec4 position;\r\n  vec3 normal;\r\n  vec4 color;\r\n  vec2 uv;\r\n};",
    "table": {"hash":"nrc0wfxrg0","symbols":["SolidVertex","MeshVertex"],"visibles":["SolidVertex","MeshVertex"],"declarations":[{"at":16,"symbols":["SolidVertex"],"identifiers":[],"flags":1,"variable":{"type":{"name":"SolidVertex","qualifiers":[],"members":[{"name":"position","type":{"name":"vec4"}},{"name":"color","type":{"name":"vec4"}},{"name":"uv","type":{"name":"vec2"}}]},"locals":[]}},{"at":105,"symbols":["MeshVertex"],"identifiers":[],"flags":1,"variable":{"type":{"name":"MeshVertex","qualifiers":[],"members":[{"name":"position","type":{"name":"vec4"}},{"name":"normal","type":{"name":"vec3"}},{"name":"color","type":{"name":"vec4"}},{"name":"uv","type":{"name":"vec2"}}]},"locals":[]}}]},
    "shake": [[16,["SolidVertex"]],[105,["MeshVertex"]]],
    "tree": decompressAST([["Skip",0,15],["Shake",16,85],["Id",23,34],["Id",45,53],["Id",63,68],["Id",78,80],["Skip",89,104],["Shake",105,189],["Id",112,122],["Id",133,141],["Id",151,157],["Id",167,172],["Id",182,184]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const SolidVertex = getSymbol("SolidVertex");
export const MeshVertex = getSymbol("MeshVertex");
/* __GLSL_LOADER_GENERATED */