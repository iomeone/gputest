import { ShaderStage } from '@webgpu/glslang';
import { ShaderCompiler } from '@use-gpu/core/types';
import Glslang from './glslang-web-devel/glslang';

export type Compiler = (code: string, stage: ShaderStage) => Uint32Array;

const TIMED = false;

const timed = (name: string, f: any) => {
  if (!TIMED) return f;
  return (...args: any[]) => {
    const t = +new Date();
    const v = f(...args);
    console.log(name, (+new Date() - t), 'ms');
    return v;
  }
}

const init = async (): Promise<ShaderCompiler> => {
  const glslang = await Glslang();
  return timed('compileGLSL', (code: string, stage: ShaderStage) => {
    try {
      return glslang.compileGLSL(code, stage, false);
    }
    catch (e: any) {
      const lines = code.split("\n").map((line, i) => `${i+1}: ${line}`);
      console.info(lines.join("\n"));
      throw new Error("Could not compile shader: " + e.message);
    }
  });
};

export default init;