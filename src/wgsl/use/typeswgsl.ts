/* __WGSL_LOADER_GENERATED */
import {decompressAST, decompressString, symbolDictionary, bindEntryPoint} from "@use-gpu/shader/wgsl";
const {A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z} = symbolDictionary;
const _ = decompressString("Light PickVertex LightVertex SolidVertex ShadedVertex UIVertex DepthFragment DepthNormalFragment SurfaceFragment export into mat4x4<f32> position normal color opts intensity f32 cutoff kind i32 shadowMap shadowBlur shadowDepth vec2<f32> shadowBias shadowUV scissor index u32 world tangent sdfConfig sdfUV clipUV textureUV textureST repeat mode shape radius border stroke fill alpha depth occlusion albedo emissive material export struct position normal scissor".split(' '));
const table = {[Y]:_([0,1,2,3,4,5,6,7,8]),[S]:_([0,1,2,3,4,5,6,7,8]),[W]:_([0,1,2,3,4,5,6,7,8]),[E]:[{[A]:0,[R]:_(0),[G]:1,[U]:{[N]:_(0),[Z]:_([9]),[M]:[{[N]:_(10),[T]:_(11)},{[N]:_(12),[T]:C},{[N]:_(13),[T]:C},{[N]:_(14),[T]:C},{[N]:_(15),[T]:C},{[N]:_(16),[T]:_(17)},{[N]:_(18),[T]:_(17)},{[N]:_(19),[T]:_(20)},{[N]:_(21),[T]:_(20)},{[N]:_(22),[T]:_(20)},{[N]:_(23),[T]:_(24)},{[N]:_(25),[T]:C},{[N]:_(26),[T]:C}]}},{[A]:312,[R]:_(1),[G]:1,[U]:{[N]:_(1),[Z]:_([9]),[M]:[{[N]:_(12),[T]:C},{[N]:_(27),[T]:C},{[N]:_(28),[T]:_(29)}]}},{[A]:409,[R]:_(2),[G]:1,[U]:{[N]:_(2),[Z]:_([9]),[M]:[{[N]:_(12),[T]:C},{[N]:_(28),[T]:_(29)}]}},{[A]:484,[R]:_(3),[G]:1,[U]:{[N]:_(3),[Z]:_([9]),[M]:[{[N]:_(12),[T]:C},{[N]:_(14),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C},{[N]:_(27),[T]:C},{[N]:_(28),[T]:_(29)}]}},{[A]:639,[R]:_(4),[G]:1,[U]:{[N]:_(4),[Z]:_([9]),[M]:[{[N]:_(12),[T]:C},{[N]:_(30),[T]:C},{[N]:_(13),[T]:C},{[N]:_(31),[T]:C},{[N]:_(14),[T]:C},{[N]:"uv",[T]:C},{[N]:"st",[T]:C},{[N]:_(27),[T]:C},{[N]:_(28),[T]:_(29)}]}},{[A]:861,[R]:_(5),[G]:1,[U]:{[N]:_(5),[Z]:_([9]),[M]:[{[N]:_(12),[T]:C},{[N]:"uv",[T]:_(24)},{[N]:_(32),[T]:C},{[N]:_(33),[T]:_(24)},{[N]:_(34),[T]:C},{[N]:_(35),[T]:_(24)},{[N]:_(36),[T]:_(24)},{[N]:_(37),[T]:_(20)},{[N]:_(38),[T]:_(20)},{[N]:_(39),[T]:C},{[N]:_(40),[T]:C},{[N]:_(41),[T]:C},{[N]:_(42),[T]:C},{[N]:_(43),[T]:C},{[N]:_(28),[T]:_(29)}]}},{[A]:1214,[R]:_(6),[G]:1,[U]:{[N]:_(6),[Z]:_([9]),[M]:[{[N]:_(44),[T]:_(17)},{[N]:_(45),[T]:_(17)}]}},{[A]:1282,[R]:_(7),[G]:1,[U]:{[N]:_(7),[Z]:_([9]),[M]:[{[N]:_(13),[T]:C},{[N]:_(44),[T]:_(17)},{[N]:_(45),[T]:_(17)}]}},{[A]:1378,[R]:_(8),[G]:1,[U]:{[N]:_(8),[Z]:_([9]),[M]:[{[N]:_(12),[T]:C},{[N]:_(13),[T]:C},{[N]:_(46),[T]:C},{[N]:_(47),[T]:C},{[N]:_(48),[T]:C},{[N]:_(49),[T]:C},{[N]:_(45),[T]:_(17)}]}}]};
const data = {
  name: "use/types.wgsl",
  code: _(["@",9," ",51," ",0," {\r\n  ",10,": ",11,",\r\n\r\n  ",12,": ",C,",\r\n  ",13,": ",C,",\r\n  ",14,": ",C,",\r\n  ",15,": ",C,",\r\n\r\n  ",16,": f32,\r\n  ",18,": f32,\r\n  ",19,": i32,\r\n\r\n  ",21,": i32,\r\n  ",22,": i32,\r\n  ",23,": ",24,",\r\n  ",25,": ",C,",\r\n  ",26,": ",C,",\r\n};\r\n\r\n\r\n@",9," ",51," ",1," {\r\n  ",12,": ",C,",\r\n  ",27,": ",C,",\r\n  ",28,": u32,\r\n};\r\n\r\n@",9," ",51," ",0,"Vertex {\r\n  ",12,": ",C,",\r\n  ",28,": u32,\r\n};\r\n\r\n@",9," ",51," ",3," {\r\n  ",12,": ",C,",\r\n  ",14,": ",C,",\r\n  uv: ",C,",\r\n  st: ",C,",\r\n  ",27,": ",C,",\r\n  ",28,": u32,\r\n};\r\n\r\n@",9," ",51," ",4," {\r\n  ",12,": ",C,",\r\n  ",30,": ",C,",\r\n  ",13,": ",C,",\r\n  ",31,": ",C,",\r\n  ",14,": ",C,",\r\n  uv: ",C,",\r\n  st: ",C,",\r\n  ",27,": ",C,",\r\n  ",28,": u32,\r\n};\r\n\r\n@",9," ",51," ",5," {\r\n  ",12,": ",C,",\r\n\r\n  uv: ",24,",\r\n  ",32,": ",C,",\r\n  ",33,": ",24,",\r\n  ",34,": ",C,",\r\n  ",35,": ",24,",\r\n  ",36,": ",24,",\r\n  ",37,": i32,\r\n\r\n  ",38,": i32,\r\n  ",39,": ",C,",\r\n  ",40,": ",C,",\r\n  ",41,": ",C,",\r\n  ",42,": ",C,",\r\n  ",43,": ",C,",\r\n  ",28,": u32,\r\n};\r\n\r\n\r\n\r\n@",9," ",51," ",6," {\r\n  ",44,": f32,\r\n  ",45,": f32,\r\n};\r\n\r\n@",9," ",51," ",7," {\r\n  ",13,": ",C,",\r\n  ",44,": f32,\r\n  ",45,": f32,\r\n};\r\n\r\n@",9," ",51," ",8," {\r\n  ",12,": ",C,",\r\n  ",13,": ",C,",\r\n  ",46,": ",C,",\r\n  ",47,": ",C,",\r\n  ",48,": ",C,",\r\n  ",49,": ",C,",\r\n  ",45,": f32,\r\n};\n"]).join(''),
  hash: 0x1bd166b0cbd921,
  table,
  shake: [[0,[0]],[312,[1]],[409,[2]],[484,[3]],[639,[4]],[861,[5]],[1214,[6]],[1282,[7]],[1378,[8]]],
  tree: decompressAST([[0,0,305],[1,0,7],[2,15,20],[0,297,389],[1,0,7],[2,15,25],[0,82,152],[1,0,7],[2,15,26],[0,60,210],[1,0,7],[2,15,26],[0,140,357],[1,0,7],[2,15,27],[0,207,551],[1,0,7],[2,15,23],[0,338,401],[1,0,7],[2,15,28],[0,53,144],[1,0,7],[2,15,34],[0,81,272],[1,0,7],[2,15,30]], table[S]),
};

const libs = {};
const getSymbol = (entry) => ({module: bindEntryPoint(data, entry), libs});
export default getSymbol();
export const Light = getSymbol("Light");
export const PickVertex = getSymbol("PickVertex");
export const LightVertex = getSymbol("LightVertex");
export const SolidVertex = getSymbol("SolidVertex");
export const ShadedVertex = getSymbol("ShadedVertex");
export const UIVertex = getSymbol("UIVertex");
export const DepthFragment = getSymbol("DepthFragment");
export const DepthNormalFragment = getSymbol("DepthNormalFragment");
export const SurfaceFragment = getSymbol("SurfaceFragment");
