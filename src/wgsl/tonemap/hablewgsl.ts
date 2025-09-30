/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("tonemapHable hable hable4 export color return".split(' '));
const table = {[S]:_(["A","B","C","D","E","F","W",0,1,2]),[W]:_([0]),[E]:[{[A]:170,[R]:_(0),[G]:1,[F]:{[N]:_(0),[T]:C,[Z]:_([3]),[P]:[{[N]:_(4),[T]:C}],[I]:_([2])}}]};
const data = {
  name: "tonemap/hable.wgsl",
  code: _(["const A = 0.15;\r\nconst B = 0.50;\r\nconst C = 0.10;\r\nconst D = 0.20;\r\nconst E = 0.02;\r\nconst F = 0.30;\r\n\r\nconst W = 11.2;\r\n\r\n// Hable 2010, \"Filmic Tonemapping Operators\"\r\n@",3," fn ",0,"(",4,": ",C,") -> ",C," {\r\n  let x = ",4," * 2.0;\r\n  ",5," ",1,"4(x);\r\n};\r\n\r\nfn ",1,"(x: f32) -> f32 {\r\n  ",5," ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;\r\n};\r\n\r\nfn ",1,"4(x: ",C,") -> ",C," {\r\n  ",5," ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;\r\n};\n"]).join(''),
  hash: 0x143f5ce37e6a7c,
  table,
  shake: [[0,[0,8,9,7]],[15,[1,8,9,7]],[32,[2,8,9,7]],[49,[3,8,9,7]],[66,[4,8,9,7]],[83,[5,8,9,7]],[100,[6]],[170,[7]],[275,[8]],[359,[9,7]]],
  tree: decompressAST([[0,0,15],[2,6,7],[0,9,26],[2,8,9],[0,9,26],[2,8,9],[0,9,26],[2,8,9],[0,9,26],[2,8,9],[0,9,26],[2,8,9],[0,9,28],[2,10,11],[0,60,164],[1,0,7],[2,11,23],[2,80,86],[0,14,97],[2,7,12],[2,38,39],[2,4,5],[2,2,3],[2,3,4],[2,2,3],[2,7,8],[2,4,5],[2,3,4],[2,2,3],[2,4,5],[2,2,3],[0,6,102],[2,7,13],[2,51,52],[2,4,5],[2,2,3],[2,3,4],[2,2,3],[2,7,8],[2,4,5],[2,3,4],[2,2,3],[2,4,5],[2,2,3]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const tonemapHable = getSymbol("tonemapHable");
