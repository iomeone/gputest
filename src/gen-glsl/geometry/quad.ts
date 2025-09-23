import {decompressAST} from "../../shader/glsl";
const data = {
    "name": "quad",
    "code": "const ivec2 QUAD[] = {\r\n  ivec2(0, 0),\r\n  ivec2(1, 0),\r\n  ivec2(0, 1),\r\n  ivec2(1, 1),\r\n};\r\n\r\n#pragma export\r\nivec2 getQuadIndex(int vertex) {\r\n  return QUAD[vertex];\r\n}\r\n\r\n#pragma export\r\nvec2 getQuadUV(int vertex) {\r\n  return vec2(getQuadIndex(vertex));\r\n}\r\n",
    "table": {"hash":"dbfa6l1ukd","symbols":["getQuadIndex","getQuadUV","QUAD"],"visibles":["getQuadIndex","getQuadUV"],"globals":[],"externals":[],"modules":[],"functions":[{"at":110,"symbols":["getQuadIndex"],"identifiers":["QUAD"],"flags":1,"prototype":{"name":"getQuadIndex","type":{"name":"ivec2","qualifiers":[]},"parameters":["int","vertex"]}},{"at":189,"symbols":["getQuadUV"],"identifiers":["getQuadIndex"],"flags":1,"prototype":{"name":"getQuadUV","type":{"name":"vec2","qualifiers":[]},"parameters":["int","vertex"]}}],"declarations":[{"at":0,"symbols":["QUAD"],"identifiers":[],"flags":0,"variable":{"type":{"name":"ivec2","qualifiers":["const"]},"locals":[{"name":"QUAD","expr":"ivec2(0, 0)"}]}}]},
    "shake": [[0,["QUAD","getQuadIndex","getQuadUV"]],[110,["getQuadIndex","getQuadUV"]],[189,["getQuadUV"]]],
    "tree": decompressAST([["Shake",0,90],["Id",12,16],["Skip",94,109],["Shake",110,169],["Id",116,128],["Id",133,139],["Id",153,157],["Id",158,164],["Skip",173,188],["Shake",189,258],["Id",194,203],["Id",208,214],["Id",233,245],["Id",246,252]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getQuadIndex = getSymbol("getQuadIndex");
export const getQuadUV = getSymbol("getQuadUV");
/* __GLSL_LOADER_GENERATED */