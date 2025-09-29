import { parseColor } from '@use-gpu/traits';

export const DEFAULT_STYLE_SHEET = {
  water: {
    face: {
      stroke: parseColor('#a0a7ff'),
      fill: parseColor('#30407f'),
      width: 3,
      depth: 0.5,
      zBias: 3,
    }
  },
  admin: {
    line: {
      color: parseColor('#8087ff'),
      width: 2,
      depth: 0.5,
      zBias: 2,
    },
  },
  background: {
    face: {
      fill: parseColor('#0a0a10'),
      zBias: -100,
    }
  },
};