import { makeContext, useContext } from '@use-gpu/live';

export type TransformContextProps = ShaderModule | null;
const DEFAULT_TRANSFORM = null;

export const TransformContext = makeContext<TransformContextProps>(DEFAULT_TRANSFORM, 'TransformContext');

export const useTransformContext = () => useContext<TransformContextProps>(TransformContext);
