import type { LC } from '@use-gpu/live';

import { yeet, memo } from '@use-gpu/live';

import { usePickingContext } from '../../providers/picking-provider';
import { useInspectable } from '../../hooks/useInspectable';

// Provide render context for shared picking buffer
export const PickingBuffer: LC = memo(() => {
  const inspect = useInspectable();
  const {renderContext} = usePickingContext();

  inspect({
    output: {
      picking: renderContext.source,
      depth: renderContext.depth,
    },
  });

  return yeet({ picking: renderContext });
}, 'PickingBuffer');
