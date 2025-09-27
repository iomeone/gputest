import {parseBundle} from "../../shader";
import {decompressAST} from "../../shader/wgsl";
const data = {
    "name": "face",
    "code": "// segments\r\n//\r\n// .-----.\r\n// |     |\r\n// .--.--.\r\n//\r\n// 1 2 3 0 0\r\n//\r\n// triangles:\r\n// [0 1 2]\r\n// [0 2 3]\r\n// [0 3 4]\r\n\r\n// detail 1 = 1 tri\r\n@optional @link fn getFaceDetail() -> i32 { return FACE_DETAIL; }\r\n@export fn getFaceSegment(index: u32) -> i32 {\r\n  let n = u32(getFaceDetail() + 2);\r\n  let i = index % n;\r\n  if (i + 2u >= n) return 0;\r\n  return i + 1;\r\n};\r\n",
    "hash": 2771272933326481,
    "table": {"symbols":["getFaceDetail","getFaceSegment"],"visibles":["getFaceSegment"],"externals":[{"at":149,"symbol":"getFaceDetail","flags":6,"func":{"name":"getFaceDetail","type":{"name":"i32"},"attributes":[{"name":"optional"},{"name":"link"}],"identifiers":[]}}],"exports":[{"at":216,"symbol":"getFaceSegment","flags":1,"func":{"name":"getFaceSegment","type":{"name":"i32"},"attributes":[{"name":"export"}],"parameters":[{"name":"index","type":{"name":"u32"}}],"identifiers":["getFaceDetail"]}}],"declarations":[{"at":149,"symbol":"getFaceDetail","flags":6,"func":{"name":"getFaceDetail","type":{"name":"i32"},"attributes":[{"name":"optional"},{"name":"link"}],"identifiers":[]}},{"at":216,"symbol":"getFaceSegment","flags":1,"func":{"name":"getFaceSegment","type":{"name":"i32"},"attributes":[{"name":"export"}],"parameters":[{"name":"index","type":{"name":"u32"}}],"identifiers":["getFaceDetail"]}}]},
    "shake": [[149,["getFaceDetail","getFaceSegment"]],[216,["getFaceSegment"]]],
    "tree": decompressAST([["Opt",149,214,"getFaceDetail"],["Skip",149,158],["Skip",159,164],["Id",168,181],["Id",200,211],["Shake",216,371],["Skip",216,223],["Id",227,241],["Id",242,247],["Id",270,271],["Id",278,291],["Id",307,308],["Id",311,316],["Id",319,320],["Id",329,330],["Id",339,340],["Id",362,363]]),
  };
const libs = {};
const getSymbol = (entry) => ({module: data, libs, entry});
export default getSymbol();
export const getFaceSegment = getSymbol("getFaceSegment");
/* __WGSL_LOADER_GENERATED */