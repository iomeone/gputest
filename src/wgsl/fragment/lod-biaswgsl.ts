import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getTexture","getLODBias","getLODBiasedTexture"],"visibles":["getLODBiasedTexture"],"externals":[{"at":0,"symbol":"getTexture","flags":2,"func":{"name":"getTexture","type":"vec4<f32>","attr":["link"],"parameters":[{"name":"uv","type":"vec2<f32>"},{"name":"bias","type":"f32"}]}},{"at":65,"symbol":"getLODBias","flags":6,"func":{"name":"getLODBias","type":"f32","attr":["optional","link"]}}],"exports":[{"at":123,"symbol":"getLODBiasedTexture","flags":1,"func":{"name":"getLODBiasedTexture","type":"vec4<f32>","attr":["export"],"parameters":[{"name":"uv","type":"vec2<f32>"}],"identifiers":["getTexture","getLODBias"]}}],"linkable":{"getTexture":true,"getLODBias":true}}; const data = {
  "name": "lod-bias",
  "code": "@link fn getTexture(uv: vec2<f32>, bias: f32) -> vec4<f32> {}\r\n\r\n@optional @link fn getLODBias() -> f32 { return 0.0; }\r\n\r\n@export fn getLODBiasedTexture(uv: vec2<f32>) -> vec4<f32> {\r\n  return getTexture(uv, getLODBias());\r\n};\r\n",
  "hash": 1378858834687148,
  "table": t,
  "shake": [[0,[0,2]],[65,[1,2]],[123,[2]]],
  "tree": decompressAST([[1,0,61],[4,65,119,1],[1,0,9],[1,10,15],[2,9,19],[0,39,142],[1,0,7],[2,11,30],[2,20,22],[2,40,50],[2,11,13],[2,4,14]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getLODBiasedTexture = getSymbol("getLODBiasedTexture");
/* __WGSL_LOADER_GENERATED */