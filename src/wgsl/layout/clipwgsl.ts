/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "../../shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("applyTransform getParent getSelf getCombinedClip getTransformedClip transformClip intersectClips optional link u32 export applyTransform return getParent transformClip".split(' '));
const table = {[S]:_([0,1,2,3,4,5,6]),[W]:_([3,4]),[X]:[{[A]:0,[R]:_(0),[G]:6,[F]:{[N]:_(0),[T]:C,[Z]:_([7,8]),[P]:[{[N]:"p",[T]:C}]}},{[A]:78,[R]:_(1),[G]:2,[F]:{[N]:_(1),[T]:C,[Z]:_([8]),[P]:[{[N]:"i",[T]:_(9)}]}},{[A]:120,[R]:_(2),[G]:6,[F]:{[N]:_(2),[T]:C,[Z]:_([7,8]),[P]:[{[N]:"i",[T]:_(9)}]}}],[E]:[{[A]:213,[R]:_(3),[G]:1,[F]:{[N]:_(3),[T]:C,[Z]:_([10]),[P]:[{[N]:"i",[T]:_(9)}],[I]:_([5,1,2,6])}},{[A]:364,[R]:_(4),[G]:1,[F]:{[N]:_(4),[T]:C,[Z]:_([10]),[P]:[{[N]:"i",[T]:_(9)}],[I]:_([5,1])}}],[L]:{[_(0)]:true,[_(1)]:true,[_(2)]:true}};
const data = {
  name: "layout/clip.wgsl",
  code: _(["@",7," @",8," fn ",0,"(p: ",C,") -> ",C," { ",12," p; }\r\n\r\n@",8," fn ",1,"(i: u32) -> ",C,";\r\n@",7," @",8," fn ",2,"(i: u32) -> ",C," { ",12," ",C,"(0.0, 0.0, 0.0, 0.0); }\r\n\r\n@",10," fn ",3,"(i: u32) -> ",C," {\r\n  let a = ",5,"(",1,"(i));\r\n  let b = ",2,"(i);\r\n  ",12," ",6,"(a, b);\r\n}\r\n\r\n@",10," fn ",4,"(i: u32) -> ",C," {\r\n  ",12," ",5,"(",1,"(i));\r\n}\r\n\r\nfn ",5,"(rect: ",C,") -> ",C," {\r\n  let ul = ",0,"(",C,"(rect.xy, 0.5, 1.0));\r\n  let br = ",0,"(",C,"(rect.zw, 0.5, 1.0));\r\n\r\n  ",12," ",C,"(ul.xy, br.xy);\r\n}\r\n\r\nfn ",6,"(a: ",C,", b: ",C,") -> ",C," {\r\n  ",12," ",C,"(max(a.xy, b.xy), min(a.zw, b.zw));\r\n}\n"]).join(''),
  hash: 0x1b33008382ecb6,
  table,
  shake: [[0,[0,5,3,4]],[78,[1,3,4]],[120,[2,3]],[213,[3]],[364,[4]],[458,[5,3,4]],[666,[6,3]]],
  tree: decompressAST([[4,0,74,0],[1,0,9],[1,10,15],[2,9,23],[1,59,98],[4,42,131,2],[1,0,9],[1,10,15],[2,9,16],[0,74,221],[1,0,7],[2,11,26],[2,50,63],[2,14,23],[2,26,33],[2,22,36],[0,28,122],[1,0,7],[2,11,29],[2,52,65],[2,14,23],[0,17,225],[2,7,20],[2,58,72],[2,58,72],[0,85,207],[2,7,21]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const getCombinedClip = getSymbol("getCombinedClip");
export const getTransformedClip = getSymbol("getTransformedClip");
