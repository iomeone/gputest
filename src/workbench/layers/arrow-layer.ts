import type { LiveComponent } from '../../live';
import { memo, use } from '../../live';

import { RawArrows, RawArrowsProps } from '../primitives/raw-arrows';
import { RawLines, RawLinesProps } from '../primitives/raw-lines';

export type ArrowLayerProps = RawArrowsProps & RawLinesProps;

/** Draws line segments with optional start/end arrow heads. */
export const ArrowLayer: LiveComponent<ArrowLayerProps> = memo((props: ArrowLayerProps) => {
  return [
    use(RawLines, props),
    use(RawArrows, props),
  ];
}, 'ArrowLayer');
