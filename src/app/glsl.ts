import { ShaderStage } from '@webgpu/glslang';
import { ShaderCompiler } from '../core/types';
import Glslang from './glslang-web-devel/glslang';

export type Compiler = (code: string, stage: ShaderStage) => Uint32Array;

const DEBUG = false;

const init = async (): Promise<ShaderCompiler> => {
  const glslang = await Glslang();
  return (code: string, stage: ShaderStage) => {
    try {
      return glslang.compileGLSL(code, stage, false);
    }
    catch (e) {
      const lines = code.split("\n").map((line, i) => `${i+1}: ${line}`);
      console.info(lines.join("\n"));
      throw new Error("Could not compile shader: " + e.message);
    }
  }
};

export default init;