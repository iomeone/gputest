import { ShaderStage } from '@webgpu/glslang';
import { ShaderCompiler } from '@use-gpu/core/types';
import { getProgramHash } from '@use-gpu/shader';
import Glslang from './glslang-web-devel/glslang';
import LRU from 'lru-cache';

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

export const makeShaderCache = (options: Record<string, any> = {}) => new LRU<string, any>({
  max: 100,
  ...options,
});

const init = async (): Promise<ShaderCompiler> => {
  const glslang = await Glslang();
  const cache = makeShaderCache();
  return timed('compileGLSL', (code: string, stage: ShaderStage) => {
    try {
      const hash = getProgramHash(code);
      if (cache.has(hash)) {
        return cache.get(hash);
      }

      const compiled = glslang.compileGLSL(code, stage, false);
      const record = [compiled, hash];
      cache.set(hash, record);

      return record;
    }
    catch (e: any) {
      const lines = code.split("\n").map((line, i) => `${i+1}: ${line}`);
      console.info(lines.join("\n"));
      throw new Error("Could not compile shader: " + e.message);
    }
  });
};

export default init;