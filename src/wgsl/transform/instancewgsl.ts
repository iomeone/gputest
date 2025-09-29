import {decompressAST, bindEntryPoint} from "../../shader/wgsl";
const t = {"symbols":["getIndirectTransformMatrix","getIndirectNormalMatrix","transformMatrix","normalMatrix","loadInstance","getTransformMatrix","getNormalMatrix"],"visibles":["loadInstance","getTransformMatrix","getNormalMatrix"],"externals":[{"at":0,"symbol":"getIndirectTransformMatrix","flags":2,"func":{"name":"getIndirectTransformMatrix","type":"mat4x4<f32>","attr":["link"],"parameters":[{"name":"i","type":"u32"}]}},{"at":61,"symbol":"getIndirectNormalMatrix","flags":2,"func":{"name":"getIndirectNormalMatrix","type":"mat3x3<f32>","attr":["link"],"parameters":[{"name":"i","type":"u32"}]}}],"exports":[{"at":208,"symbol":"loadInstance","flags":1,"func":{"name":"loadInstance","type":"void","attr":["export"],"parameters":[{"name":"i","type":"u32"}],"identifiers":["transformMatrix","getIndirectTransformMatrix","normalMatrix","getIndirectNormalMatrix"]}},{"at":346,"symbol":"getTransformMatrix","flags":1,"func":{"name":"getTransformMatrix","type":"mat4x4<f32>","attr":["export"],"identifiers":["transformMatrix"]}},{"at":422,"symbol":"getNormalMatrix","flags":1,"func":{"name":"getNormalMatrix","type":"mat3x3<f32>","attr":["export"],"identifiers":["normalMatrix"]}}],"linkable":{"getIndirectTransformMatrix":true,"getIndirectNormalMatrix":true}}; const data = {
  "name": "instance",
  "code": "@link fn getIndirectTransformMatrix(i: u32) -> mat4x4<f32>;\r\n@link fn getIndirectNormalMatrix(i: u32) -> mat3x3<f32>;\r\n\r\nvar<private> transformMatrix: mat4x4<f32>;\r\nvar<private> normalMatrix: mat3x3<f32>;\r\n\r\n@export fn loadInstance(i: u32) {\r\n  transformMatrix = getIndirectTransformMatrix(i);\r\n  normalMatrix = getIndirectNormalMatrix(i);\r\n}\r\n\r\n@export fn getTransformMatrix() -> mat4x4<f32> { return transformMatrix; }\r\n@export fn getNormalMatrix() -> mat3x3<f32> { return normalMatrix; }\r\n",
  "hash": 2549215462104710,
  "table": t,
  "shake": [[0,[0,4]],[61,[1,4]],[117,[2,4,5]],[163,[3,4,6]],[208,[4]],[346,[5]],[422,[6]]],
  "tree": decompressAST([[1,0,58],[1,61,116],[0,56,102],[2,17,32],[0,29,70],[2,15,27],[0,30,164],[1,0,7],[2,11,23],[2,13,14],[2,13,28],[2,18,44],[2,27,28],[2,7,19],[2,15,38],[2,24,25],[0,10,84],[1,0,7],[2,11,29],[2,45,60],[0,20,88],[1,0,7],[2,11,26],[2,42,54]], t.symbols),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const loadInstance = getSymbol("loadInstance");
export const getTransformMatrix = getSymbol("getTransformMatrix");
export const getNormalMatrix = getSymbol("getNormalMatrix");
/* __WGSL_LOADER_GENERATED */