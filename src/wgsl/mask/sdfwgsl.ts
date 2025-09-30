/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("circleSDF diamondSDF squareSDF triangleSDF upSDF downSDF leftSDF rightSDF symbols visibles symbol flags name f32 type export attr vec2<f32> parameters func identifiers exports export return triangleSDF".split(' '));
const t = {[_(8)]:_([0,1,2,3,4,5,6,7]),[_(9)]:_([0,1,2,3,4,5,6,7]),[_(21)]:[{"at":0,[_(10)]:_(0),[_(11)]:1,[_(19)]:{[_(12)]:_(0),[_(14)]:_(13),[_(16)]:_([15]),[_(18)]:[{[_(12)]:"uv",[_(14)]:_(17)}]}},{"at":107,[_(10)]:_(1),[_(11)]:1,[_(19)]:{[_(12)]:_(1),[_(14)]:_(13),[_(16)]:_([15]),[_(18)]:[{[_(12)]:"uv",[_(14)]:_(17)}]}},{"at":228,[_(10)]:_(2),[_(11)]:1,[_(19)]:{[_(12)]:_(2),[_(14)]:_(13),[_(16)]:_([15]),[_(18)]:[{[_(12)]:"uv",[_(14)]:_(17)}]}},{"at":350,[_(10)]:_(3),[_(11)]:1,[_(19)]:{[_(12)]:_(3),[_(14)]:_(13),[_(16)]:_([15]),[_(18)]:[{[_(12)]:"uv",[_(14)]:_(17)}]}},{"at":549,[_(10)]:_(4),[_(11)]:1,[_(19)]:{[_(12)]:_(4),[_(14)]:_(13),[_(16)]:_([15]),[_(18)]:[{[_(12)]:"uv",[_(14)]:_(17)}],[_(20)]:_([3])}},{"at":623,[_(10)]:_(5),[_(11)]:1,[_(19)]:{[_(12)]:_(5),[_(14)]:_(13),[_(16)]:_([15]),[_(18)]:[{[_(12)]:"uv",[_(14)]:_(17)}],[_(20)]:_([3])}},{"at":719,[_(10)]:_(6),[_(11)]:1,[_(19)]:{[_(12)]:_(6),[_(14)]:_(13),[_(16)]:_([15]),[_(18)]:[{[_(12)]:"uv",[_(14)]:_(17)}],[_(20)]:_([3])}},{"at":814,[_(10)]:_(7),[_(11)]:1,[_(19)]:{[_(12)]:_(7),[_(14)]:_(13),[_(16)]:_([15]),[_(18)]:[{[_(12)]:"uv",[_(14)]:_(17)}],[_(20)]:_([3])}}]};
const data = {
  "name": "mask/sdf",
  "code": _(["@",15," fn ",0,"(uv: ",17,") -> f32 {\r\n  let xy = uv * 2.0 - 1.0;\r\n  ",23," 1.0 - length(xy);\r\n}\r\n\r\n@",15," fn ",1,"(uv: ",17,") -> f32 {\r\n  let xy = uv * 2.0 - 1.0;\r\n  ",23," 1.0 - (abs(xy.x) + abs(xy.y));\r\n}\r\n\r\n@",15," fn ",2,"(uv: ",17,") -> f32 {\r\n  let xy = uv * 2.0 - 1.0;\r\n  ",23," 1.0 - max(abs(xy.x), abs(xy.y));\r\n}\r\n\r\n@",15," fn ",3,"(uv: ",17,") -> f32 {\r\n  let xy = uv * 2.0 - 1.0;\r\n  let a = xy.y - 0.5;\r\n  let b = dot(",17,"(abs(xy.x), xy.y), ",17,"(0.866, -0.5));\r\n  ",23," 1.0 - min(a, b);\r\n}\r\n\r\n@",15," fn ",4,"(uv: ",17,") -> f32 {\r\n  ",23," ",3,"(uv);\r\n}\r\n\r\n@",15," fn ",5,"(uv: ",17,") -> f32 {\r\n  ",23," ",3,"(",17,"(uv.x, -uv.y));\r\n}\r\n\r\n@",15," fn ",6,"(uv: ",17,") -> f32 {\r\n  ",23," ",3,"(",17,"(uv.y, uv.x));\r\n}\r\n\r\n@",15," fn ",7,"(uv: ",17,") -> f32 {\r\n  ",23," ",3,"(",17,"(-uv.y, uv.x));\r\n}"]).join(''),
  "hash": 6345430570565205,
  "table": t,
  "shake": [[0,[0]],[107,[1]],[228,[2]],[350,[3,4,5,6,7]],[549,[4]],[623,[5]],[719,[6]],[814,[7]]],
  "tree": decompressAST([[0,0,103],[1,0,7],[2,11,20],[0,96,213],[1,0,7],[2,11,21],[0,110,228],[1,0,7],[2,11,20],[0,111,306],[1,0,7],[2,11,22],[0,188,258],[1,0,7],[2,11,16],[2,40,51],[0,23,115],[1,0,7],[2,11,18],[2,42,53],[0,43,134],[1,0,7],[2,11,18],[2,42,53],[0,42,135],[1,0,7],[2,11,19],[2,43,54]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const circleSDF = getSymbol("circleSDF");
export const diamondSDF = getSymbol("diamondSDF");
export const squareSDF = getSymbol("squareSDF");
export const triangleSDF = getSymbol("triangleSDF");
export const upSDF = getSymbol("upSDF");
export const downSDF = getSymbol("downSDF");
export const leftSDF = getSymbol("leftSDF");
export const rightSDF = getSymbol("rightSDF");
