import type { LC, PropsWithChildren } from '@use-gpu/live';

import { makeDepthStencilState } from '@use-gpu/core';
import { yeet, memo } from '@use-gpu/live';

import { usePickingContext } from '../../providers/picking-provider';
import { useInspectable } from '../../hooks/useInspectable';

// Provide render context for shared picking buffer
export const PickingBuffer: LC = memo((props: PropsWithChildren<object>) => {
  const inspect = useInspectable();
  const {renderContext} = usePickingContext();

  inspect({
    output: {
      picking: renderContext.source,
    },
  });
  
  return yeet({ picking: renderContext });
}, 'PickingBuffer');
