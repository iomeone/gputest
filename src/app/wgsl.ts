import { ShaderStage } from '@webgpu/glslang';
import { ShaderCompiler } from '@use-gpu/core/types';

export type Compiler = (code: string, stage: ShaderStage) => Uint32Array;
const init = async (): Promise<ShaderCompiler> => (code: string, stage: ShaderStage) => code;

export default init;