import type { ShaderModule } from '../../shader';
import { makeContext, useContext } from '../../live';
import { vec4 } from 'gl-matrix';

export type TransformContextProps = ShaderModule | null;

const DEFAULT_TRANSFORM = null;

export const TransformContext = makeContext<TransformContextProps>(DEFAULT_TRANSFORM, 'TransformContext');

export const useTransformContext = () => useContext<TransformContextProps>(TransformContext);
