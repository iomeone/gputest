/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getIndirectTransformMatrix getIndirectNormalMatrix getInstanceMap transformMatrix normalMatrix loadInstance getTransformMatrix getNormalMatrix symbols visibles symbol flags name mat4x4<f32> type link attr u32 parameters func mat3x3<f32> optional externals void export identifiers exports linkable mat4x4 mat3x3 return transformMatrix normalMatrix export".split(' '));
const t = {[_(8)]:_([0,1,2,3,4,5,6,7]),[_(9)]:_([5,6,7]),[_(22)]:[{"at":0,[_(10)]:_(0),[_(11)]:2,[_(19)]:{[_(12)]:_(0),[_(14)]:_(13),[_(16)]:_([15]),[_(18)]:[{[_(12)]:"i",[_(14)]:_(17)}]}},{"at":61,[_(10)]:_(1),[_(11)]:2,[_(19)]:{[_(12)]:_(1),[_(14)]:_(20),[_(16)]:_([15]),[_(18)]:[{[_(12)]:"i",[_(14)]:_(17)}]}},{"at":121,[_(10)]:_(2),[_(11)]:6,[_(19)]:{[_(12)]:_(2),[_(14)]:_(17),[_(16)]:_([21,15]),[_(18)]:[{[_(12)]:"i",[_(14)]:_(17)}]}}],[_(26)]:[{"at":274,[_(10)]:_(5),[_(11)]:1,[_(19)]:{[_(12)]:_(5),[_(14)]:_(23),[_(16)]:_([24]),[_(18)]:[{[_(12)]:"i",[_(14)]:_(17)}],[_(25)]:_([2,3,0,4,1])}},{"at":454,[_(10)]:_(6),[_(11)]:1,[_(19)]:{[_(12)]:_(6),[_(14)]:_(13),[_(16)]:_([24]),[_(25)]:_([3])}},{"at":530,[_(10)]:_(7),[_(11)]:1,[_(19)]:{[_(12)]:_(7),[_(14)]:_(20),[_(16)]:_([24]),[_(25)]:_([4])}}],[_(27)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  "name": "transform/instance",
  "code": _(["@",15," fn ",0,"(i: u32) -> ",13,";\r\n@",15," fn ",1,"(i: u32) -> ",20,";\r\n\r\n@",21," @",15," fn ",2,"(i: u32) -> u32 { ",30," i; }\r\n\r\nvar<private> ",3,": ",13,";\r\nvar<private> ",4,": ",20,";\r\n\r\n@",24," fn ",5,"(i: u32) {\r\n  let index = ",2,"(i);\r\n  ",3," = ",0,"(index);\r\n  ",4," = ",1,"(index);\r\n}\r\n\r\n@",24," fn ",6,"() -> ",13," { ",30," ",3,"; }\r\n@",24," fn ",7,"() -> ",20," { ",30," ",4,"; }"]).join(''),
  "hash": 1898523073995839,
  "table": t,
  "shake": [[0,[0,5]],[61,[1,5]],[121,[2,5]],[183,[3,5,6]],[229,[4,5,7]],[274,[5]],[454,[6]],[530,[7]]],
  "tree": decompressAST([[1,0,58],[1,61,116],[4,60,122,2],[1,0,9],[1,10,15],[2,9,23],[0,43,89],[2,17,32],[0,29,70],[2,15,27],[0,30,206],[1,0,7],[2,11,23],[2,38,52],[2,22,37],[2,18,44],[2,38,50],[2,15,38],[0,38,112],[1,0,7],[2,11,29],[2,45,60],[0,20,88],[1,0,7],[2,11,26],[2,42,54]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const loadInstance = getSymbol("loadInstance");
export const getTransformMatrix = getSymbol("getTransformMatrix");
export const getNormalMatrix = getSymbol("getNormalMatrix");
