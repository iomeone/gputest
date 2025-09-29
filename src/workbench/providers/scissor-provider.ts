import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { ShaderModule } from '@use-gpu/shader';

import { provide, makeContext, useContext, useNoContext, useOne } from '@use-gpu/live';
import { useBoundShader } from '../hooks/useBoundShader';
import { useShaderRefs } from '../hooks/useShaderRef';

import { getScissorLevel } from '@use-gpu/wgsl/transform/scissor.wgsl';

export type ScissorContextProps = ShaderModule;

export type ScissorProps = {
  range: [number, number][],
  loop?: number[],
};

export const ScissorContext = makeContext<ScissorContextProps>(null, 'ScissorContext');

export const useScissorContext = () => useContext<ScissorContextProps | null>(ScissorContext);
export const useNoScissorContext = () => useNoContext(ScissorContext);

const NO_LOOP = [0, 0, 0, 0];

export const Scissor: LC<ScissorProps> = (props: PropsWithChildren<ScissorProps>) => {
  const {range, loop = NO_LOOP, children} = props;

  const min = useOne(() => range.map(r => r[0]), range);
  const max = useOne(() => range.map(r => r[1]), range);

  const defines = useOne(() => ({
    HAS_SCISSOR_LOOP: loop.some(x => !!x),
  }), loop);

  const bound = useBoundShader(getScissorLevel, useShaderRefs(min, max, loop), defines);

  return provide(ScissorContext, bound, children);
};
