import {decompressAST, bindEntryPoint} from "../../../shader/wgsl";
import m0 from "../../../gen-wgsl/use/types";
const t = {"symbols":["getVertex","VertexOutput","main"],"visibles":["main"],"modules":[{"at":0,"name":"../../../wgsl/use/types","symbols":["LightVertex"],"imports":[{"name":"LightVertex","imported":"LightVertex"}]}],"externals":[{"at":51,"symbol":"getVertex","flags":2,"func":{"name":"getVertex","type":"LightVertex","attr":["link"],"parameters":[{"name":"i","type":"u32"}]}}],"exports":[{"at":300,"symbol":"main","flags":1,"func":{"name":"main","type":"VertexOutput","attr":["vertex"],"parameters":[{"name":"vertexIndex","type":"u32","attr":["builtin(vertex_index)"]},{"name":"instanceIndex","type":"u32","attr":["builtin(instance_index)"]}],"identifiers":["getVertex","VertexOutput"]}}],"linkable":{"getVertex":true}}; const data = {
  "name": "virtual-light",
  "code": "use '../../../wgsl/use/types'::{ LightVertex };\r\n\r\n@link fn getVertex(i: u32) -> LightVertex {};\r\n//@optional @link fn toColorSpace(c: vec4<f32>) -> vec4<f32> { return c; }\r\n\r\nstruct VertexOutput {\r\n  @builtin(position) position: vec4<f32>,\r\n  @location(0) @interpolate(flat) lightIndex: u32,\r\n};\r\n\r\n@vertex\r\nfn main(\r\n  @builtin(vertex_index) vertexIndex: u32,\r\n  @builtin(instance_index) instanceIndex: u32,\r\n) -> VertexOutput {\r\n  let v = getVertex(vertexIndex, instanceIndex);\r\n  let p = v.position;\r\n\r\n  return VertexOutput(\r\n    p,\r\n    v.index,\r\n  );\r\n}\r\n",
  "hash": 451632464075034,
  "table": t,
  "shake": [[51,[0,2]],[96,[1,2]],[300,[2]]],
  "tree": decompressAST([[1,0,46],[1,51,95],[0,45,244],[2,87,99],[3,18,36],[2,1,8],[2,8,16],[2,10,18],[3,24,36],[2,1,9],[3,12,30],[2,1,12],[2,12,16],[2,6,16],[0,24,284],[3,0,7],[2,1,7],[2,11,15],[3,9,31],[2,1,8],[2,8,20],[2,14,25],[3,21,45],[2,1,8],[2,8,22],[2,16,29],[2,26,38],[2,22,23],[2,4,13],[2,10,21],[2,13,26],[2,23,24],[2,4,5],[2,2,10],[2,22,34],[2,19,20],[2,8,9],[2,2,7]], t.symbols),
};
const libs = {"../../../wgsl/use/types": m0};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const main = getSymbol("main");
/* __WGSL_LOADER_GENERATED */