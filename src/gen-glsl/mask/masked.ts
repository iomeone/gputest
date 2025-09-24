import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/glsl";
const data = {
    "name": "masked",
    "code": "float getMask(vec2);\r\nvec4 getTexture(vec2);\r\n\r\n#pragma export\r\nvec4 getMaskedFragment(vec4 color, vec2 uv) {\r\n  color *= getMask(uv);\r\n  color *= getTexture(uv);\r\n  return color;\r\n}",
    "table": {"hash":"caowkmmz4s","symbols":["getMaskedFragment","getMask","getTexture"],"visibles":["getMaskedFragment"],"externals":[{"at":0,"symbols":["getMask"],"identifiers":[],"flags":0,"prototype":{"name":"getMask","type":{"name":"float","qualifiers":[]},"parameters":["vec2"]}},{"at":22,"symbols":["getTexture"],"identifiers":[],"flags":0,"prototype":{"name":"getTexture","type":{"name":"vec4","qualifiers":[]},"parameters":["vec2"]}}],"functions":[{"at":64,"symbols":["getMaskedFragment"],"identifiers":["getMask","getTexture"],"flags":1,"prototype":{"name":"getMaskedFragment","type":{"name":"vec4","qualifiers":[]},"parameters":["vec4","color"]}}],"declarations":[{"at":0,"symbols":["getMask"],"identifiers":[],"flags":0,"prototype":{"name":"getMask","type":{"name":"float","qualifiers":[]},"parameters":["vec2"]}},{"at":22,"symbols":["getTexture"],"identifiers":[],"flags":0,"prototype":{"name":"getTexture","type":{"name":"vec4","qualifiers":[]},"parameters":["vec2"]}}]},
    "shake": [[0,["getMask","getMaskedFragment"]],[22,["getTexture","getMaskedFragment"]],[64,["getMaskedFragment"]]],
    "tree": decompressAST([["Shake",0,20],["Id",6,13],["Shake",22,44],["Id",27,37],["Skip",48,63],["Shake",64,182],["Id",69,86],["Id",92,97],["Id",104,106],["Id",113,118],["Id",122,129],["Id",130,132],["Id",138,143],["Id",147,157],["Id",158,160],["Id",173,178]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getMaskedFragment = getSymbol("getMaskedFragment");
/* __GLSL_LOADER_GENERATED */