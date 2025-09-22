import { decompressAST } from "../../../shader/transform/ast";
const data = {
  "name": "strip",
  "code": "#pragma export\r\nivec2 getStripIndex(int vertex) {\r\n  int x = vertex >> 1;\r\n  int y = vertex & 1;\r\n  return ivec2(x, y);\r\n}\r\n\r\n#pragma export\r\nvec2 getStripUV(int vertex) {\r\n  return vec2(getStripIndex(vertex));\r\n}\r\n",
  "table": {"hash":"mlfhplj8ee","symbols":["getStripIndex","getStripUV"],"visibles":["getStripIndex","getStripUV"],"globals":[],"externals":[],"modules":[],"functions":[{"at":16,"symbols":["getStripIndex"],"identifiers":[],"flags":1,"prototype":{"name":"getStripIndex","type":{"name":"ivec2","qualifiers":[]},"parameters":["int","vertex"]}},{"at":142,"symbols":["getStripUV"],"identifiers":["getStripIndex"],"flags":1,"prototype":{"name":"getStripUV","type":{"name":"vec2","qualifiers":[]},"parameters":["int","vertex"]}}],"declarations":[]},
  "shake": [[16,["getStripIndex","getStripUV"]],[142,["getStripUV"]]],
  "tree": decompressAST([["Skip",0,15],["Shake",16,122],["Id",22,35],["Id",40,46],["Id",57,58],["Id",61,67],["Id",81,82],["Id",85,91],["Id",113,114],["Id",116,117],["Skip",126,141],["Shake",142,213],["Id",147,157],["Id",162,168],["Id",187,200],["Id",201,207]])
};
const libs = {  };
const getSymbol = (entry?: string) => ({ module: data, libs, entry });
export default getSymbol();
export const getStripIndex = getSymbol("getStripIndex");
export const getStripUV = getSymbol("getStripUV");
