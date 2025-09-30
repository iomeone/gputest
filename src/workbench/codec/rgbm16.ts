import { toFloat16 } from '@use-gpu/core';

export const parseRGBM16 = (data: Uint8Array, width: number, height: number, flip: boolean) => {
  const out = new Uint16Array(width * height * 4);
  const count = width * height;

  const ir = flip ? 2 : 0;
  const ib = flip ? 0 : 2;

  for (let i = 0, j = 0; i < count; ++i, j += 4) {
    const m = data[j + 3];
    const r = data[j + ir];
    const g = data[j + 1];
    const b = data[j + ib];

		const scale = m / 255 / 16;
    out[j    ] = toFloat16(Math.min(r * scale, 65504));
    out[j + 1] = toFloat16(Math.min(g * scale, 65504));
    out[j + 2] = toFloat16(Math.min(b * scale, 65504));
    out[j + 3] = toFloat16(1.0);
  }

  return out;
};
