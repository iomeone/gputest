import type { LC } from '../../../live';

import { yeet, memo } from '../../../live';

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

  return yeet({
    buffers: { picking: [renderContext] },
  });
}, 'PickingBuffer');
