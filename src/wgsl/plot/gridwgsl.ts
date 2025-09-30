/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("getGridValue getGridDirection getGridMin getGridMax getGridShift STEP getGridAutoState getGridPosition f32 link u32 i32 bool optional base shift export index return".split(' '));
const table = {[S]:_([0,1,2,3,4,5,6,7]),[W]:_([7]),[X]:[{[A]:0,[R]:_(0),[G]:2,[F]:{[N]:_(0),[T]:_(8),[Z]:_([9]),[P]:[{[N]:"i",[T]:_(10)}]}},{[A]:39,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:_(11),[Z]:_([9])}},{[A]:76,[R]:_(2),[G]:2,[F]:{[N]:_(2),[T]:C,[Z]:_([9])}},{[A]:113,[R]:_(3),[G]:2,[F]:{[N]:_(3),[T]:C,[Z]:_([9])}},{[A]:150,[R]:_(4),[G]:2,[F]:{[N]:_(4),[T]:C,[Z]:_([9])}},{[A]:228,[R]:_(6),[G]:6,[F]:{[N]:_(6),[T]:_(12),[Z]:_([13,9]),[P]:[{[N]:_(14),[T]:C},{[N]:_(15),[T]:C}]}}],[E]:[{[A]:328,[R]:_(7),[G]:1,[F]:{[N]:_(7),[T]:C,[Z]:_([16]),[P]:[{[N]:_(17),[T]:_(10)}],[I]:_([2,3,1,5,4,6,0])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true,[_(3)]:true,[_(4)]:true,[_(6)]:true}};
const data = {
  name: "plot/grid.wgsl",
  code: _(["@",9," fn ",0,"(i: u32) -> f32;\r\n@",9," fn ",1,"() -> i32;\r\n@",9," fn ",2,"() -> ",C,";\r\n@",9," fn ",3,"() -> ",C,";\r\n@",9," fn ",4,"() -> ",C,";\r\n\r\nconst ",5," = vec2<f32>(0.0, 1.0);\r\n\r\n@",13," @",9," fn ",6,"(",14,": ",C,", ",15,": ",C,") -> ",12," { ",18," true; };\r\n\r\n@",16," fn ",7,"(",17,": u32) -> ",C," {\r\n  let n = u32(GRID_LINE_DETAIL + 1);\r\n\r\n  let k = ",17," / n;\r\n  let i = select(k, k / 2, GRID_AUTO);\r\n  let v = f32(",17," % n) / f32(n - 1u);\r\n\r\n  var ",14," = mix(",2,"(), ",3,"(), v);\r\n\r\n  let dir = ",1,"();\r\n  var step: ",C,";\r\n  if      (dir == 0) { step = ",5,".yxxx; }\r\n  else if (dir == 1) { step = ",5,".xyxx; }\r\n  else if (dir == 2) { step = ",5,".xxyx; }\r\n  else               { step = ",5,".xxxy; }\r\n\r\n  if (GRID_AUTO) {\r\n    let ",15," = ",4,"();\r\n    let a = k % 2;\r\n    if (a == 1) { ",14," += ",15,"; }\r\n\r\n    let state = ",6,"(\r\n      ",14,",\r\n      select(",15,", -",15,", a == 1),\r\n    );\r\n    if (!state) {\r\n      ",18," ",C,"(0.0);\r\n    }\r\n  }\r\n\r\n  ",18," ",14," + step * ",0,"(i);\r\n}\n"]).join(''),
  hash: 0x11a96570af5b3,
  table,
  shake: [[0,[0,7]],[39,[1,7]],[76,[2,7]],[113,[3,7]],[150,[4,7]],[187,[5,7]],[228,[6,7]],[328,[7]]],
  tree: decompressAST([[1,0,36],[1,39,73],[1,37,71],[1,37,71],[1,37,73],[0,37,74],[2,10,14],[4,31,126,6],[1,0,9],[1,10,15],[2,9,25],[0,81,878],[1,0,7],[2,11,26],[2,206,216],[2,14,24],[2,33,49],[2,75,79],[2,44,48],[2,44,48],[2,44,48],[2,52,64],[2,91,107],[2,164,176]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getGridPosition = getSymbol("getGridPosition");
