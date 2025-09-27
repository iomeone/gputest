import { LiveComponent } from '@use-gpu/live/types';
import { memo, use } from '@use-gpu/live';

import { RawArrows, RawArrowsProps } from '../primitives/raw-arrows';
import { RawLines } from '../primitives/raw-lines';

type ArrowLayerProps = RawArrowsProps;

export const ArrowLayer: LiveComponent<ArrowLayerProps> = memo((props) => {
  return [
    use(RawLines, props),
    use(RawArrows, props),
  ];
}, 'ArrowLayer');
