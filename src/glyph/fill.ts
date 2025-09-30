
// Fill out colors in transparent areas
// (separable version for EDT)
export const fill = (
  data: Uint8Array,
  x0: number,
  y0: number,
  width: number,
  height: number,
  gridWidth: number,
) => {
  for (let y = y0; y < y0 + height; y++) fill1d(data, y * gridWidth + x0, 1, width);
  for (let x = x0; x < x0 + width; x++) fill1d(data, y0 * gridWidth + x, gridWidth, height);
}

export const fill1d = (
  data: Uint8Array,
  offset: number,
  stride: number,
  length: number,
) => {
  let s = -1;
  for (let i = 0; i < length; ++i) {
    const o = (offset + stride * i) * 4;
    const a = data[o + 3];
    if (a > 0) {
      if (s < i - 1) {
        if (s === -1) {
          fillSpan(data, offset, stride, length, i, 0);
        }
        else {
          const m = Math.floor((s + i) / 2);
          fillSpan(data, offset, stride, length, s, m);
          fillSpan(data, offset, stride, length, i, m);
        }
      }
      s = i;
    }
  }
  if (s < length && s !== -1) {
    fillSpan(data, offset, stride, length, s, length - 1);
  }
}

export const fillSpan = (
  data: Uint8Array,
  offset: number,
  stride: number,
  length: number,
  from: number,
  to: number,
) => {
  const o = (offset + stride * from) * 4;
  const s = Math.sign(to - from);
  if (from !== to) for (let i = from + s; i*s <= to*s; i += s) {
    const t = (offset + stride * i) * 4;
    data[t]     = data[o];
    data[t + 1] = data[o + 1];
    data[t + 2] = data[o + 2];
    data[t + 3] = 255;
  }
}
