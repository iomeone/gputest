/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {} = symbolDictionary;
const _ = decompressString("getGridValue getGridDirection getGridMin getGridMax getGridShift STEP getGridAutoState getGridPosition symbols visibles symbol flags name f32 type link attr u32 parameters func i32 vec4<f32> bool optional base shift externals export index identifiers exports linkable return".split(' '));
const t = {[_(8)]:_([0,1,2,3,4,5,6,7]),[_(9)]:_([7]),[_(26)]:[{"at":0,[_(10)]:_(0),[_(11)]:2,[_(19)]:{[_(12)]:_(0),[_(14)]:_(13),[_(16)]:_([15]),[_(18)]:[{[_(12)]:"i",[_(14)]:_(17)}]}},{"at":39,[_(10)]:_(1),[_(11)]:2,[_(19)]:{[_(12)]:_(1),[_(14)]:_(20),[_(16)]:_([15])}},{"at":76,[_(10)]:_(2),[_(11)]:2,[_(19)]:{[_(12)]:_(2),[_(14)]:_(21),[_(16)]:_([15])}},{"at":113,[_(10)]:_(3),[_(11)]:2,[_(19)]:{[_(12)]:_(3),[_(14)]:_(21),[_(16)]:_([15])}},{"at":150,[_(10)]:_(4),[_(11)]:2,[_(19)]:{[_(12)]:_(4),[_(14)]:_(21),[_(16)]:_([15])}},{"at":228,[_(10)]:_(6),[_(11)]:6,[_(19)]:{[_(12)]:_(6),[_(14)]:_(22),[_(16)]:_([23,15]),[_(18)]:[{[_(12)]:_(24),[_(14)]:_(21)},{[_(12)]:_(25),[_(14)]:_(21)}]}}],[_(30)]:[{"at":328,[_(10)]:_(7),[_(11)]:1,[_(19)]:{[_(12)]:_(7),[_(14)]:_(21),[_(16)]:_([27]),[_(18)]:[{[_(12)]:_(28),[_(14)]:_(17)}],[_(29)]:_([2,3,1,5,4,6,0])}}],[_(31)]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true,[_(4)]:true,[_(6)]:true}};
const data = {
  "name": "plot/grid",
  "code": _(["@",15," fn ",0,"(i: u32) -> f32;\r\n@",15," fn ",1,"() -> i32;\r\n@",15," fn ",2,"() -> ",21,";\r\n@",15," fn ",3,"() -> ",21,";\r\n@",15," fn ",4,"() -> ",21,";\r\n\r\nconst ",5," = vec2<f32>(0.0, 1.0);\r\n\r\n@",23," @",15," fn ",6,"(",24,": ",21,", ",25,": ",21,") -> ",22," { ",32," true; };\r\n\r\n@",27," fn ",7,"(",28,": u32) -> ",21," {\r\n  let n = u32(LINE_DETAIL + 1);\r\n\r\n  let k = ",28," / n;\r\n  let i = select(k, k / 2, GRID_AUTO);\r\n  let v = f32(",28," % n) / f32(n - 1u);\r\n\r\n  var ",24," = mix(",2,"(), ",3,"(), v);\r\n\r\n  let dir = ",1,"();\r\n  var step: ",21,";\r\n  if      (dir == 0) { step = ",5,".yxxx; }\r\n  else if (dir == 1) { step = ",5,".xyxx; }\r\n  else if (dir == 2) { step = ",5,".xxyx; }\r\n  else               { step = ",5,".xxxy; }\r\n\r\n  if (GRID_AUTO) {\r\n    let ",25," = ",4,"();\r\n    let a = k % 2;\r\n    if (a == 1) { ",24," += ",25,"; }\r\n\r\n    let state = ",6,"(\r\n      ",24,",\r\n      select(",25,", -",25,", a == 1),\r\n    );\r\n    if (!state) {\r\n      ",32," ",21,"(0.0);\r\n    }\r\n  }\r\n\r\n  ",32," ",24," + step * ",0,"(i);\r\n}"]).join(''),
  "hash": 4477121494464091,
  "table": t,
  "shake": [[0,[0,7]],[39,[1,7]],[76,[2,7]],[113,[3,7]],[150,[4,7]],[187,[5,7]],[228,[6,7]],[328,[7]]],
  "tree": decompressAST([[1,0,36],[1,39,73],[1,37,71],[1,37,71],[1,37,73],[0,37,74],[2,10,14],[4,31,126,6],[1,0,9],[1,10,15],[2,9,25],[0,81,873],[1,0,7],[2,11,26],[2,201,211],[2,14,24],[2,33,49],[2,75,79],[2,44,48],[2,44,48],[2,44,48],[2,52,64],[2,91,107],[2,164,176]], t[S]),
};
const libs = {};
const getSymbol = (entry) => ({ module: bindEntryPoint(data, entry), libs });
export default getSymbol();
export const getGridPosition = getSymbol("getGridPosition");
