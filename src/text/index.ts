import { FontMetrics, SpanMetrics, GlyphMetrics, GPUTextContext } from './types';

let UseGPUText: typeof import('../pkg');

const INF = 1e10;

export const GPUText = async (): Promise<GPUTextContext> => {
  if (!UseGPUText) {
    ({UseGPUText} = await import('../pkg'));
  }

  const useGPUText = UseGPUText.new();

  const measureFont = (size: number): FontMetrics => {
    return useGPUText.measure_font(size);
  }

  const measureSpans = (text: string, size: number): SpanMetrics => {
    return useGPUText.measure_spans(text, size);
  }
  
  const measureGlyph = (id: number, size: number): GlyphMetrics => {
    return useGPUText.measure_glyph(id, size);
  }
  
  return {measureFont, measureSpans, measureGlyph};
}

export const glyphToRGBA = (data: Uint8Array, w: number, h: number) => {
  const out = new Uint8Array(data.length * 4);
  let n = data.length, j = 0;
  let b = 1;
  let odd = w%2;
  for (let i = 0; i < n; ++i) {
    const v = data[i];

    //b = 1 - b;
    //if (!odd && (i % w) === 0) b = 1 - b;

    out[j++] = b && v;
    out[j++] = b && v;
    out[j++] = b && v;
    out[j++] = b && v;
  };
  return {data: out, width: w, height: h};
};

export const glyphToSDF = (
  data: Uint8Array,
  w: number,
  h: number,
  pad: number = 4,
  radius: number = 3,
  cutoff: number = 0.25,
) => {
  const wp = w + pad * 2;
  const hp = h + pad * 2;
  const np = wp * hp;
  const sp = Math.max(wp, hp);

  const out = new Uint8Array(np);

  const outer = new Float64Array(np);
  const inner = new Float64Array(np);

  const f = new Float64Array(sp);
  const z = new Float64Array(sp + 1);
  const v = new Uint16Array(sp);
  
  outer.fill(INF, 0, np);
  inner.fill(0, 0, np);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = data[y * w + x] / 255;
      if (a === 0) continue;

      const j = (y + pad) * wp + x + pad;

      if (a >= 254/255) {
        outer[j] = 0;
        inner[j] = INF
      } else {
        const d = 0.5 - a;
        outer[j] = d > 0 ? d * d : 0;
        inner[j] = d < 0 ? d * d : 0;
      }
    }
  }
  
  edt(outer, 0, 0, wp, hp, wp, f, v, z);
  edt(inner, pad, pad, w, h, wp, f, v, z);

  for (let i = 0; i < np; i++) {
      const d = Math.sqrt(outer[i]) - Math.sqrt(inner[i]);
      out[i] = Math.max(0, Math.min(255, Math.round(255 - 255 * (d / radius + cutoff))));
  } 

  return glyphToRGBA(out, wp, hp);
};

// 2D Euclidean squared distance transform by Felzenszwalb & Huttenlocher https://cs.brown.edu/~pff/papers/dt-final.pdf
function edt(data, x0, y0, width, height, gridWidth, f, v, z) {
  for (let x = x0; x < x0 + width; x++) edt1d(data, y0 * gridWidth + x, gridWidth, height, f, v, z);
  for (let y = y0; y < y0 + height; y++) edt1d(data, y * gridWidth + x0, 1, width, f, v, z);
}

// 1D squared distance transform
function edt1d(grid, offset, stride, length, f, v, z) {
  v[0] = 0;
  z[0] = -INF;
  z[1] = INF;
  f[0] = grid[offset];

  for (let q = 1, k = 0, s = 0; q < length; q++) {
    f[q] = grid[offset + q * stride];
    const q2 = q * q;
    do {
      const r = v[k];
      s = (f[q] - f[r] + q2 - r * r) / (q - r) / 2;
    } while (s <= z[k] && --k > -1);

    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = INF;
  }

  for (let q = 0, k = 0; q < length; q++) {
    while (z[k + 1] < q) k++;
    const r = v[k];
    const qr = q - r;
    grid[offset + q * stride] = f[r] + qr * qr;
  }
}
