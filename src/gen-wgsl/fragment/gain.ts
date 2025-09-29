import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getGain","gainColor"],"visibles":["gainColor"],"externals":[{"at":0,"symbol":"getGain","flags":2,"func":{"name":"getGain","type":"f32","attr":["link"]}}],"exports":[{"at":30,"symbol":"gainColor","flags":1,"func":{"name":"gainColor","type":"vec4<f32>","attr":["export"],"parameters":[{"name":"color","type":"vec4<f32>"}],"identifiers":["getGain"]}}],"linkable":{"getGain":true}}; const data = {
  "name": "gain",
  "code": "@link fn getGain() -> f32;\r\n\r\n@export fn gainColor(color: vec4<f32>) -> vec4<f32> {\r\n  var rgb = color.rgb * getGain();\r\n  if (IS_OPAQUE) { return vec4<f32>(rgb, 1.0); }\r\n  else { return vec4<f32>(rgb * getGain(), color.a); }\r\n};\r\n",
  "hash": 8961349974208176,
  "table": t,
  "shake": [[0,[0,1]],[30,[1]]],
  "tree": decompressAST([[1,0,25],[0,30,228],[1,0,7],[2,11,20],[2,10,15],[2,40,43],[2,6,11],[2,6,9],[2,6,13],[2,18,27],[2,30,33],[2,40,43],[2,6,13],[2,11,16],[2,6,7]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const gainColor = getSymbol("gainColor");
/* __WGSL_LOADER_GENERATED */